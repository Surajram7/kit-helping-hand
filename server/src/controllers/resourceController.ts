import { Request, Response } from 'express';
import path from 'path';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { storageService } from '../services/storageService';
import { AuditService } from '../services/auditService';

export const getResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      resourceType,
      academicProgramId,
      batchId,
      semesterId,
      subjectId,
      universityAffiliationId,
      isSolved,
      examType,
      examYear,
      includeDrafts,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Access control: only admins/content managers can see unpublished drafts
    const isStaff = req.user && ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    if (!isStaff || includeDrafts !== 'true') {
      where.isPublished = true;
      where.isArchived = false;
    }

    if (resourceType) {
      where.resourceType = String(resourceType);
    }
    if (academicProgramId) {
      where.academicProgramId = String(academicProgramId);
    }
    if (batchId) {
      where.batchId = String(batchId);
    }
    if (semesterId) {
      where.semesterId = String(semesterId);
    }
    if (subjectId) {
      where.subjectId = String(subjectId);
    }
    if (universityAffiliationId) {
      where.universityAffiliationId = String(universityAffiliationId);
    }
    if (isSolved !== undefined) {
      where.isSolved = isSolved === 'true';
    }
    if (examType) {
      where.examType = String(examType);
    }
    if (examYear) {
      where.examYear = parseInt(String(examYear), 10);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { topic: { contains: q } },
        { lectureNumber: { contains: q } },
        { subject: { name: { contains: q } } },
        { subject: { code: { contains: q } } },
      ];
    }

    const orderByObj: any = {};
    const validSortFields = ['createdAt', 'title', 'downloadCount', 'viewCount', 'examYear'];
    const field = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    orderByObj[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [resources, totalCount] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: orderByObj,
        include: {
          academicProgram: { select: { id: true, name: true, code: true } },
          batch: { select: { id: true, name: true, code: true } },
          semester: { select: { id: true, name: true, semesterNumber: true } },
          subject: { select: { id: true, name: true, code: true } },
          universityAffiliation: { select: { id: true, name: true, shortCode: true } },
          uploadedBy: { select: { id: true, fullName: true, role: true } },
          files: true,
        },
      }),
      prisma.resource.count({ where }),
    ]);

    res.json({
      data: resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to retrieve academic resources.' });
  }
};

export const getResourceById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        academicProgram: true,
        batch: true,
        semester: true,
        subject: true,
        universityAffiliation: true,
        uploadedBy: { select: { id: true, fullName: true, role: true } },
        files: true,
      },
    });

    if (!resource) {
      res.status(404).json({ error: 'Academic resource not found.' });
      return;
    }

    const isStaff = req.user && ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    if (!resource.isPublished && !isStaff) {
      res.status(403).json({ error: 'This resource is not yet published.' });
      return;
    }

    // Increment view count asynchronously
    await prisma.resource.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve resource details.' });
  }
};

export const uploadResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    let mainFile: Express.Multer.File | undefined;
    let solutionFile: Express.Multer.File | undefined;

    if (Array.isArray(files)) {
      mainFile = files[0];
    } else if (files) {
      mainFile = files['file']?.[0] || files['mainFile']?.[0];
      solutionFile = files['solutionFile']?.[0];
    }

    if (!mainFile) {
      res.status(400).json({ error: 'Please upload at least one valid document file.' });
      return;
    }

    const {
      title,
      description,
      resourceType,
      academicProgramId,
      batchId,
      semesterId,
      subjectId,
      universityAffiliationId,
      lectureNumber,
      topic,
      examType,
      examYear,
      examSession,
      isSolved,
      isPublished,
    } = req.body;

    if (!title || !resourceType) {
      // Clean up uploaded files if metadata invalid
      storageService.deleteFile(mainFile.filename);
      if (solutionFile) storageService.deleteFile(solutionFile.filename);
      res.status(400).json({ error: 'Resource title and resource type are required.' });
      return;
    }

    const isSolvedBool = isSolved === 'true' || isSolved === true || Boolean(solutionFile);

    const resource = await prisma.resource.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        resourceType,
        academicProgramId: academicProgramId || null,
        batchId: batchId || null,
        semesterId: semesterId || null,
        subjectId: subjectId || null,
        universityAffiliationId: universityAffiliationId || null,
        lectureNumber: lectureNumber?.trim() || null,
        topic: topic?.trim() || null,
        examType: examType || null,
        examYear: examYear ? parseInt(examYear, 10) : null,
        examSession: examSession?.trim() || null,
        isSolved: isSolvedBool,
        hasSolutionFile: Boolean(solutionFile),
        isPublished: isPublished === 'true' || isPublished === true || isPublished === undefined,
        uploadedById: req.user.id,
        files: {
          create: [
            {
              fileName: mainFile.originalname,
              storageKey: mainFile.filename,
              fileSize: mainFile.size,
              mimeType: mainFile.mimetype,
              fileRole: 'MAIN',
            },
            ...(solutionFile
              ? [
                  {
                    fileName: solutionFile.originalname,
                    storageKey: solutionFile.filename,
                    fileSize: solutionFile.size,
                    mimeType: solutionFile.mimetype,
                    fileRole: 'SOLUTION',
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        files: true,
        subject: true,
        academicProgram: true,
        batch: true,
        semester: true,
        universityAffiliation: true,
      },
    });

    await AuditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'RESOURCE_UPLOAD',
      recordType: 'Resource',
      recordId: resource.id,
      details: { title: resource.title, type: resource.resourceType, filesCount: resource.files.length },
    });

    res.status(201).json(resource);
  } catch (error: any) {
    console.error('Resource upload failed:', error);
    res.status(500).json({ error: 'Failed to upload and store academic resource.' });
  }
};

export const updateResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      resourceType,
      academicProgramId,
      batchId,
      semesterId,
      subjectId,
      universityAffiliationId,
      lectureNumber,
      topic,
      examType,
      examYear,
      examSession,
      isSolved,
      isPublished,
      isArchived,
    } = req.body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(resourceType ? { resourceType } : {}),
        ...(academicProgramId !== undefined ? { academicProgramId: academicProgramId || null } : {}),
        ...(batchId !== undefined ? { batchId: batchId || null } : {}),
        ...(semesterId !== undefined ? { semesterId: semesterId || null } : {}),
        ...(subjectId !== undefined ? { subjectId: subjectId || null } : {}),
        ...(universityAffiliationId !== undefined
          ? { universityAffiliationId: universityAffiliationId || null }
          : {}),
        ...(lectureNumber !== undefined ? { lectureNumber: lectureNumber?.trim() || null } : {}),
        ...(topic !== undefined ? { topic: topic?.trim() || null } : {}),
        ...(examType !== undefined ? { examType: examType || null } : {}),
        ...(examYear !== undefined ? { examYear: examYear ? parseInt(examYear, 10) : null } : {}),
        ...(examSession !== undefined ? { examSession: examSession?.trim() || null } : {}),
        ...(isSolved !== undefined ? { isSolved: Boolean(isSolved) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(isArchived !== undefined ? { isArchived: Boolean(isArchived) } : {}),
      },
      include: {
        files: true,
        subject: true,
        academicProgram: true,
        batch: true,
        semester: true,
        universityAffiliation: true,
      },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'RESOURCE_UPDATE',
      recordType: 'Resource',
      recordId: resource.id,
      details: { title: resource.title },
    });

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resource.' });
  }
};

export const deleteResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found.' });
      return;
    }

    // Delete associated physical files safely
    for (const file of resource.files) {
      storageService.deleteFile(file.storageKey);
    }

    await prisma.resource.delete({ where: { id } });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'RESOURCE_DELETE',
      recordType: 'Resource',
      recordId: id,
      details: { title: resource.title },
    });

    res.json({ message: 'Resource and attached files deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resource.' });
  }
};

// Stream file for viewing in integrated viewer
export const viewFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const file = await prisma.resourceFile.findUnique({
      where: { id: fileId },
      include: { resource: true },
    });

    if (!file) {
      res.status(404).json({ error: 'File record not found.' });
      return;
    }

    const isStaff = req.user && ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    if (!file.resource.isPublished && !isStaff) {
      res.status(403).json({ error: 'Access denied. Document is unpublished.' });
      return;
    }

    if (!storageService.fileExists(file.storageKey)) {
      res.status(404).json({ error: 'File content not found on server vault.' });
      return;
    }

    res.setHeader('Content-Type', file.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const stream = storageService.getFileStream(file.storageKey);
    stream.pipe(res);
  } catch (error) {
    console.error('Error viewing file:', error);
    res.status(500).json({ error: 'Failed to stream document for preview.' });
  }
};

// Download file endpoint
export const downloadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const file = await prisma.resourceFile.findUnique({
      where: { id: fileId },
      include: { resource: true },
    });

    if (!file) {
      res.status(404).json({ error: 'File record not found.' });
      return;
    }

    const isStaff = req.user && ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    if (!file.resource.isPublished && !isStaff) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    if (!storageService.fileExists(file.storageKey)) {
      res.status(404).json({ error: 'File content not found on storage vault.' });
      return;
    }

    // Increment download count on the parent resource
    await prisma.resource.update({
      where: { id: file.resourceId },
      data: { downloadCount: { increment: 1 } },
    });

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);

    const stream = storageService.getFileStream(file.storageKey);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download document.' });
  }
};
