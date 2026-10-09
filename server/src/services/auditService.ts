import prisma from '../prisma/client';

export interface AuditLogParams {
  userId?: string | null;
  userEmail: string;
  action: string;
  recordType: string;
  recordId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

export class AuditService {
  public static async log(params: AuditLogParams): Promise<void> {
    try {
      const detailsStr =
        typeof params.details === 'object'
          ? JSON.stringify(params.details)
          : params.details || null;

      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          userEmail: params.userEmail,
          action: params.action,
          recordType: params.recordType,
          recordId: params.recordId || null,
          details: detailsStr,
          ipAddress: params.ipAddress || null,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }
}
