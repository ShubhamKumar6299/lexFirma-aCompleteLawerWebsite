import mongoose, { Document, Model, Schema } from 'mongoose';

export type CourtLevel = 'District Court' | 'High Court' | 'Supreme Court' | 'Tribunal' | 'Consumer Court';
export type LawyerSpecialization =
  | 'Family Law'
  | 'Criminal Law'
  | 'Civil Law'
  | 'Corporate Law'
  | 'Property & Real Estate'
  | 'Cyber Law'
  | 'Labour Law'
  | 'Taxation'
  | 'Intellectual Property'
  | 'Immigration'
  | 'Child Custody'
  | 'Divorce'
  | 'Consumer Law'
  | 'Constitutional Law'
  | 'Other';

export interface ILawyer extends Document {
  userId: mongoose.Types.ObjectId;
  barCouncilId: string;
  specializations: LawyerSpecialization[];
  bio: string;
  experience: number; // years
  locality: string;
  city: string;
  state: string;
  courtLevels: CourtLevel[];
  rating: number;
  totalRatings: number;
  solvedCases: number;
  isVerified: boolean;
  isAvailable: boolean;
  consultationFee: number;
  languages: string[];
  education: { degree: string; institution: string; year: number }[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const lawyerSchema = new Schema<ILawyer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    barCouncilId: { type: String, required: true, unique: true },
    specializations: [{ type: String, enum: [
        'Family Law','Criminal Law','Civil Law','Corporate Law','Property & Real Estate',
        'Cyber Law','Labour Law','Taxation','Intellectual Property','Immigration',
        'Child Custody','Divorce','Consumer Law','Constitutional Law','Other'
      ]}],
    bio: { type: String, maxlength: 2000 },
    experience: { type: Number, default: 0 },
    locality: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    courtLevels: [{ type: String, enum: ['District Court','High Court','Supreme Court','Tribunal','Consumer Court'] }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    solvedCases: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    consultationFee: { type: Number, default: 0 },
    languages: [{ type: String }],
    education: [{
      degree: { type: String },
      institution: { type: String },
      year: { type: Number },
    }],
    avatar: { type: String },
  },
  { timestamps: true }
);

lawyerSchema.index({ city: 1, state: 1 });
lawyerSchema.index({ specializations: 1 });
lawyerSchema.index({ courtLevels: 1 });
lawyerSchema.index({ rating: -1 });

const Lawyer: Model<ILawyer> = mongoose.model<ILawyer>('Lawyer', lawyerSchema);
export default Lawyer;
