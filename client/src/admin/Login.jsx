import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    try { await login(email, password); } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-navy-900 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-float" aria-busy={busy}>
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-navy-700">Ajay Tour and Travels</p>
        {err && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-900">{err}</p>}
        <div className="mt-5">
          <label htmlFor="a-email" className="label">Admin ID or Email</label>
          <input
            id="a-email"
            type="text"
            required
            autoComplete="username"
            className="field"
            placeholder="admin or admin@ajaytourtravels.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label htmlFor="a-pass" className="label">Password</label>
          <input
            id="a-pass"
            type="password"
            required
            autoComplete="current-password"
            className="field"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">{busy ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />Signing in…</> : 'Sign in'}</button>
      </form>
    </div>
  );
}
