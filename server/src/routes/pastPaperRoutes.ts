import { Router } from 'express';
import { getPastPapers } from '../controllers/pastPaperController';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticate, getPastPapers);

export default router;
