import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const adminOnly = [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])];

router.get('/stats', adminOnly, getDashboardStats);
router.get('/users', adminOnly, getUsers);
router.put('/users/:id/role', adminOnly, updateUserRole);
router.put('/users/:id/status', adminOnly, updateUserStatus);
router.get('/audit-logs', adminOnly, getAuditLogs);

export default router;
