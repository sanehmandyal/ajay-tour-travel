import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Lock, User, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from './auth.jsx';
import TiltCard from '../components/TiltCard.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr('');
    try {
      await login(email, password);
    } catch (ex) {
      setErr(ex.message || 'Invalid administrator credentials');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-navy-950 px-4 py-12 text-white">
      {/* VisionOS Ambient Spatial Glow & Depth Accents */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-teal-500/20 blur-[130px] filter" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-sunset-500/15 blur-[130px] filter" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" aria-hidden="true" />

      {/* Return to Public Website */}
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          <span>Return to Public Website</span>
        </Link>
        <span className="flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-300 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
          Secure Gateway
        </span>
      </div>

      {/* Spatial 3D Spotlight Tilt Card */}
      <div className="w-full max-w-md">
        <TiltCard maxTilt={5} scale={1.01} className="w-full">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 via-white/5 to-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl [box-shadow:inset_0_1px_1px_0_rgba(255,255,255,0.35),0_25px_50px_-12px_rgba(0,0,0,0.6)]">
            
            {/* Header Badge & Title */}
            <div className="text-center">
              <div className="relative mx-auto mb-4 inline-block">
                <img
                  src="/logo-round.png"
                  alt="Ajay Tour and Travels"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-400/50 shadow-lg shadow-teal-500/20"
                />
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-teal-300 bg-teal-600 text-white shadow">
                  <Lock size={12} aria-hidden="true" />
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                Admin Control Portal
              </h1>
              <p className="mt-1 text-xs font-medium tracking-wider text-teal-300/80 uppercase">
                Ajay Tour & Travels · Management Console
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-200">
                <ShieldCheck size={13} aria-hidden="true" />
                <span>Authorized Administrative Personnel Only</span>
              </div>
            </div>

            {/* Error Message */}
            {err && (
              <div role="alert" className="mt-5 rounded-2xl border border-red-500/30 bg-red-950/50 p-3.5 text-center text-xs font-medium text-red-200 backdrop-blur-sm">
                {err}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={submit} className="mt-6 space-y-4" aria-busy={busy}>
              <div>
                <label htmlFor="a-email" className="mb-1.5 block text-xs font-semibold tracking-wide text-white/90">
                  Admin Identifier or Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/50">
                    <User size={16} aria-hidden="true" />
                  </div>
                  <input
                    id="a-email"
                    type="text"
                    required
                    autoComplete="username"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 shadow-inner backdrop-blur-md transition-all duration-200 focus:border-teal-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
                    placeholder="admin or admin@ajaytourtravels.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="a-pass" className="mb-1.5 block text-xs font-semibold tracking-wide text-white/90">
                  Password Key
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/50">
                    <Lock size={16} aria-hidden="true" />
                  </div>
                  <input
                    id="a-pass"
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 pl-10 pr-11 text-sm text-white placeholder-white/40 shadow-inner backdrop-blur-md transition-all duration-200 focus:border-teal-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/60 transition hover:text-white"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA with Spatial Glow */}
              <button
                type="submit"
                disabled={busy}
                className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-teal-500/25 transition-all duration-200 hover:from-teal-400 hover:to-emerald-300 hover:shadow-xl hover:shadow-teal-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                {busy ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-navy-950" aria-hidden="true" />
                    <span>Verifying Credentials…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} aria-hidden="true" />
                    <span>Authenticate & Enter Console</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <p className="text-[11px] leading-relaxed text-white/50">
                Encrypted Session · Activity Logged & Monitored
                <br />
                Credentials managed securely in server environment
              </p>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
