import { Router } from 'express';
import { sendMessage, getMyMessages, markAsRead } from '../controllers/messageController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/', sendMessage); // Anyone can send (auth optional)
router.get('/inbox', protect, authorize('lawyer'), getMyMessages);
router.put('/:id/read', protect, authorize('lawyer'), markAsRead);

export default router;
