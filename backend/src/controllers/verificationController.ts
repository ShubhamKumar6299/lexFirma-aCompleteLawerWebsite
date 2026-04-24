import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateOtp, OTP_EXPIRY_MS, OTP_RESEND_COOLDOWN_MS, MAX_OTP_ATTEMPTS } from '../services/otpService';
import { sendEmailOtp } from '../services/emailService';
import { sendSmsOtp } from '../services/smsService';

// ─── Send Email OTP ───────────────────────────────────────────────────────────
export const sendEmailOtpHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpires +lastOtpSentAt +otpAttempts');
    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ success: false, message: 'Email is already verified' });
      return;
    }

    // Cooldown check
    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      res.status(429).json({ success: false, message: `Please wait ${waitSeconds}s before requesting a new OTP` });
      return;
    }

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendEmailOtp(email, otp);

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (err) {
    next(err);
  }
};

// ─── Verify Email OTP ─────────────────────────────────────────────────────────
export const verifyEmailHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpires +otpAttempts');
    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ success: false, message: 'Email is already verified' });
      return;
    }

    // Max attempts check
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    // Expiry check
    if (!user.emailOtp || !user.emailOtpExpires || user.emailOtpExpires.getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Verify
    if (user.emailOtp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
      res.status(400).json({ success: false, message: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      return;
    }

    // Success
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    // Check if phone verification is needed
    const needsPhoneVerification = !!user.phone && !user.isPhoneVerified;

    res.json({
      success: true,
      message: 'Email verified successfully!',
      needsPhoneVerification,
      phone: needsPhoneVerification ? user.phone : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Send Phone OTP ───────────────────────────────────────────────────────────
export const sendPhoneOtpHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, phone } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email }).select('+phoneOtp +phoneOtpExpires +lastOtpSentAt +otpAttempts');
    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email' });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(400).json({ success: false, message: 'Please verify your email first' });
      return;
    }

    const phoneNumber = phone || user.phone;
    if (!phoneNumber) {
      res.status(400).json({ success: false, message: 'No phone number associated with this account' });
      return;
    }

    if (user.isPhoneVerified) {
      res.status(400).json({ success: false, message: 'Phone is already verified' });
      return;
    }

    // Cooldown check
    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      res.status(429).json({ success: false, message: `Please wait ${waitSeconds}s before requesting a new OTP` });
      return;
    }

    const otp = generateOtp();
    user.phoneOtp = otp;
    user.phoneOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    // Update phone if provided and different
    if (phone && phone !== user.phone) {
      user.phone = phone;
    }
    await user.save();

    await sendSmsOtp(phoneNumber, otp);

    res.json({ success: true, message: 'Verification code sent to your phone' });
  } catch (err) {
    next(err);
  }
};

// ─── Verify Phone OTP ─────────────────────────────────────────────────────────
export const verifyPhoneHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+phoneOtp +phoneOtpExpires +otpAttempts');
    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email' });
      return;
    }

    if (user.isPhoneVerified) {
      res.status(400).json({ success: false, message: 'Phone is already verified' });
      return;
    }

    // Max attempts check
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    // Expiry check
    if (!user.phoneOtp || !user.phoneOtpExpires || user.phoneOtpExpires.getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Verify
    if (user.phoneOtp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
      res.status(400).json({ success: false, message: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      return;
    }

    // Success
    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ success: true, message: 'Phone verified successfully!' });
  } catch (err) {
    next(err);
  }
};

// ─── Resend OTP (unified) ────────────────────────────────────────────────────
export const resendOtpHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, type } = req.body as { email?: string; type?: 'email' | 'phone' };

    if (!email || !type) {
      res.status(400).json({ success: false, message: 'Email and type (email/phone) are required' });
      return;
    }

    if (type === 'email') {
      // Delegate to send-email-otp handler
      req.body = { email };
      return sendEmailOtpHandler(req, res, next);
    }

    if (type === 'phone') {
      req.body = { email };
      return sendPhoneOtpHandler(req, res, next);
    }

    res.status(400).json({ success: false, message: 'Invalid type. Must be "email" or "phone".' });
  } catch (err) {
    next(err);
  }
};
