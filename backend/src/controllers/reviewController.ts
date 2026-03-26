import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Lawyer from '../models/Lawyer';

// POST /api/reviews
export const createReview = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lawyerId, rating, comment, isAnonymous } = req.body;

    const existing = await Review.findOne({ lawyerId, userId: req.user._id });
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already reviewed this lawyer' });
      return;
    }

    const review = await Review.create({ lawyerId, userId: req.user._id, rating, comment, isAnonymous: isAnonymous || false });

    // Recalculate lawyer rating
    const allReviews = await Review.find({ lawyerId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Lawyer.findByIdAndUpdate(lawyerId, { rating: Math.round(avgRating * 10) / 10, totalRatings: allReviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/:lawyerId
export const getReviewsForLawyer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Review.countDocuments({ lawyerId: req.params.lawyerId });
    const reviews = await Review.find({ lawyerId: req.params.lawyerId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, reviews });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
