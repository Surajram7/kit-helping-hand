import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalContentManagers,
      totalPublishedResources,
      totalFiles,
      totalBatches,
      totalSemesters,
      totalSubjects,
      totalPastPapers,
      totalSolvedPapers,
      totalUnsolvedPapers,
      pendingRequests,
      recentResources,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'CONTENT_MANAGER' } }),
      prisma.resource.count({ where: { isPublished: true, isArchived: false } }),
      prisma.resourceFile.count(),
      prisma.batch.count({ where: { isActive: true } }),
      prisma.semester.count({ where: { isActive: true } }),
      prisma.subject.count({ where: { isActive: true } }),
      prisma.resource.count({
        where: {
          resourceType: {
            in: ['MIDTERM_PAPER', 'FINAL_TERM_PAPER', 'MOCK_EXAM', 'PREVIOUS_EXAM', 'ELADE_MATERIAL'],
          },
        },
      }),
      prisma.resource.count({
        where: {
          resourceType: {
            in: ['MIDTERM_PAPER', 'FINAL_TERM_PAPER', 'MOCK_EXAM', 'PREVIOUS_EXAM', 'ELADE_MATERIAL'],
          },
          isSolved: true,
        },
      }),
      prisma.resource.count({
        where: {
          resourceType: {
            in: ['MIDTERM_PAPER', 'FINAL_TERM_PAPER', 'MOCK_EXAM', 'PREVIOUS_EXAM', 'ELADE_MATERIAL'],
          },
          isSolved: false,
        },
      }),
      prisma.studentRequest.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'] } },
      }),
      prisma.resource.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          academicProgram: true,
          uploadedBy: { select: { fullName: true } },
        },
      }),
    ]);

    res.json({
      totalStudents,
      totalContentManagers,
      totalPublishedResources,
      totalFiles,
      totalBatches,
      totalSemesters,
      totalSubjects,
      totalPastPapers,
      totalSolvedPapers,
      totalUnsolvedPapers,
      pendingRequests,
      recentResources,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve administrative statistics.' });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, isActive, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role) where.role = String(role);
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { studentId: { contains: q } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
          role: true,
          isActive: true,
          academicProgram: { select: { id: true, name: true, code: true } },
          batch: { select: { id: true, name: true, code: true } },
          semester: { select: { id: true, name: true, semesterNumber: true } },
          universityAffiliation: { select: { id: true, name: true, shortCode: true } },
          createdAt: true,
          _count: { select: { studentRequests: true, uploadedResources: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user accounts.' });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['STUDENT', 'CONTENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role selection.' });
      return;
    }

    // Only super admin can grant or revoke super admin role
    if (role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Only a Super Administrator can assign the Super Administrator role.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, fullName: true, email: true, role: true },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'USER_ROLE_CHANGE',
      recordType: 'User',
      recordId: id,
      details: { previousRole: targetUser.role, newRole: role, targetUserEmail: targetUser.email },
    });

    res.json({ message: 'User role updated successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      res.status(400).json({ error: 'Status is required.' });
      return;
    }

    // Prevent deactivating own account
    if (req.user?.id === id && !isActive) {
      res.status(400).json({ error: 'You cannot deactivate your own account.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: { id: true, fullName: true, email: true, isActive: true },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'USER_STATUS_CHANGE',
      recordType: 'User',
      recordId: id,
      details: { isActive: Boolean(isActive), targetUserEmail: updatedUser.email },
    });

    res.json({ message: `Account ${isActive ? 'activated' : 'deactivated'} successfully.`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account status.' });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, recordType, page = '1', limit = '30' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action) where.action = String(action);
    if (recordType) where.recordType = String(recordType);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve administrative audit logs.' });
  }
};
