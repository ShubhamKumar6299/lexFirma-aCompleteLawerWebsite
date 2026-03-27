import { Router } from 'express';
import { register, login, getMe, uploadAvatar } from '../controllers/authController';
import { protect } from '../middleware/auth';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
