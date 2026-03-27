import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Lawyer from '../models/Lawyer';
import Case from '../models/Case';
import Review from '../models/Review';
import Meeting from '../models/Meeting';
import Message from '../models/Message';

type AC = Request & { user?: any };
type H = (req: AC, res: Response, next: NextFunction) => Promise<void>;

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getStats: H = async (_req, res, next) => {
  try {
    const [users, lawyers, cases, meetings, reviews, messages] = await Promise.all([
      User.countDocuments(),
      Lawyer.countDocuments(),
      Case.countDocuments(),
      Meeting.countDocuments(),
      Review.countDocuments(),
      Message.countDocuments(),
    ]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
    res.json({ success: true, stats: { users, lawyers, cases, meetings, reviews, messages }, recentUsers });
  } catch (err) { next(err); }
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const getAllUsers: H = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string;
    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-password'),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const updateUserRole: H = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'lawyer', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' }); return;
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const deleteUser: H = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// ── Lawyers ───────────────────────────────────────────────────────────────────
export const getAllLawyers: H = async (_req, res, next) => {
  try {
    const lawyers = await Lawyer.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, lawyers });
  } catch (err) { next(err); }
};

export const toggleLawyerVerified: H = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    lawyer.isVerified = !lawyer.isVerified;
    await lawyer.save();
    res.json({ success: true, lawyer });
  } catch (err) { next(err); }
};

export const toggleLawyerAvailability: H = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    lawyer.isAvailable = !lawyer.isAvailable;
    await lawyer.save();
    res.json({ success: true, lawyer });
  } catch (err) { next(err); }
};

export const deleteLawyer: H = async (req, res, next) => {
  try {
    await Lawyer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lawyer profile deleted' });
  } catch (err) { next(err); }
};

// ── Cases ─────────────────────────────────────────────────────────────────────
export const getAllCases: H = async (_req, res, next) => {
  try {
    const cases = await Case.find()
      .populate({ path: 'lawyerId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, cases });
  } catch (err) { next(err); }
};

export const deleteCase: H = async (req, res, next) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) { next(err); }
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const getAllReviews: H = async (_req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate({ path: 'lawyerId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) { next(err); }
};

export const deleteReview: H = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// ── Meetings ──────────────────────────────────────────────────────────────────
export const getAllMeetings: H = async (_req, res, next) => {
  try {
    const meetings = await Meeting.find()
      .populate('userId', 'name email')
      .populate({ path: 'lawyerId', populate: { path: 'userId', select: 'name' } })
      .sort({ scheduledAt: -1 });
    res.json({ success: true, meetings });
  } catch (err) { next(err); }
};

export const updateMeetingStatusAdmin: H = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!meeting) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json({ success: true, meeting });
  } catch (err) { next(err); }
};

export const deleteMeeting: H = async (req, res, next) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (err) { next(err); }
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const getAllMessages: H = async (_req, res, next) => {
  try {
    const messages = await Message.find()
      .populate({ path: 'lawyerId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) { next(err); }
};

export const deleteMessage: H = async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { next(err); }
};
