// In dev the Vite proxy makes /api same-origin; in production VITE_API_URL points at the Render API.
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message, details, code) { super(message); this.status = status; this.details = details; this.code = code; }
}

let csrfToken = '';
export const setCsrf = (t) => { csrfToken = t || ''; };

async function request(path, { method = 'GET', body, admin = false, raw = false } = {}) {
  const headers = {};
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (admin && method !== 'GET') headers['X-CSRF-Token'] = csrfToken;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method, headers, credentials: admin ? 'include' : 'omit',
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }
  if (admin && res.status === 401 && !path.includes('/auth/login') && typeof window !== 'undefined') window.dispatchEvent(new Event('ajt:unauthorized'));
  if (raw) { if (!res.ok) throw new ApiError(res.status, 'Download failed'); return res; }
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || !json?.success) {
    const e = json?.error;
    throw new ApiError(res.status, e?.message || 'Something went wrong. Please try again.', e?.details, e?.code);
  }
  return json;
}

export const api = {
  get: async (p) => (await request(p)).data,
  getWithMeta: (p) => request(p),
  post: async (p, body) => (await request(p, { method: 'POST', body })).data,
};
export const adminApi = {
  get: async (p) => (await request(`/api/admin${p}`, { admin: true })).data,
  getWithMeta: (p) => request(`/api/admin${p}`, { admin: true }),
  post: async (p, body) => (await request(`/api/admin${p}`, { method: 'POST', body, admin: true })).data,
  put: async (p, body) => (await request(`/api/admin${p}`, { method: 'PUT', body, admin: true })).data,
  patch: async (p, body) => (await request(`/api/admin${p}`, { method: 'PATCH', body, admin: true })).data,
  del: async (p) => (await request(`/api/admin${p}`, { method: 'DELETE', admin: true })).data,
  blob: async (p) => (await request(`/api/admin${p}`, { admin: true, raw: true })).blob(),
};
