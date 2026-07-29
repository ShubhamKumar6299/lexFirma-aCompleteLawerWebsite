import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import {
  generateOtp,
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_MS,
  MAX_OTP_ATTEMPTS,
  MIN_PASSWORD_LENGTH,
} from '../services/otpService';
import { sendPasswordResetOtp } from '../services/emailService';

/**
 * Returned for every forgot-password request, whether or not the address is
 * registered. Revealing the difference would let anyone enumerate the user
 * base one email at a time.
 */
const GENERIC_FORGOT_RESPONSE = {
  success: true,
  message: 'If an account exists for that email, a reset code has been sent.',
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+resetOtp +resetOtpExpires +resetOtpAttempts +lastResetOtpSentAt');

    // Unknown address, or a resend still inside the cooldown window: answer
    // exactly as we would on success so neither case is distinguishable.
    if (!user) {
      res.json(GENERIC_FORGOT_RESPONSE);
      return;
    }

    if (
      user.lastResetOtpSentAt &&
      Date.now() - user.lastResetOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      res.json(GENERIC_FORGOT_RESPONSE);
      return;
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    user.resetOtpAttempts = 0;
    user.lastResetOtpSentAt = new Date();
    await user.save();

    try {
      await sendPasswordResetOtp(user.email, otp);
    } catch (mailErr) {
      // Surfacing a mail failure here would also confirm the account exists.
      console.error('Failed to send password reset email:', mailErr);
    }

    res.json(GENERIC_FORGOT_RESPONSE);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
      return;
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      });
      return;
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
      .select('+password +resetOtp +resetOtpExpires +resetOtpAttempts');

    // Past this point the caller has already proved knowledge of a code, so
    // specific errors are safe — and necessary for a usable form.
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
      return;
    }

    if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
      res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.',
      });
      return;
    }

    if (user.resetOtpExpires.getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
      return;
    }

    if (user.resetOtp !== String(otp)) {
      user.resetOtpAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.resetOtpAttempts;
      res.status(400).json({
        success: false,
        message: `Invalid reset code. ${remaining} attempt(s) remaining.`,
      });
      return;
    }

    // Assigning the plaintext is correct — the schema's pre-save hook hashes it.
    user.password = password;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.lastResetOtpSentAt = undefined;

    // Completing this flow proves control of the mailbox, so an account that
    // was still pending email verification is now verified.
    user.isEmailVerified = true;

    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
};
