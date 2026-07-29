import type { Server as SocketServer } from 'socket.io';
import ChatMessage from '../models/ChatMessage';
import { socketAuth, type AuthedSocket } from '../middleware/socketAuth';
import { canAccessRoom } from '../utils/chatRoom';

const MAX_MESSAGE_LENGTH = 2000;

interface SendMessagePayload {
  roomId: string;
  content: string;
}

/**
 * Wires up the real-time chat namespace.
 *
 * Trust model: the connection is authenticated at the handshake, room access is
 * checked against the room's participants, and the sender's identity is taken
 * from the authenticated session — never from the client payload.
 */
export const registerChatGateway = (io: SocketServer): void => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { user } = (socket as AuthedSocket).data;
    console.log(`🔌 Socket connected: ${socket.id} (user ${user._id})`);

    socket.on('join_room', async (roomId: string) => {
      if (!(await canAccessRoom(user, roomId))) {
        console.warn(`⛔ Socket ${socket.id} denied access to room ${roomId}`);
        socket.emit('error', { message: 'Not authorized to join this conversation' });
        return;
      }

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', async (data: SendMessagePayload) => {
      const roomId = data?.roomId;
      const content = typeof data?.content === 'string' ? data.content.trim() : '';

      if (!content) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      if (content.length > MAX_MESSAGE_LENGTH) {
        socket.emit('error', { message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` });
        return;
      }

      // Membership is re-checked per message: joining is not a durable grant,
      // and a client can emit `send_message` without ever emitting `join_room`.
      if (!socket.rooms.has(roomId)) {
        socket.emit('error', { message: 'Not authorized to post in this conversation' });
        return;
      }

      try {
        const saved = await ChatMessage.create({
          roomId,
          senderId: user._id,
          senderName: user.name,
          senderRole: user.role,
          content,
        });

        console.log(`💬 Message saved in room ${roomId} from ${user.name}`);

        // Broadcast to everyone in the room (including sender for confirmation)
        io.to(roomId).emit('receive_message', {
          _id: saved._id,
          roomId: saved.roomId,
          senderId: saved.senderId,
          senderName: saved.senderName,
          senderRole: saved.senderRole,
          content: saved.content,
          createdAt: saved.createdAt,
        });
      } catch (err) {
        console.error('❌ Failed to save message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
