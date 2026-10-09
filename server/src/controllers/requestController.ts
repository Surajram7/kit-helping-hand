import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const createRequestSchema = z.object({
  title: z.string().min(3, 'Request title must be at least 3 characters'),
  category: z.enum([
    'LECTURE_NOTE',
    'PAST_PAPER',
    'RESOURCE_CATEGORY_SUGGESTION',
    'FILE_ISSUE_REPORT',
    'GENERAL_FEEDBACK',
  ]),
  description: z.string().min(10, 'Please describe your request in at least 10 characters'),
  semesterId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable(),
  universityAffiliationId: z.string().optional().nullable(),
});

export const createRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parseResult = createRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const {
      title,
      category,
      description,
      semesterId,
      subjectId,
      universityAffiliationId,
    } = parseResult.data;

    const request = await prisma.studentRequest.create({
      data: {
        studentId: req.user.id,
        title: title.trim(),
        category,
        description: description.trim(),
        semesterId: semesterId || null,
        subjectId: subjectId || null,
        universityAffiliationId: universityAffiliationId || null,
        status: 'SUBMITTED',
      },
      include: {
        semester: true,
        subject: true,
        universityAffiliation: true,
        student: { select: { id: true, fullName: true, email: true, studentId: true } },
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to submit request.' });
  }
};

export const getMyRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const requests = await prisma.studentRequest.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        semester: true,
        subject: true,
        universityAffiliation: true,
        comments: {
          include: {
            user: { select: { id: true, fullName: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve your requests.' });
  }
};

export const getAllRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, category, search, page = '1', limit = '25' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = String(status);
    if (category) where.category = String(category);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { student: { fullName: { contains: q } } },
        { student: { email: { contains: q } } },
      ];
    }

    const [requests, totalCount] = await Promise.all([
      prisma.studentRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, fullName: true, email: true, studentId: true } },
          semester: true,
          subject: true,
          universityAffiliation: true,
          comments: {
            include: {
              user: { select: { id: true, fullName: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.studentRequest.count({ where }),
    ]);

    res.json({
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load requests.' });
  }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'COMPLETED', 'DECLINED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid request status.' });
      return;
    }

    const request = await prisma.studentRequest.update({
      where: { id },
      data: {
        status,
        ...(adminResponse !== undefined ? { adminResponse: adminResponse?.trim() || null } : {}),
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'UPDATE_REQUEST_STATUS',
      recordType: 'StudentRequest',
      recordId: id,
      details: { newStatus: status, studentEmail: request.student.email },
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request status.' });
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      res.status(400).json({ error: 'Comment message is required.' });
      return;
    }

    const request = await prisma.studentRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ error: 'Request not found.' });
      return;
    }

    // Permission: Student can only comment on their own request; Staff can comment on any
    const isStaff = ['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    if (request.studentId !== req.user.id && !isStaff) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const createdComment = await prisma.requestComment.create({
      data: {
        requestId: id,
        userId: req.user.id,
        comment: comment.trim(),
      },
      include: {
        user: { select: { id: true, fullName: true, role: true } },
      },
    });

    res.status(201).json(createdComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};
