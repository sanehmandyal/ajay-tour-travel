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

  // 3. Localhost development
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;

  // 4. Any Vercel deployment of the project (production, preview, branch)
  if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/.test(clean)) {
    if (clean.includes('ajay-tour-travel') || clean.includes('sanehmandyal')) return true;
  }

  // 5. Render API / Frontend onrender.com
  if (/^https:\/\/ajay-tour-travel[a-z0-9-]*\.onrender\.com$/.test(clean)) return true;

  return false;
}
