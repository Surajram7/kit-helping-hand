import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

export const getPastPapers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      affiliationId,
      programId,
      semesterId,
      subjectId,
      examType,
      examYear,
      isSolved,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Filter resources that are examination papers
    const where: any = {
      isPublished: true,
      isArchived: false,
      resourceType: {
        in: ['MIDTERM_PAPER', 'FINAL_TERM_PAPER', 'MOCK_EXAM', 'PREVIOUS_EXAM', 'ELADE_MATERIAL'],
      },
    };

    if (affiliationId) {
      where.universityAffiliationId = String(affiliationId);
    }
    if (programId) {
      where.academicProgramId = String(programId);
    }
    if (semesterId) {
      where.semesterId = String(semesterId);
    }
    if (subjectId) {
      where.subjectId = String(subjectId);
    }
    if (examType) {
      where.examType = String(examType);
    }
    if (examYear) {
      where.examYear = parseInt(String(examYear), 10);
    }
    if (isSolved !== undefined) {
      where.isSolved = isSolved === 'true';
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { topic: { contains: q } },
        { subject: { name: { contains: q } } },
        { subject: { code: { contains: q } } },
        { universityAffiliation: { name: { contains: q } } },
        { universityAffiliation: { shortCode: { contains: q } } },
      ];
    }

    const [papers, totalCount, solvedCount, unsolvedCount] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ examYear: 'desc' }, { createdAt: 'desc' }],
        include: {
          academicProgram: true,
          semester: true,
          subject: true,
          universityAffiliation: true,
          files: true,
        },
      }),
      prisma.resource.count({ where }),
      prisma.resource.count({ where: { ...where, isSolved: true } }),
      prisma.resource.count({ where: { ...where, isSolved: false } }),
    ]);

    res.json({
      data: papers,
      counts: {
        total: totalCount,
        solved: solvedCount,
        unsolved: unsolvedCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('Error in getPastPapers:', error);
    res.status(500).json({ error: 'Failed to retrieve past examination papers.' });
  }
};
