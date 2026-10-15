import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu, X, Phone, MessageCircle, MapPin, Mail, Clock, Facebook, Instagram, Youtube,
  Lock, ChevronDown, Car, Compass, Package, ArrowRight, ShieldCheck, Sparkles, Navigation
} from 'lucide-react';
import { useSettings } from '../lib/useSettings.js';
import { useApi } from '../lib/data.jsx';
import { api } from '../lib/api.js';
import { localBusinessLd } from '../lib/seo.jsx';
import { Helmet } from 'react-helmet-async';

const DESTINATION_DROPDOWNS = [
  { name: 'Amb Andaura Station', desc: 'Vande Bharat & express train pickup', to: '/destinations/amb-andaura', icon: MapPin },
  { name: 'Chintpurni & Shaktipeeths', desc: 'Sacred Himachal pilgrimage circuit', to: '/destinations/chintpurni', icon: Sparkles },
  { name: 'Chandigarh & Mohali', desc: 'Airport & business transit hub', to: '/destinations/chandigarh', icon: Compass },
  { name: 'Dharamshala & Dalhousie', desc: 'Kangra valley mountain retreat', to: '/destinations/dharamshala', icon: Compass },
  { name: 'Amritsar & Golden Temple', desc: 'Spiritual & heritage taxi tour', to: '/destinations/amritsar', icon: MapPin },
  { name: 'Delhi & IGI Airport', desc: 'Comfortable long-distance outstation', to: '/destinations/delhi-airport', icon: Navigation },
];

const VEHICLE_DROPDOWNS = [
  { name: 'Maruti Suzuki Dzire', desc: 'Comfort Sedan · 4 Passengers · 2 Bags', to: '/vehicles/maruti-dzire', icon: Car },
  { name: 'Toyota Innova Crysta', desc: 'Luxury MUV · 6-7 Passengers · 4 Bags', to: '/vehicles/toyota-innova-crysta', icon: Car },
  { name: 'Maruti Suzuki Ertiga', desc: 'Spacious Family MUV · 6 Passengers', to: '/vehicles/maruti-ertiga', icon: Car },
  { name: 'Mahindra Scorpio-N', desc: 'Rugged Hill SUV · 6 Passengers', to: '/vehicles/mahindra-scorpio', icon: Car },
  { name: 'Force Tempo Traveller', desc: 'Luxury Group Coach · 12-17 Seats', to: '/vehicles/tempo-traveller', icon: Car },
];

const PACKAGE_DROPDOWNS = [
  { name: 'Himachal Pilgrimage Circuit', desc: 'Chintpurni, Jawala Ji, Kangra & Chamunda', to: '/packages', icon: Package },
  { name: 'Dharamshala & Dalhousie Tour', desc: 'Scenic mountain holiday package', to: '/packages', icon: Package },
  { name: 'Manali & Rohtang Pass Adventure', desc: 'Snow peaks & valley sightseeing', to: '/packages', icon: Package },
  { name: 'Delhi & Chandigarh Express', desc: 'Direct airport transfer & outstation travel', to: '/packages', icon: Package },
];

const SERVICE_DROPDOWNS = [
  { name: 'Outstation Cab Service', desc: 'Himachal, Punjab, Haryana & Delhi NCR', to: '/services', icon: Navigation },
  { name: 'Railway Station Pickup & Drop', desc: 'Amb Andaura, Una, Nangal & Hoshiarpur', to: '/services', icon: Compass },
  { name: 'Airport Transfers', desc: 'Chandigarh (IXC), Amritsar (ATQ), Delhi (DEL)', to: '/services', icon: Compass },
  { name: 'Local Hourly Car Rental', desc: 'Flexible shopping & family local trips', to: '/services', icon: Car },
];

function NavDropdown({ label, to, items, viewAllLabel, viewAllTo }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const onEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const onLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${
            isActive || open ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
          }`
        }
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180 text-teal-300' : 'text-white/60'}`} />
      </NavLink>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/20 bg-navy-950/95 p-2.5 shadow-2xl backdrop-blur-2xl [box-shadow:inset_0_1px_1px_0_rgba(255,255,255,0.25),0_20px_45px_-12px_rgba(0,0,0,0.7)]"
          >
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.to + item.name}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                >
                  {item.icon && <item.icon size={16} className="mt-0.5 shrink-0 text-teal-400 group-hover:text-teal-300" />}
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-teal-200">{item.name}</div>
                    {item.desc && <div className="text-[11px] text-white/60 line-clamp-1">{item.desc}</div>}
                  </div>
                </Link>
              ))}
            </div>
            {viewAllTo && (
              <div className="mt-2 border-t border-white/10 pt-2 text-center">
                <Link
                  to={viewAllTo}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-teal-300 hover:text-teal-200"
                >
                  <span>{viewAllLabel || 'View All Options'}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AnnouncementBar() {
  const s = useSettings();
  const a = s.announcement || {};
  const text = a.enabled && a.text ? a.text : s.phone ? `🚕 24/7 Cab Service from Amb Andaura & Una Station to Chandigarh & Ludhiana | Call ${s.phone}` : '';
  if (!text) return null;
  const inner = <span>{text}</span>;
  return (
    <div className="relative z-50 w-full border-b border-white/10 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 px-4 py-2 text-center text-xs font-medium text-white/95 sm:text-sm tracking-wide shadow-sm" role="region" aria-label="Announcement">
      <div className="container-x flex items-center justify-center gap-2">
        {a.enabled && a.linkUrl ? (
          a.linkUrl.startsWith('http') ? (
            <a href={a.linkUrl} className="inline-flex items-center gap-2 hover:text-teal-300 transition underline-offset-4 hover:underline">{inner}</a>
          ) : (
            <Link to={a.linkUrl} className="inline-flex items-center gap-2 hover:text-teal-300 transition underline-offset-4 hover:underline">{inner}</Link>
          )
        ) : s.callHref ? (
          <a href={s.callHref} className="inline-flex items-center gap-2 hover:text-teal-300 transition underline-offset-4 hover:underline">{inner}</a>
        ) : (
          inner
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const s = useSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a,button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
      if (e.key === 'Tab' && panelRef.current) {
        const f = [...panelRef.current.querySelectorAll('a,button')].concat(btnRef.current);
        const first = f[0]; const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open]);

  const link = ({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`;

  return (
    <div className="pointer-events-none w-full px-3 pt-2.5 sm:px-6 sm:pt-3">
      <div className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-navy-900/95 py-2 pl-5 pr-2.5 shadow-float backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white" aria-label={`${s.business.name} home`}>
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#1AA6A0" /><path d="M12 44c10-2 14-18 24-18s10 10 16 8" fill="none" stroke="#0B1B33" strokeWidth="6" strokeLinecap="round" /><circle cx="50" cy="34" r="5" fill="#F28A4B" /></svg>
          <span className="max-w-[9.5rem] truncate sm:max-w-none">{s.business.name}</span>
        </Link>

        {/* Desktop Navigation with Spatial Dropdowns */}
        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          <NavDropdown label="Destinations" to="/destinations" items={DESTINATION_DROPDOWNS} viewAllLabel="Explore All Destinations →" viewAllTo="/destinations" />
          <NavDropdown label="Vehicles & Cabs" to="/vehicles" items={VEHICLE_DROPDOWNS} viewAllLabel="View Full Fleet Lineup →" viewAllTo="/vehicles" />
          <NavDropdown label="Tour Packages" to="/packages" items={PACKAGE_DROPDOWNS} viewAllLabel="Browse All Tour Packages →" viewAllTo="/packages" />
          <NavDropdown label="Services" to="/services" items={SERVICE_DROPDOWNS} viewAllLabel="View All Services →" viewAllTo="/services" />
          <NavLink to="/blog" className={link}>Travel Tips</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
          <NavLink to="/contact" className={link}>Contact</NavLink>
        </nav>

        {/* Action Buttons: Phone + Admin Access + Book CTA */}
        <div className="flex items-center gap-2">
          {/* Admin Login Button on Public Navbar */}
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:border-teal-400/50 hover:bg-white/15 hover:text-white md:inline-flex shadow-sm"
            title="Admin Management Console"
          >
            <Lock size={12} className="text-teal-400" aria-hidden="true" />
            <span>Admin</span>
          </Link>

          {s.callHref && (
            <a
              href={s.callHref}
              className="hidden items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-semibold text-teal-200 transition-all hover:border-teal-400/60 hover:bg-teal-500/20 active:scale-95 md:inline-flex shadow-sm"
              aria-label={`Call ${s.phone}`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
              </span>
              <Phone size={13} className="text-teal-300" aria-hidden="true" />
              <span>{s.phone}</span>
            </a>
          )}

          <Link
            to="/book"
            className="hidden items-center justify-center rounded-full bg-gradient-to-r from-sunset-500 to-amber-500 px-5 py-2 text-sm font-bold text-navy-950 shadow-md shadow-sunset-500/25 transition-all duration-200 hover:from-sunset-400 hover:to-amber-400 hover:shadow-lg hover:shadow-sunset-500/35 hover:-translate-y-0.5 active:translate-y-0 sm:inline-flex"
          >
            Book Your Ride
          </Link>

          {s.callHref && (
            <a
              href={s.callHref}
              className="grid h-10 w-10 place-items-center rounded-full border border-teal-400/30 bg-teal-500/20 text-teal-300 transition hover:bg-teal-500/30 sm:hidden"
              aria-label={`Call ${s.phone}`}
            >
              <Phone size={18} aria-hidden="true" />
            </a>
          )}

          <button
            ref={btnRef}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white hover:bg-white/10 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" aria-label="Site menu"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}
            className="pointer-events-auto mx-auto mt-2 max-h-[calc(100dvh-5.5rem)] max-w-7xl overflow-y-auto rounded-3xl bg-navy-900 p-4 shadow-float xl:hidden">
            <ul className="grid gap-1">
              {[
                ['/', 'Home'],
                ['/destinations', 'Destinations'],
                ['/vehicles', 'Vehicles & Cabs'],
                ['/packages', 'Tour Packages'],
                ['/services', 'Services'],
                ['/blog', 'Travel Tips'],
                ['/about', 'About'],
                ['/contact', 'Contact'],
                ['/faq', 'FAQ']
              ].map(([to, label]) => (
                <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => `flex min-h-[48px] items-center rounded-2xl px-4 text-base font-medium ${isActive ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10'}`}>{label}</NavLink></li>
              ))}
              
              {/* Admin Portal in Mobile Menu */}
              <li className="mt-2 border-t border-white/10 pt-2">
                <Link
                  to="/admin"
                  className="flex min-h-[48px] items-center gap-2.5 rounded-2xl bg-teal-500/15 px-4 text-base font-semibold text-teal-300 transition hover:bg-teal-500/25"
                >
                  <Lock size={16} className="text-teal-400" aria-hidden="true" />
                  <span>Admin Portal Login</span>
                </Link>
              </li>
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {s.callHref && (
                <a href={s.callHref} className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-semibold text-white">
                  <Phone size={16} className="text-teal-400" aria-hidden="true" />
                  Call Now
                </a>
              )}
              {s.waHref && (
                <a href={s.waHref('Hello Ajay Tour and Travels, I would like to book a taxi.')} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#25D366]/20 text-sm font-semibold text-[#25D366]">
                  <MessageCircle size={16} aria-hidden="true" />
                  WhatsApp
                </a>
              )}
            </div>
            <Link to="/book" className="btn-primary mt-2 w-full">Book Your Ride</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Footer() {
  const s = useSettings();
  const b = s.business;
  const { data: dests } = useApi('destinations', () => api.get('/api/destinations'));
  const places = (dests || []).filter((d) => d.kind === 'place');
  const routes = (dests || []).filter((d) => d.kind === 'route');
  const col = 'text-sm text-white/75 hover:text-white hover:underline underline-offset-2';
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl">{b.name}</p>
          <p className="mt-3 text-sm leading-6 text-white/70">{s.footer?.about || b.tagline || 'Local and outstation taxi service and tour planning.'}</p>
          <div className="mt-4 flex gap-2">
            {[['facebook', Facebook, 'Facebook'], ['instagram', Instagram, 'Instagram'], ['youtube', Youtube, 'YouTube']].map(([k, Icon, label]) => s.social?.[k]
              ? <a key={k} href={s.social[k]} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"><Icon size={18} aria-hidden="true" /></a> : null)}
          </div>
        </div>
        <nav aria-label="Destinations">
          <p className="font-semibold">Destinations</p>
          <ul className="mt-3 space-y-2">{places.map((d) => <li key={d.slug}><Link className={col} to={`/destinations/${d.slug}`}>{d.name}</Link></li>)}</ul>
          {routes.length > 0 && <><p className="mt-5 font-semibold">Routes</p><ul className="mt-3 space-y-2">{routes.map((d) => <li key={d.slug}><Link className={col} to={`/destinations/${d.slug}`}>{d.name}</Link></li>)}</ul></>}
        </nav>
        <nav aria-label="Company">
          <p className="font-semibold">Explore</p>
          <ul className="mt-3 space-y-2">
            {[['/services', 'Services'], ['/vehicles', 'Our Vehicles'], ['/packages', 'Tour Packages'], ['/blog', 'Travel Tips'], ['/faq', 'FAQ'], ['/about', 'About Us'], ['/contact', 'Contact'], ['/book', 'Book a Trip'], ['/admin', 'Admin Portal']].map(([to, l]) => <li key={to}><Link className={col} to={to}>{l}</Link></li>)}
          </ul>
          <p className="mt-5 font-semibold">Legal</p>
          <ul className="mt-3 space-y-2"><li><Link className={col} to="/privacy-policy">Privacy Policy</Link></li><li><Link className={col} to="/terms-and-conditions">Terms and Conditions</Link></li></ul>
        </nav>
        <div>
          <p className="font-semibold">Service areas</p>
          <ul className="mt-3 space-y-1 text-sm text-white/75">{(b.serviceAreas || []).map((a) => <li key={a} className="flex items-center gap-2"><MapPin size={14} aria-hidden="true" />{a}</li>)}</ul>
          {b.contactVerified && (
            <address className="mt-5 space-y-2 text-sm not-italic text-white/75">
              {b.phone && <p className="flex items-center gap-2"><Phone size={14} aria-hidden="true" /><a href={s.callHref} className="hover:underline">{b.phone}</a></p>}
              {b.email && <p className="flex items-center gap-2"><Mail size={14} aria-hidden="true" /><a href={`mailto:${b.email}`} className="hover:underline">{b.email}</a></p>}
              {b.address && <p className="flex items-start gap-2"><MapPin size={14} className="mt-1 shrink-0" aria-hidden="true" />{b.address}</p>}
              {b.hours && <p className="flex items-center gap-2"><Clock size={14} aria-hidden="true" />{b.hours}</p>}
            </address>
          )}
          {b.googleBusinessProfileUrl && <a href={b.googleBusinessProfileUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm underline underline-offset-2">Find us on Google</a>}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        <span>{s.footer?.copyright || `© ${new Date().getFullYear()} ${b.name}. All rights reserved.`}</span>
        <span className="mx-2 text-white/20">|</span>
        <Link to="/admin" className="text-white/40 hover:text-teal-300 transition-colors">Admin Sign In</Link>
      </div>
    </footer>
  );
}

export function FloatingActions() {
  const s = useSettings();
  const wa = s.waHref('Hello Ajay Tour and Travels, I would like a travel quote.');
  const btn = 'grid h-12 w-12 place-items-center rounded-full shadow-float transition active:scale-95';
  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
      {s.callHref && <a href={s.callHref} className={`${btn} bg-navy-900 text-white`} aria-label="Call us"><Phone size={20} aria-hidden="true" /></a>}
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366] text-navy-950`} aria-label="Chat on WhatsApp"><MessageCircle size={22} aria-hidden="true" /></a>}
    </div>
  );
}

function RouteChange() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!hash) { window.scrollTo(0, 0); document.getElementById('main')?.focus({ preventScroll: true }); }
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  const s = useSettings();
  return (
    <div className="flex min-h-dvh flex-col">
      <Helmet htmlAttributes={{ lang: 'en-IN' }}>
        {s.analytics?.searchConsoleVerification && <meta name="google-site-verification" content={s.analytics.searchConsoleVerification} />}
        <script type="application/ld+json">{JSON.stringify(localBusinessLd(s)).replace(/</g, '\\u003c')}</script>
        {/^G-[A-Z0-9]+$/.test(s.analytics?.gaMeasurementId || '') && <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.analytics.gaMeasurementId}`} />}
        {/^G-[A-Z0-9]+$/.test(s.analytics?.gaMeasurementId || '') && <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${s.analytics.gaMeasurementId}',{anonymize_ip:true});`}</script>}
      </Helmet>
      <a href="#main" className="sr-only z-50 rounded-full bg-sunset-500 px-4 py-2 font-semibold text-navy-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <RouteChange />
      <header className="absolute inset-x-0 top-0 z-40 w-full">
        <AnnouncementBar />
        <Navbar />
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none"><Outlet /></main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
