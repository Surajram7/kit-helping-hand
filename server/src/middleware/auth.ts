import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import prisma from '../prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  academicProgramId?: string | null;
  batchId?: string | null;
  semesterId?: string | null;
  universityAffiliationId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No authorization token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        academicProgramId: true,
        batchId: true,
        semesterId: true,
        universityAffiliationId: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User account no longer exists.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account is deactivated. Contact KIT administration.' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    prisma.user
      .findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          academicProgramId: true,
          batchId: true,
          semesterId: true,
          universityAffiliationId: true,
        },
      })
      .then((user) => {
        if (user && user.isActive) {
          req.user = user;
        }
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of the following roles: [${roles.join(', ')}]`,
      });
      return;
    }

    next();
  };
}
