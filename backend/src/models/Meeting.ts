import mongoose, { Document, Model, Schema } from 'mongoose';

export type MeetingType = 'audio' | 'video';
export type MeetingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface IMeeting extends Document {
  lawyerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  meetingType: MeetingType;
  scheduledAt: Date;
  duration: number; // minutes
  agenda?: string;
  meetingLink?: string;
  status: MeetingStatus;
  notes?: string;
  createdAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meetingType: { type: String, enum: ['audio', 'video'], required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 30 },
    agenda: { type: String, maxlength: 500 },
    meetingLink: { type: String },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
    notes: { type: String },
  },
  { timestamps: true }
);

meetingSchema.index({ lawyerId: 1, scheduledAt: 1 });
meetingSchema.index({ userId: 1 });

const Meeting: Model<IMeeting> = mongoose.model<IMeeting>('Meeting', meetingSchema);
export default Meeting;
