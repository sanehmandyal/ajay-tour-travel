import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, lowercase: true, trim: true, sparse: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: Date,
    // Increment to invalidate every issued token for this user (logout everywhere / password change).
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

adminUserSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12);
adminUserSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
adminUserSchema.methods.isLocked = function isLocked() {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

export const AdminUser = mongoose.model('AdminUser', adminUserSchema);
