import { Router } from 'express';
import { chatbotReply } from '../controllers/chatbotController';

const router = Router();

router.post('/message', chatbotReply);

export default router;
