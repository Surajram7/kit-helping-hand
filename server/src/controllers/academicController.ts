import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

// Academic Programs
export const getPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const onlyActive = req.query.all !== 'true';
    const programs = await prisma.academicProgram.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { subjects: true, batches: true, resources: true },
        },
      },
    });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve academic programs.' });
  }
};

export const createProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Name and program code are required.' });
      return;
    }

    const program = await prisma.academicProgram.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
      },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'CREATE_PROGRAM',
      recordType: 'AcademicProgram',
      recordId: program.id,
      details: { name: program.name, code: program.code },
    });

    res.status(201).json(program);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'An academic program with this name or code already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create academic program.' });
  }
};

export const updateProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const program = await prisma.academicProgram.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'UPDATE_PROGRAM',
      recordType: 'AcademicProgram',
      recordId: program.id,
    });

    res.json(program);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update academic program.' });
  }
};

export const deleteProgram = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const program = await prisma.academicProgram.delete({ where: { id } });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'DELETE_PROGRAM',
      recordType: 'AcademicProgram',
      recordId: id,
      details: { name: program.name },
    });

    res.json({ message: 'Academic program deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete academic program.' });
  }
};

// Batches
export const getBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId, all } = req.query;
    const where: any = {};
    if (all !== 'true') where.isActive = true;
    if (programId) where.academicProgramId = String(programId);

    const batches = await prisma.batch.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        academicProgram: true,
        _count: { select: { resources: true, users: true } },
      },
    });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve batches.' });
  }
};

export const createBatch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, academicProgramId } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Batch name and batch code (e.g. F24) are required.' });
      return;
    }

    const batch = await prisma.batch.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        academicProgramId: academicProgramId || null,
      },
      include: { academicProgram: true },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'CREATE_BATCH',
      recordType: 'Batch',
      recordId: batch.id,
      details: { name: batch.name, code: batch.code },
    });

    res.status(201).json(batch);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A batch with this name already exists for this program.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create batch.' });
  }
};

export const updateBatch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, academicProgramId, isActive } = req.body;

    const batch = await prisma.batch.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(academicProgramId !== undefined ? { academicProgramId: academicProgramId || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      include: { academicProgram: true },
    });

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update batch.' });
  }
};

export const deleteBatch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.batch.delete({ where: { id } });
    res.json({ message: 'Batch deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete batch.' });
  }
};

// Semesters
export const getSemesters = async (req: Request, res: Response): Promise<void> => {
  try {
    const onlyActive = req.query.all !== 'true';
    const semesters = await prisma.semester.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { semesterNumber: 'asc' },
      include: {
        _count: { select: { subjects: true, resources: true } },
      },
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve semesters.' });
  }
};

export const createSemester = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, semesterNumber } = req.body;
    if (!name || semesterNumber === undefined) {
      res.status(400).json({ error: 'Semester name and number (1-8) are required.' });
      return;
    }

    const semester = await prisma.semester.create({
      data: {
        name: name.trim(),
        semesterNumber: parseInt(semesterNumber, 10),
      },
    });

    res.status(201).json(semester);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A semester with this name or number already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create semester.' });
  }
};

export const updateSemester = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, semesterNumber, isActive } = req.body;

    const semester = await prisma.semester.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(semesterNumber !== undefined ? { semesterNumber: parseInt(semesterNumber, 10) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update semester.' });
  }
};

export const deleteSemester = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.semester.delete({ where: { id } });
    res.json({ message: 'Semester deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete semester.' });
  }
};

// University Affiliations
export const getAffiliations = async (req: Request, res: Response): Promise<void> => {
  try {
    const onlyActive = req.query.all !== 'true';
    const affiliations = await prisma.universityAffiliation.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { resources: true, users: true } },
      },
    });
    res.json(affiliations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve university affiliations.' });
  }
};

export const createAffiliation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, shortCode, description } = req.body;
    if (!name || !shortCode) {
      res.status(400).json({ error: 'Affiliation name and short code (e.g. PU, UET) are required.' });
      return;
    }

    const affiliation = await prisma.universityAffiliation.create({
      data: {
        name: name.trim(),
        shortCode: shortCode.trim().toUpperCase(),
        description: description?.trim() || null,
      },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'CREATE_AFFILIATION',
      recordType: 'UniversityAffiliation',
      recordId: affiliation.id,
      details: { name: affiliation.name, code: affiliation.shortCode },
    });

    res.status(201).json(affiliation);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'An affiliation with this name or short code already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create university affiliation.' });
  }
};

export const updateAffiliation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, shortCode, description, isActive } = req.body;

    const affiliation = await prisma.universityAffiliation.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(shortCode ? { shortCode: shortCode.trim().toUpperCase() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    res.json(affiliation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update university affiliation.' });
  }
};

export const deleteAffiliation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.universityAffiliation.delete({ where: { id } });
    res.json({ message: 'University affiliation deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete university affiliation.' });
  }
};

// Subjects
export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId, semesterId, all } = req.query;
    const where: any = {};
    if (all !== 'true') where.isActive = true;
    if (programId) where.academicProgramId = String(programId);
    if (semesterId) where.semesterId = String(semesterId);

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        academicProgram: true,
        semester: true,
        _count: { select: { resources: true } },
      },
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subjects.' });
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, academicProgramId, semesterId, description } = req.body;
    if (!name || !code || !academicProgramId || !semesterId) {
      res.status(400).json({ error: 'Name, subject code, academic program, and semester are required.' });
      return;
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        academicProgramId,
        semesterId,
        description: description?.trim() || null,
      },
      include: { academicProgram: true, semester: true },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'CREATE_SUBJECT',
      recordType: 'Subject',
      recordId: subject.id,
      details: { name: subject.name, code: subject.code },
    });

    res.status(201).json(subject);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A subject with this code already exists for this program.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create subject.' });
  }
};

export const updateSubject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, academicProgramId, semesterId, description, isActive } = req.body;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(academicProgramId ? { academicProgramId } : {}),
        ...(semesterId ? { semesterId } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      include: { academicProgram: true, semester: true },
    });

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject.' });
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.json({ message: 'Subject deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject.' });
  }
};

// Hierarchy Overview for Filter Selectors
export const getHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const [programs, semesters, affiliations] = await Promise.all([
      prisma.academicProgram.findMany({
        where: { isActive: true },
        include: {
          batches: { where: { isActive: true }, orderBy: { name: 'asc' } },
          subjects: { where: { isActive: true }, orderBy: { name: 'asc' }, include: { semester: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.semester.findMany({
        where: { isActive: true },
        orderBy: { semesterNumber: 'asc' },
      }),
      prisma.universityAffiliation.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    res.json({ programs, semesters, affiliations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load academic hierarchy.' });
  }
};
