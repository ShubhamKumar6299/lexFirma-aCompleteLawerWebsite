import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'user' | 'lawyer' | 'admin';
  content: string;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ['user', 'lawyer', 'admin'], required: true },
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
export default ChatMessage;
