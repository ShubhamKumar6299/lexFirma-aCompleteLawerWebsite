import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage extends Document {
  lawyerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    subject: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ lawyerId: 1, isRead: 1 });

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
