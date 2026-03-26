import { Request, Response, NextFunction } from 'express';
import ChatMessage from '../models/ChatMessage';
import Lawyer from '../models/Lawyer';
import User from '../models/User';

// GET /api/chat/:lawyerId/history
export const getChatHistory = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lawyerId } = req.params;
    const userId = req.user._id.toString();

    // Deterministic room id — same for both participants
    const roomId = `room_${[userId, lawyerId].sort().join('_')}`;

    const messages = await ChatMessage.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, roomId, messages });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/rooms — list all unique rooms for a lawyer (to see all their chats)
export const getLawyerChatRooms = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lawyer = await Lawyer.findOne({ userId: req.user._id });
    if (!lawyer) {
      res.status(404).json({ success: false, message: 'Lawyer profile not found' });
      return;
    }

    const lawyerId = (lawyer._id as any).toString();

    // Find all unique rooms this lawyer is part of
    const rooms = await ChatMessage.aggregate([
      { $match: { roomId: { $regex: lawyerId } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$content' },
          lastSender: { $first: '$senderName' },
          lastTime: { $first: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract the other participant's ID from roomId and resolve user info
    const enrichedRooms = await Promise.all(
      rooms.map(async (room: any) => {
        // roomId format: room_<id1>_<id2> (sorted)
        const parts = room._id.replace('room_', '').split('_');
        const otherPartyId = parts.find((id: string) => id !== lawyerId);
        let otherUser = null;
        if (otherPartyId) {
          otherUser = await User.findById(otherPartyId).select('name email avatar').lean();
        }
        return {
          ...room,
          otherUser: otherUser || { name: 'Unknown User', email: '' },
        };
      })
    );

    res.json({ success: true, rooms: enrichedRooms });
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/room/:roomId/history — get messages for a specific room
export const getChatHistoryByRoom = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roomId } = req.params;

    const messages = await ChatMessage.find({ roomId: decodeURIComponent(roomId as string) })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, roomId: decodeURIComponent(roomId as string), messages });
  } catch (err) {
    next(err);
  }
};

