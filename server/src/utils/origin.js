import { env } from '../config/env.js';

/**
 * Checks whether an incoming HTTP Origin header is allowed.
 * Permitted:
 * 1. Missing/undefined origin (e.g. server-to-server, health check, curl, or same-origin)
 * 2. Explicitly configured CLIENT_ORIGINS or SITE_URL
 * 3. Localhost / 127.0.0.1 for local development
 * 4. Any Vercel deployment for ajay-tour-travel (*.vercel.app)
 * 5. Any Render deployment for ajay-tour-travel (*.onrender.com)
 */
export function isOriginAllowed(origin) {
  if (!origin) return true;
  const clean = String(origin).trim().replace(/\/$/, '').toLowerCase();

  // 1. Explicitly configured origins in environment
  const allowed = Array.isArray(env.CLIENT_ORIGINS) ? env.CLIENT_ORIGINS : [];
  if (allowed.some((o) => o.toLowerCase() === clean)) return true;

  // 2. SITE_URL match
  if (env.SITE_URL && env.SITE_URL.replace(/\/$/, '').toLowerCase() === clean) return true;

  try {
    const url = new URL(clean);
    const host = url.hostname.toLowerCase();

    // 3. Localhost development
    if (host === 'localhost' || host === '127.0.0.1') return true;

    // 4. Any Vercel deployment (*.vercel.app)
    if (host.endsWith('.vercel.app') || host === 'vercel.app') return true;

    // 5. Any Render deployment (*.onrender.com)
    if (host.endsWith('.onrender.com') || host === 'onrender.com') return true;
  } catch {
    // Fallback if not a standard URL string
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;
  }

  return false;
}
