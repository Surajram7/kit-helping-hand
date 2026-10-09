import { Router } from 'express';
import {
  getResources,
  getResourceById,
  uploadResource,
  updateResource,
  deleteResource,
  viewFile,
  downloadFile,
} from '../controllers/resourceController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const staffOnly = [authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'])];

// Public / Authenticated read routes
router.get('/', optionalAuthenticate, getResources);
router.get('/:id', optionalAuthenticate, getResourceById);
router.get('/files/:fileId/view', optionalAuthenticate, viewFile);
router.get('/files/:fileId/download', optionalAuthenticate, downloadFile);

// Staff management routes
router.post(
  '/',
  staffOnly,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'solutionFile', maxCount: 1 },
  ]),
  uploadResource
);
router.put('/:id', staffOnly, updateResource);
router.delete('/:id', staffOnly, deleteResource);

export default router;
