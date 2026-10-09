import multer from 'multer';
import path from 'path';
import { storageService } from '../services/storageService';
import { config } from '../config';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageService.getVaultDir());
  },
  filename: (req, file, cb) => {
    const safeKey = storageService.generateSafeKey(file.originalname);
    cb(null, safeKey);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
];

const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.jpg', '.jpeg', '.png'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) && (allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${ext}). Only PDF, Word, PowerPoint, ZIP, and image documents are accepted.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
});
