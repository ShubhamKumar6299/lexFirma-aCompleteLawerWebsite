import { Router } from 'express';
import { createReview, getReviewsForLawyer, deleteReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/:lawyerId', getReviewsForLawyer);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
