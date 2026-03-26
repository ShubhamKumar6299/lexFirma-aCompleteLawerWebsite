import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getStats,
  getAllUsers, updateUserRole, deleteUser,
  getAllLawyers, toggleLawyerVerified, toggleLawyerAvailability, deleteLawyer,
  getAllCases, deleteCase,
  getAllReviews, deleteReview,
  getAllMeetings, updateMeetingStatusAdmin, deleteMeeting,
} from '../controllers/adminController';

const router = Router();
const adminOnly = [protect, authorize('admin')];

router.get('/stats', ...adminOnly, getStats);

router.get('/users', ...adminOnly, getAllUsers);
router.put('/users/:id/role', ...adminOnly, updateUserRole);
router.delete('/users/:id', ...adminOnly, deleteUser);

router.get('/lawyers', ...adminOnly, getAllLawyers);
router.put('/lawyers/:id/verify', ...adminOnly, toggleLawyerVerified);
router.put('/lawyers/:id/availability', ...adminOnly, toggleLawyerAvailability);
router.delete('/lawyers/:id', ...adminOnly, deleteLawyer);

router.get('/cases', ...adminOnly, getAllCases);
router.delete('/cases/:id', ...adminOnly, deleteCase);

router.get('/reviews', ...adminOnly, getAllReviews);
router.delete('/reviews/:id', ...adminOnly, deleteReview);

router.get('/meetings', ...adminOnly, getAllMeetings);
router.put('/meetings/:id/status', ...adminOnly, updateMeetingStatusAdmin);
router.delete('/meetings/:id', ...adminOnly, deleteMeeting);

export default router;
