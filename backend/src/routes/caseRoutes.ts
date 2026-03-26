import { Router } from 'express';
import { getMyCases, createCase, updateCase, toggleCaseVisibility, deleteCase } from '../controllers/caseController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All case routes require lawyer auth
router.use(protect, authorize('lawyer'));

router.get('/', getMyCases);
router.post('/', createCase);
router.put('/:id', updateCase);
router.put('/:id/visibility', toggleCaseVisibility);
router.delete('/:id', deleteCase);

export default router;
