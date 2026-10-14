import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env.js';

const make = (opts) =>
  rateLimit({
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => isTest && !process.env.TEST_RATE_LIMIT,
    handler: (_req, res) =>
      res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } }),
    ...opts,
  });

export const apiLimiter = make({ windowMs: 15 * 60 * 1000, limit: 300 });
export const inquiryLimiter = make({ windowMs: 15 * 60 * 1000, limit: 5 });
export const loginLimiter = make({ windowMs: 15 * 60 * 1000, limit: 10 });
