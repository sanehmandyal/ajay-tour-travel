import { z } from 'zod';
import { AdminUser } from '../models/AdminUser.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/respond.js';
import { issueSession, clearSession, COOKIE_NAME } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email or Admin ID is required').max(200),
  password: z.string().min(1, 'Password is required').max(200),
});
export const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12, 'Use at least 12 characters').max(200),
});

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5Pq2dG7a1y2xvQh0Q0m3m7e0u3lq9cK'; // keeps timing similar for unknown emails
const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, username: u.username, role: u.role });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const identifier = email.trim().toLowerCase();
  const user = await AdminUser.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+passwordHash');
  const invalid = () => ApiError.unauthorized('Incorrect email or password');

  if (!user || !user.isActive) {
    await AdminUser.hashPassword(password).catch(() => DUMMY_HASH);
    throw invalid();
  }
  if (user.isLocked()) throw new ApiError(429, 'ACCOUNT_LOCKED', 'Too many failed attempts. Try again in a few minutes.');

  if (!(await user.verifyPassword(password))) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_ATTEMPTS) { user.lockUntil = new Date(Date.now() + LOCK_MS); user.failedLoginAttempts = 0; }
    await user.save();
    throw invalid();
  }
  user.failedLoginAttempts = 0; user.lockUntil = null; user.lastLoginAt = new Date();
  await user.save();
  const csrfToken = issueSession(res, user);
  ok(res, { user: publicUser(user), csrfToken });
});

export const me = asyncHandler(async (req, res) => ok(res, { user: publicUser(req.admin), csrfToken: req.csrf }));

/** Logout bumps tokenVersion so the old JWT is dead server-side, not just deleted from the browser. */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const p = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
      await AdminUser.updateOne({ _id: p.sub, tokenVersion: p.tv }, { $inc: { tokenVersion: 1 } });
    } catch { /* expired or invalid: nothing to revoke */ }
  }
  clearSession(res);
  ok(res, { loggedOut: true });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await AdminUser.findById(req.admin._id).select('+passwordHash');
  if (!(await user.verifyPassword(req.body.currentPassword))) throw ApiError.badRequest('Current password is incorrect');
  user.passwordHash = await AdminUser.hashPassword(req.body.newPassword);
  user.tokenVersion += 1;
  await user.save();
  const csrfToken = issueSession(res, user);
  ok(res, { changed: true, csrfToken });
});
