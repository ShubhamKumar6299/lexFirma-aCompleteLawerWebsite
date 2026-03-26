import { Router } from 'express';
import {
  getLawyers,
  getLawyerById,
  updateLawyer,
  createLawyerProfile,
  getMyProfile,
} from '../controllers/lawyerController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getLawyers);
router.get('/me', protect, authorize('lawyer'), getMyProfile);
router.get('/:id', getLawyerById);
router.post('/', protect, authorize('lawyer'), createLawyerProfile);
router.put('/:id', protect, authorize('lawyer'), updateLawyer);

export default router;
