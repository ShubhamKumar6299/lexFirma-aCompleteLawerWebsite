import dotenv from 'dotenv';
dotenv.config(); // ← Must be first: populates process.env before any module initializes

import express from 'express';
import http from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './config/db';
import errorHandler from './middleware/errorHandler';
import ChatMessage from './models/ChatMessage';

import authRoutes from './routes/authRoutes';
import lawyerRoutes from './routes/lawyerRoutes';
import caseRoutes from './routes/caseRoutes';
import reviewRoutes from './routes/reviewRoutes';
import meetingRoutes from './routes/meetingRoutes';
import messageRoutes from './routes/messageRoutes';
import newsRoutes from './routes/newsRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import chatRoomRoutes from './routes/chatRoomRoutes';
import adminRoutes from './routes/adminRoutes';
import { refreshNews } from './controllers/newsController';

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const CORS_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket: Socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join a deterministic chat room
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Receive and broadcast a message, then persist it
  socket.on('send_message', async (data: {
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'lawyer' | 'admin';
    content: string;
  }) => {
    try {
      const saved = await ChatMessage.create({
        roomId: data.roomId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        content: data.content,
      });

      console.log(`💬 Message saved in room ${data.roomId} from ${data.senderName}`);

      // Broadcast to everyone in the room (including sender for confirmation)
      io.to(data.roomId).emit('receive_message', {
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

// ─── Express Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chat', chatRoomRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
cron.schedule('0 */6 * * *', async () => {
  await refreshNews();
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 REST API: http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
  });
};

startServer();

export default app;
