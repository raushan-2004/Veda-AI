import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import type { UserRole } from '@veda-ai/types';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): boolean;
}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Compare password using native secure PBKDF2 algorithm
UserSchema.methods.comparePassword = function(password: string): boolean {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.passwordHash === hash;
};

// Static helper to generate secure password hash and salt
export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;
