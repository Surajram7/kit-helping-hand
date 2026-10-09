import { Router } from 'express';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  addComment,
} from '../controllers/requestController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const staffOnly = [authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'])];

// Student operations
router.post('/', authenticate, createRequest);
router.get('/my', authenticate, getMyRequests);
router.post('/:id/comments', authenticate, addComment);

// Admin operations
router.get('/', staffOnly, getAllRequests);
router.put('/:id/status', staffOnly, updateRequestStatus);

export default router;
