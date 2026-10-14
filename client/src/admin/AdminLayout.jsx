import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard, Inbox, MapPinned, Route, Car, Package, Newspaper, HelpCircle, Settings, Search, ImageIcon, KeyRound, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from './auth.jsx';

const NAV = [
  ['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/inquiries', 'Inquiries', Inbox], ['/admin/destinations', 'Destinations', MapPinned], ['/admin/routes', 'Routes', Route],
  ['/admin/vehicles', 'Vehicles', Car], ['/admin/packages', 'Packages', Package], ['/admin/blog', 'Blog', Newspaper], ['/admin/faqs', 'FAQs', HelpCircle],
  ['/admin/settings', 'Settings', Settings], ['/admin/seo', 'SEO & redirects', Search], ['/admin/media', 'Media', ImageIcon], ['/admin/account', 'Account', KeyRound],
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
      <Helmet><title>Admin | Ajay Tour and Travels</title><meta name="robots" content="noindex, nofollow, noarchive" /></Helmet>
      <aside className="hidden bg-navy-900 p-4 lg:block" aria-label="Admin navigation">
        <p className="mb-4 px-3 font-display text-lg text-white">Ajay Tour <span className="text-sunset-400">Admin</span></p>{links}{foot}
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-2 shadow-sm lg:px-8">
          <button ref={btn} type="button" className="grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100 lg:hidden" aria-label="Open navigation" aria-expanded={open} aria-controls="admin-drawer" onClick={() => setOpen(true)}><Menu aria-hidden="true" /></button>
          <p className="hidden text-sm text-navy-700 lg:block">Signed in as <strong>{user?.name}</strong></p>
          <p className="text-sm font-semibold lg:hidden">Admin</p>
          <span className="w-11 lg:hidden" />
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
            <button type="button" className="absolute inset-0 bg-navy-950/60" aria-label="Close navigation" onClick={() => setOpen(false)} tabIndex={-1} />
            <div id="admin-drawer" ref={drawer} className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-navy-900 p-4">
              <div className="mb-4 flex items-center justify-between px-1"><p className="font-display text-lg text-white">Ajay Tour Admin</p><button type="button" className="grid h-11 w-11 place-items-center rounded-xl text-white hover:bg-white/10" aria-label="Close navigation" onClick={() => { setOpen(false); btn.current?.focus(); }}><X aria-hidden="true" /></button></div>
              {links}{foot}
            </div>
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
