import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'lawyer' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailOtp?: string;
  emailOtpExpires?: Date;
  phoneOtp?: string;
  phoneOtpExpires?: Date;
  otpAttempts: number;
  lastOtpSentAt?: Date;
  // Password reset uses its own OTP fields so that requesting a reset can
  // never interfere with an in-flight signup verification.
  resetOtp?: string;
  resetOtpExpires?: Date;
  resetOtpAttempts: number;
  lastResetOtpSentAt?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'lawyer', 'admin'], default: 'user' },
    avatar: { type: String },
    phone: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    emailOtpExpires: { type: Date, select: false },
    phoneOtp: { type: String, select: false },
    phoneOtpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    lastOtpSentAt: { type: Date, select: false },
    resetOtp: { type: String, select: false },
    resetOtpExpires: { type: Date, select: false },
    resetOtpAttempts: { type: Number, default: 0, select: false },
    lastResetOtpSentAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
