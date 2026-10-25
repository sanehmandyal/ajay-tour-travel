import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env, isProd } from '../config/env.js';
import { AdminUser } from '../models/AdminUser.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isOriginAllowed } from '../utils/origin.js';

export const COOKIE_NAME = 'ajt_admin';

const UNIT = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
const maxAgeMs = () => {
  const m = String(env.JWT_EXPIRES_IN).match(/^(\d+)([smhd])$/);
  return m ? Number(m[1]) * UNIT[m[2]] : 8 * 36e5;
};

export function cookieOptions() {
  const opts = {
    httpOnly: true,
    secure: isProd || env.COOKIE_SAMESITE === 'none', // SameSite=None requires Secure
    sameSite: env.COOKIE_SAMESITE,
    path: '/',
  };
  if (env.COOKIE_DOMAIN) opts.domain = env.COOKIE_DOMAIN;
  return opts;
}

export function issueSession(res, user) {
  const csrf = crypto.randomBytes(24).toString('hex');
  const token = jwt.sign({ sub: String(user._id), tv: user.tokenVersion, csrf }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: maxAgeMs() });
  return csrf;
}

export const clearSession = (res) => res.clearCookie(COOKIE_NAME, cookieOptions());

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw ApiError.unauthorized();
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw ApiError.unauthorized('Session expired. Please sign in again.');
  }
  const user = await AdminUser.findById(payload.sub);
  if (!user || !user.isActive || user.tokenVersion !== payload.tv) throw ApiError.unauthorized('Session is no longer valid.');
  req.admin = user;
  req.csrf = payload.csrf;
  next();
});

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/** CSRF defence for cookie auth: allowlisted Origin + per-session token echoed in X-CSRF-Token. */
export function csrfProtect(req, _res, next) {
  if (SAFE.has(req.method)) return next();
  let origin = req.get('origin');
  if (!origin && req.get('referer')) {
    try {
      origin = new URL(req.get('referer')).origin;
    } catch {}
  }
  if (origin && !isOriginAllowed(origin, req)) return next(ApiError.forbidden('Origin not allowed'));
  const sent = Buffer.from(req.get('x-csrf-token') || '');
  const expected = Buffer.from(req.csrf || '');
  if (!sent.length || sent.length !== expected.length || !crypto.timingSafeEqual(sent, expected)) {
    return next(ApiError.forbidden('Invalid CSRF token'));
  }
  return next();
}
