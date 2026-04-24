import { Router } from 'express';
import { register, login, getMe, uploadAvatar } from '../controllers/authController';
import {
  sendEmailOtpHandler,
  verifyEmailHandler,
  sendPhoneOtpHandler,
  verifyPhoneHandler,
  resendOtpHandler,
} from '../controllers/verificationController';
import { protect } from '../middleware/auth';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Verification routes
router.post('/send-email-otp', sendEmailOtpHandler);
router.post('/verify-email', verifyEmailHandler);
router.post('/send-phone-otp', sendPhoneOtpHandler);
router.post('/verify-phone', verifyPhoneHandler);
router.post('/resend-otp', resendOtpHandler);

export default router;
