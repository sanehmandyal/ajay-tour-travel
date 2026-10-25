import { env } from '../config/env.js';

/**
 * Checks whether an incoming HTTP Origin header is allowed.
 * Permitted:
 * 1. Missing/undefined origin, empty string, or 'null' (e.g. server-to-server, file uploads, privacy browsers)
 * 2. Explicitly configured CLIENT_ORIGINS or SITE_URL
 * 3. Localhost / 127.0.0.1 / private LAN IPs
 * 4. Any Vercel deployment (*.vercel.app or vercel.app)
 * 5. Any Render deployment (*.onrender.com or onrender.com)
 * 6. Any project-related domains (Himyatra, Ajay, tour, travel, sanehmandyal)
 * 7. Any same-origin or proxied request matching Host or X-Forwarded-Host
 * 8. Any request with Sec-Fetch-Site: 'same-origin' or 'same-site'
 * 9. Any authenticated admin request presenting a valid CSRF token
 */
export function isOriginAllowed(origin, req) {
  if (!origin) return true;
  const clean = String(origin).trim().replace(/\/$/, '').toLowerCase();
  if (clean === 'null' || clean === '') return true;

  // 1. Explicitly configured origins in environment
  const allowed = Array.isArray(env.CLIENT_ORIGINS) ? env.CLIENT_ORIGINS : [];
  if (allowed.some((o) => o && o.toLowerCase().trim().replace(/\/$/, '') === clean)) return true;

  // 2. SITE_URL match
  if (env.SITE_URL && env.SITE_URL.replace(/\/$/, '').toLowerCase() === clean) return true;

  try {
    const url = new URL(clean);
    const host = url.hostname.toLowerCase();

    // 3. Localhost and private LAN development
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]' ||
      /^192\.168\.\d+\.\d+$/.test(host) ||
      /^10\.\d+\.\d+\.\d+$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)
    ) return true;

    // 4. Any Vercel deployment (*.vercel.app or vercel.app)
    if (host.endsWith('.vercel.app') || host === 'vercel.app') return true;

    // 5. Any Render deployment (*.onrender.com or onrender.com)
    if (host.endsWith('.onrender.com') || host === 'onrender.com') return true;

    // 6. Any project brand domains
    if (
      host.includes('himyatra') ||
      host.includes('ajay') ||
      host.includes('tour') ||
      host.includes('travel') ||
      host.includes('sanehmandyal')
    ) return true;

    // 7. Request Host or X-Forwarded-Host comparison (Same Origin / Proxied)
    if (req) {
      const reqHost = (req.get('host') || '').toLowerCase().split(':')[0];
      const fwdHost = (req.get('x-forwarded-host') || '').toLowerCase().split(':')[0];
      if (reqHost && (host === reqHost || host.endsWith('.' + reqHost))) return true;
      if (fwdHost && (host === fwdHost || host.endsWith('.' + fwdHost))) return true;
      const secSite = req.get('sec-fetch-site');
      if (secSite === 'same-origin' || secSite === 'same-site') return true;
    }
  } catch {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) return true;
  }

  // 8. If req has same-origin sec-fetch-site
  if (req) {
    const secSite = req.get('sec-fetch-site');
    if (secSite === 'same-origin' || secSite === 'same-site') return true;
  }

  // 9. If req has verified admin session and valid CSRF token, allow origin
  if (req && req.admin && req.csrf) {
    const sent = req.get('x-csrf-token');
    if (sent && sent === req.csrf) return true;
  }

  return false;
}
