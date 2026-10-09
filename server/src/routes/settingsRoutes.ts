import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const adminOnly = [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])];

router.get('/', getSettings);
router.put('/', adminOnly, updateSettings);

export default router;
