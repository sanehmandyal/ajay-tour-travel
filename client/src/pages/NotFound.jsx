import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Helmet } from 'react-helmet-async';
import { PageHero, Cta } from '../components/ui.jsx';

export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Admin-managed redirects: if this path has one, send the visitor on. (HTTP-level 301s: see README.)
  useEffect(() => {
    api.get('/api/redirects').then((list) => {
      const m = list.find((r) => r.from === pathname);
      if (!m) return;
      if (/^https:\/\//.test(m.to)) window.location.replace(m.to); else navigate(m.to, { replace: true });
    }).catch(() => {});
  }, [pathname, navigate]);
  return (
    <>
      <Helmet><title>Page not found | Ajay Tour and Travels</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <PageHero eyebrow="Error 404" title="We could not find that page" intro="The link may be old or the page may have moved. Try one of these instead.">
        <div className="mt-7 flex flex-wrap gap-3"><Cta to="/">Go to the homepage</Cta><Cta to="/destinations" variant="ghost-light">Explore destinations</Cta><Cta to="/book" variant="ghost-light">Book a trip</Cta></div>
      </PageHero>
      <div className="container-x section"><p className="text-navy-700">Need help? <Link to="/contact" className="font-semibold text-teal-700 underline">Contact us</Link>.</p></div>
    </>
  );
}
