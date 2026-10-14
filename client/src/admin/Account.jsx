import { useState } from 'react';
import { adminApi } from '../lib/api.js';
import { useAuth } from './auth.jsx';

export default function Account() {
  const { user, refreshCsrf } = useAuth();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState({ t: '', ok: false });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (f.newPassword !== f.confirm) { setMsg({ t: 'The new passwords do not match', ok: false }); return; }
    setBusy(true); setMsg({ t: '', ok: false });
    try { const r = await adminApi.post('/auth/change-password', { currentPassword: f.currentPassword, newPassword: f.newPassword }); refreshCsrf(r.csrfToken); setF({ currentPassword: '', newPassword: '', confirm: '' }); setMsg({ t: 'Password changed. Other sessions were signed out.', ok: true }); } catch (ex) { setMsg({ t: ex.details?.[0]?.message || ex.message, ok: false }); } finally { setBusy(false); }
  }
  const inp = (k, label, ac) => <div><label htmlFor={`pw-${k}`} className="label">{label}</label><input id={`pw-${k}`} type="password" required autoComplete={ac} className="field" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>;
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-1 text-sm text-slate-600">{user?.name} · {user?.email}</p>
      <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl bg-white p-5 shadow-soft" aria-busy={busy}>
        <h2 className="text-lg font-semibold">Change password</h2>
        {inp('currentPassword', 'Current password', 'current-password')}{inp('newPassword', 'New password (12+ characters)', 'new-password')}{inp('confirm', 'Confirm new password', 'new-password')}
        <p role={msg.ok ? 'status' : 'alert'} className={`text-sm ${msg.ok ? 'text-teal-800' : 'text-red-700'}`}>{msg.t}</p>
        <button type="submit" disabled={busy} className="btn-teal">Change password</button>
      </form>
    </div>
  );
}
