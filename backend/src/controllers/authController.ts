import { Request, Response, NextFunction } from 'express';
import 'multer';
import User from '../models/User';
import Lawyer from '../models/Lawyer';
import type { AuthRequest } from '../middleware/auth';
import { uploadBufferToS3 } from '../utils/s3';
import { signAccessToken } from '../utils/jwt';
import { generateOtp, OTP_EXPIRY_MS } from '../services/otpService';
import { sendEmailOtp } from '../services/emailService';

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    // Generate email OTP
    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      isEmailVerified: false,
      isPhoneVerified: false,
      emailOtp: otp,
      emailOtpExpires: new Date(Date.now() + OTP_EXPIRY_MS),
      lastOtpSentAt: new Date(),
    });

    // Send OTP email
    try {
      await sendEmailOtp(email, otp);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
      // Still allow registration — user can resend OTP
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      requiresVerification: true,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check email verification
    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email address first',
        requiresVerification: true,
        email: user.email,
      });
      return;
    }

    // Check phone verification (only if phone was provided)
    if (user.phone && !user.isPhoneVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your phone number first',
        requiresVerification: true,
        email: user.email,
        phoneStep: true,
      });
      return;
    }

    const token = signAccessToken(user._id.toString());

    // Fetch lawyer profile if role is lawyer
    let lawyerProfile = null;
    if (user.role === 'lawyer') {
      lawyerProfile = await Lawyer.findOne({ userId: user._id }).select('_id specializations city');
    }

    res.json({
      success: true,
      token,
      // `_id` is the canonical identifier used across the app (see frontend
      // `User` type); `id` is retained so existing clients keep working.
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lawyerProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/avatar
export const uploadAvatar = async (req: AuthRequest & { file?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    // Upload the file to S3
    const s3Url = await uploadBufferToS3(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname || 'avatar.jpg'
    );

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { avatar: s3Url },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Sync to Lawyer profile if applicable
    if (user.role === 'lawyer') {
      await Lawyer.findOneAndUpdate({ userId: user._id }, { avatar: s3Url });
    }

    // Update localStorage-friendly payload
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    res.json({ success: true, user: payload });
  } catch (err) {
    next(err);
  }
};
