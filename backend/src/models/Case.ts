import mongoose, { Document, Model, Schema } from 'mongoose';

export type CaseStatus = 'Active' | 'Resolved' | 'Pending' | 'Dismissed' | 'On Hold';
export type CaseType =
  | 'Family Law' | 'Criminal Law' | 'Civil Law' | 'Corporate Law'
  | 'Property & Real Estate' | 'Cyber Law' | 'Labour Law' | 'Taxation'
  | 'Intellectual Property' | 'Immigration' | 'Child Custody' | 'Divorce'
  | 'Consumer Law' | 'Constitutional Law' | 'Other';

export interface ICase extends Document {
  lawyerId: mongoose.Types.ObjectId;
  clientName: string;
  title: string;
  description: string;
  caseType: CaseType;
  court: string;
  caseNumber?: string;
  status: CaseStatus;
  isPublic: boolean;
  filedDate: Date;
  resolvedDate?: Date;
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    clientName: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 3000 },
    caseType: { type: String, enum: [
        'Family Law','Criminal Law','Civil Law','Corporate Law','Property & Real Estate',
        'Cyber Law','Labour Law','Taxation','Intellectual Property','Immigration',
        'Child Custody','Divorce','Consumer Law','Constitutional Law','Other'
      ], required: true },
    court: { type: String, required: true },
    caseNumber: { type: String },
    status: { type: String, enum: ['Active','Resolved','Pending','Dismissed','On Hold'], default: 'Pending' },
    isPublic: { type: Boolean, default: false },
    filedDate: { type: Date, required: true },
    resolvedDate: { type: Date },
    outcome: { type: String },
  },
  { timestamps: true }
);

caseSchema.index({ lawyerId: 1, isPublic: 1 });
caseSchema.index({ status: 1 });

const Case: Model<ICase> = mongoose.model<ICase>('Case', caseSchema);
export default Case;
