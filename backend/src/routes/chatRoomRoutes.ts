import { Router } from 'express';
import { getChatHistory, getLawyerChatRooms, getChatHistoryByRoom } from '../controllers/chatRoomController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/rooms', protect, getLawyerChatRooms);
router.get('/room/:roomId/history', protect, getChatHistoryByRoom);
router.get('/:lawyerId/history', protect, getChatHistory);

export default router;
