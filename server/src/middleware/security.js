import cors from 'cors';
import helmet from 'helmet';
import { env } from '../config/env.js';

/** Exact-match allowlist. Credentialed requests never get a wildcard origin. */
export const corsMiddleware = cors({
  origin(origin, cb) {
    // Requests without an Origin header (curl, health checks, server-to-server) are not browser CORS requests.
    if (!origin) return cb(null, true);
    return cb(null, env.CLIENT_ORIGINS.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  maxAge: 600,
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } }, // API serves JSON only
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'no-referrer' },
});

const isBad = (key) => key.startsWith('$') || key.includes('.');

function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) if (!isBad(k)) out[k] = scrub(v);
    return out;
  }
  return value;
}

/** Drops keys beginning with "$" or containing "." (NoSQL operator injection). */
export function mongoSanitize(req, _res, next) {
  if (req.body) req.body = scrub(req.body);
  if (req.params) req.params = scrub(req.params);
  if (req.query) {
    const clean = scrub(req.query);
    for (const k of Object.keys(req.query)) delete req.query[k];
    Object.assign(req.query, clean);
  }
  next();
}
