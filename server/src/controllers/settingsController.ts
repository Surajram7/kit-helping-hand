import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuditService } from '../services/auditService';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: 'default',
          platformName: 'KIT Helping Hand',
          tagline: 'Your Academic Resources, All in One Place.',
          institutionName: 'Khanpur Institute of Technology',
          allowedFileTypes: 'pdf,docx,pptx,zip',
          maxFileSizeMb: 25,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve platform settings.' });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      platformName,
      tagline,
      institutionName,
      logoUrl,
      contactEmail,
      maintenanceMode,
      maintenanceNotice,
      allowedFileTypes,
      maxFileSizeMb,
    } = req.body;

    const updated = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(platformName ? { platformName: platformName.trim() } : {}),
        ...(tagline ? { tagline: tagline.trim() } : {}),
        ...(institutionName ? { institutionName: institutionName.trim() } : {}),
        ...(logoUrl !== undefined ? { logoUrl: logoUrl?.trim() || null } : {}),
        ...(contactEmail !== undefined ? { contactEmail: contactEmail?.trim() || null } : {}),
        ...(maintenanceMode !== undefined ? { maintenanceMode: Boolean(maintenanceMode) } : {}),
        ...(maintenanceNotice !== undefined ? { maintenanceNotice: maintenanceNotice?.trim() || null } : {}),
        ...(allowedFileTypes ? { allowedFileTypes } : {}),
        ...(maxFileSizeMb ? { maxFileSizeMb: parseInt(maxFileSizeMb, 10) } : {}),
      },
      create: {
        id: 'default',
        platformName: platformName || 'KIT Helping Hand',
        tagline: tagline || 'Your Academic Resources, All in One Place.',
        institutionName: institutionName || 'Khanpur Institute of Technology',
        logoUrl: logoUrl || null,
        contactEmail: contactEmail || null,
        maintenanceMode: Boolean(maintenanceMode),
        maintenanceNotice: maintenanceNotice || null,
        allowedFileTypes: allowedFileTypes || 'pdf,docx,pptx,zip',
        maxFileSizeMb: maxFileSizeMb ? parseInt(maxFileSizeMb, 10) : 25,
      },
    });

    await AuditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin',
      action: 'SETTINGS_UPDATE',
      recordType: 'PlatformSettings',
      recordId: 'default',
      details: { platformName: updated.platformName, maintenanceMode: updated.maintenanceMode },
    });

    res.json({ message: 'Platform settings updated successfully.', settings: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update platform settings.' });
  }
};
