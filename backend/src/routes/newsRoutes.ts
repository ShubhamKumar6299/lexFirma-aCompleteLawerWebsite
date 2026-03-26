import { Router } from 'express';
import { getLegalNews } from '../controllers/newsController';

const router = Router();

router.get('/', getLegalNews);

export default router;
