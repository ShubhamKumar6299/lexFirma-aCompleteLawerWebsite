import { Router } from 'express';
import { scheduleMeeting, getMyMeetings, getLawyerMeetings, updateMeetingStatus } from '../controllers/meetingController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/', protect, scheduleMeeting);
router.get('/my', protect, getMyMeetings);
router.get('/lawyer', protect, authorize('lawyer'), getLawyerMeetings);
router.put('/:id/status', protect, updateMeetingStatus);

export default router;
