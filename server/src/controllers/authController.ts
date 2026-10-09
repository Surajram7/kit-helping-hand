import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().optional(),
  academicProgramId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  semesterId: z.string().optional().nullable(),
  universityAffiliationId: z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const {
      fullName,
      email,
      password,
      studentId,
      academicProgramId,
      batchId,
      semesterId,
      universityAffiliationId,
    } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        studentId: studentId || null,
        role: 'STUDENT', // Always default to STUDENT; no client-controlled privilege escalation
        academicProgramId: academicProgramId || null,
        batchId: batchId || null,
        semesterId: semesterId || null,
        universityAffiliationId: universityAffiliationId || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        studentId: true,
        academicProgramId: true,
        batchId: true,
        semesterId: true,
        universityAffiliationId: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        academicProgram: true,
        batch: true,
        semester: true,
        universityAffiliation: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact administration.' });
      return;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Authentication successful.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        academicProgram: true,
        batch: true,
        semester: true,
        universityAffiliation: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const {
      fullName,
      studentId,
      academicProgramId,
      batchId,
      semesterId,
      universityAffiliationId,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName ? { fullName } : {}),
        studentId: studentId !== undefined ? studentId : undefined,
        academicProgramId: academicProgramId !== undefined ? academicProgramId : undefined,
        batchId: batchId !== undefined ? batchId : undefined,
        semesterId: semesterId !== undefined ? semesterId : undefined,
        universityAffiliationId:
          universityAffiliationId !== undefined ? universityAffiliationId : undefined,
      },
      include: {
        academicProgram: true,
        batch: true,
        semester: true,
        universityAffiliation: true,
      },
    });

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ error: 'Current password does not match.' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash },
    });

    await AuditService.log({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PASSWORD_CHANGE',
      recordType: 'User',
      recordId: req.user.id,
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
};
