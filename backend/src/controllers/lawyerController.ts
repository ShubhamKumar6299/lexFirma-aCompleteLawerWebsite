import { Request, Response, NextFunction } from 'express';
import Lawyer from '../models/Lawyer';
import User from '../models/User';
import Case from '../models/Case';
import Review from '../models/Review';

// GET /api/lawyers
export const getLawyers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { specialization, city, state, courtLevel, minRating, maxFee, page = 1, limit = 12 } = req.query;

    const filter: Record<string, any> = {};
    if (specialization) filter.specializations = { $in: [specialization] };
    if (city) filter.city = new RegExp(city as string, 'i');
    if (state) filter.state = new RegExp(state as string, 'i');
    if (courtLevel) filter.courtLevels = { $in: [courtLevel] };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (maxFee) filter.consultationFee = { $lte: Number(maxFee) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lawyer.countDocuments(filter);
    const lawyers = await Lawyer.find(filter)
      .populate('userId', 'name email avatar phone')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      lawyers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/lawyers/:id
export const getLawyerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).populate('userId', 'name email avatar phone');
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer not found' });
      return;
    }

    const publicCases = await Case.find({ lawyerId: lawyer._id, isPublic: true })
      .sort({ filedDate: -1 })
      .limit(10);

    const reviews = await Review.find({ lawyerId: lawyer._id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, lawyer, publicCases, reviews });
  } catch (err) {
    next(err);
  }
};

// PUT /api/lawyers/:id — update lawyer profile (lawyer only)
export const updateLawyer = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer not found' });
      return;
    }

    if (lawyer.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
      return;
    }

    const updatable = ['bio', 'specializations', 'locality', 'city', 'state', 'courtLevels',
      'consultationFee', 'languages', 'education', 'isAvailable', 'experience'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) (lawyer as any)[field] = req.body[field];
    });

    await lawyer.save();
    res.json({ success: true, lawyer });
  } catch (err) {
    next(err);
  }
};

// POST /api/lawyers — create lawyer profile (lawyer role only)
export const createLawyerProfile = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Lawyer.findOne({ userId: req.user._id });
    if (existing) {
      res.status(400).json({ success: false, message: 'Lawyer profile already exists' });
      return;
    }

    const lawyer = await Lawyer.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, lawyer });
  } catch (err) {
    next(err);
  }
};

// GET /api/lawyers/me — get logged-in lawyer's full profile
export const getMyProfile = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }
    res.json({ success: true, lawyer });
  } catch (err) {
    next(err);
  }
};
