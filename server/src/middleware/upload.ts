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

// Block dangerous executable files only, allow all academic documents, images, and archives
const blockedExecutableExtensions = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi', '.dll', '.com', '.scr', '.pif'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (blockedExecutableExtensions.includes(ext)) {
    cb(
      new Error(
        `File format (${ext}) is not permitted for security reasons. Please upload documents, images, PDFs, or archives.`
      )
    );
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
  },
});

