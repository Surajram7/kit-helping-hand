import { Router } from 'express';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getAffiliations,
  createAffiliation,
  updateAffiliation,
  deleteAffiliation,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getHierarchy,
} from '../controllers/academicController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const adminOnly = [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])];

// Hierarchy
router.get('/hierarchy', getHierarchy);

// Programs
router.get('/programs', getPrograms);
router.post('/programs', adminOnly, createProgram);
router.put('/programs/:id', adminOnly, updateProgram);
router.delete('/programs/:id', adminOnly, deleteProgram);

// Batches
router.get('/batches', getBatches);
router.post('/batches', adminOnly, createBatch);
router.put('/batches/:id', adminOnly, updateBatch);
router.delete('/batches/:id', adminOnly, deleteBatch);

// Semesters
router.get('/semesters', getSemesters);
router.post('/semesters', adminOnly, createSemester);
router.put('/semesters/:id', adminOnly, updateSemester);
router.delete('/semesters/:id', adminOnly, deleteSemester);

// University Affiliations
router.get('/affiliations', getAffiliations);
router.post('/affiliations', adminOnly, createAffiliation);
router.put('/affiliations/:id', adminOnly, updateAffiliation);
router.delete('/affiliations/:id', adminOnly, deleteAffiliation);

// Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', adminOnly, createSubject);
router.put('/subjects/:id', adminOnly, updateSubject);
router.delete('/subjects/:id', adminOnly, deleteSubject);

export default router;
