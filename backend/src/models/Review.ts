import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReview extends Document {
  lawyerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ lawyerId: 1 });
// One review per user per lawyer
reviewSchema.index({ lawyerId: 1, userId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
