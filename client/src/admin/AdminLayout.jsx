import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard, Inbox, MapPinned, Route, Car, Package, Newspaper, HelpCircle, Settings, ImageIcon, KeyRound, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from './auth.jsx';

const NAV = [
  ['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/inquiries', 'Inquiries', Inbox], ['/admin/destinations', 'Destinations', MapPinned], ['/admin/routes', 'Routes', Route],
  ['/admin/vehicles', 'Vehicles', Car], ['/admin/packages', 'Packages', Package], ['/admin/blog', 'Blog', Newspaper], ['/admin/faqs', 'FAQs', HelpCircle],
  ['/admin/settings', 'Settings', Settings], ['/admin/media', 'Media', ImageIcon], ['/admin/account', 'Account', KeyRound],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const btn = useRef(null);
  const drawer = useRef(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    drawer.current?.querySelector('a')?.focus();
    const k = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);

  const links = (
    <ul className="space-y-1">
      {NAV.map(([to, label, Icon, end]) => (
        <li key={to}><NavLink to={to} end={end} className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium ${isActive ? 'bg-teal-600 text-white' : 'text-white/80 hover:bg-white/10'}`}><Icon size={18} aria-hidden="true" />{label}</NavLink></li>
      ))}
    </ul>
  );
  const foot = (
    <div className="mt-6 space-y-1 border-t border-white/10 pt-4 text-sm">
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-white/80 hover:bg-white/10"><ExternalLink size={18} aria-hidden="true" />View website</a>
      <button type="button" onClick={logout} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-white/80 hover:bg-white/10"><LogOut size={18} aria-hidden="true" />Sign out</button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-slate-100 text-navy-900 lg:grid lg:grid-cols-[16rem_1fr]">
      <Helmet><title>Admin | Himyatra Tour and Travels</title><meta name="robots" content="noindex, nofollow, noarchive" /></Helmet>
      <aside className="hidden bg-navy-900 p-4 lg:block" aria-label="Admin navigation">
        <div className="mb-5 flex items-center gap-3 px-3">
          <img src="/logo-round.png" alt="Himyatra Tour & Travels" className="h-9 w-9 rounded-full object-cover ring-2 ring-teal-400/40" />
          <p className="font-display text-lg font-bold text-white">Himyatra Tour <span className="text-sunset-400">Admin</span></p>
        </div>
        {links}{foot}
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button ref={btn} type="button" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 lg:hidden" aria-label="Open navigation" aria-expanded={open} aria-controls="admin-drawer" onClick={() => setOpen(true)}><Menu aria-hidden="true" size={20} /></button>
            <div className="relative">
              <label htmlFor="admin-quick-jump" className="sr-only">Quick Jump Resource</label>
              <select
                id="admin-quick-jump"
                value={NAV.some(([to]) => to === pathname) ? pathname : ''}
                onChange={(e) => { if (e.target.value) window.location.pathname = e.target.value; }}
                className="rounded-xl border border-slate-300 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-navy-900 shadow-inner transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm"
              >
                <option value="" disabled>⚡ Quick Switch Section...</option>
                <option value="/admin">📊 Dashboard</option>
                <option value="/admin/destinations">📍 Destinations (Manage / Add)</option>
                <option value="/admin/vehicles">🚗 Cabs & Vehicles (Fleet)</option>
                <option value="/admin/packages">📦 Tour Packages</option>
                <option value="/admin/routes">🛣️ Routes & Fares</option>
                <option value="/admin/inquiries">📨 Customer Inquiries</option>
                <option value="/admin/blog">📝 Blog Posts</option>
                <option value="/admin/faqs">❓ FAQs</option>
                <option value="/admin/settings">⚙️ Settings</option>
                <option value="/admin/media">🖼️ Media Library</option>
                <option value="/admin/account">🔑 Account Security</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-teal-700">
              <ExternalLink size={13} aria-hidden="true" />
              <span className="hidden sm:inline">View Site</span>
            </a>
            <p className="hidden text-xs text-navy-600 sm:block">Logged in: <strong className="text-navy-900">{user?.name}</strong></p>
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
            <button type="button" className="absolute inset-0 bg-navy-950/60" aria-label="Close navigation" onClick={() => setOpen(false)} tabIndex={-1} />
            <div id="admin-drawer" ref={drawer} className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-navy-900 p-4">
              <div className="mb-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <img src="/logo-round.png" alt="Himyatra Tour & Travels" className="h-8 w-8 rounded-full object-cover ring-1 ring-teal-400/40" />
                  <p className="font-display text-lg font-bold text-white">Himyatra Tour <span className="text-sunset-400">Admin</span></p>
                </div>
                <button type="button" className="grid h-11 w-11 place-items-center rounded-xl text-white hover:bg-white/10" aria-label="Close navigation" onClick={() => { setOpen(false); btn.current?.focus(); }}><X aria-hidden="true" /></button>
              </div>
              {links}{foot}
            </div>
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
