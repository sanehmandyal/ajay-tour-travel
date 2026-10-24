import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Star, Plane, MapPin } from 'lucide-react';
import { Seo, localBusinessLd, faqPageLd, breadcrumbLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { useSettings } from '../lib/useSettings.js';
import { Reveal, SectionHeading, Cta, CardGridSkeleton, EmptyState } from '../components/ui.jsx';
import HeroShowcase from '../components/HeroShowcase.jsx';
import TiltCard from '../components/TiltCard.jsx';
import { DestinationCard, RouteCard, VehicleCard, PostCard } from '../components/cards.jsx';
import ServiceGrid from '../components/ServiceGrid.jsx';
import FaqList from '../components/FaqList.jsx';

function Hero() {
  const s = useSettings();
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const far = useTransform(scrollY, [0, 700], [0, reduce ? 0 : 70]);
  const near = useTransform(scrollY, [0, 700], [0, reduce ? 0 : 130]);
  const [q, setQ] = useState({ pickup: '', destination: '', date: '', passengers: '2', vehicle: '' });
  const { data: vehicles } = useApi('vehicles', () => api.get('/api/vehicles'));
  const set = (k) => (e) => setQ((p) => ({ ...p, [k]: e.target.value }));
  const go = (e) => { e.preventDefault(); nav(`/book?${new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([, v]) => v))).toString()}`); };
  const wa = s.waHref('Hello Himyatra Tour and Travels, I would like a travel quote.');
  const today = new Date().toISOString().slice(0, 10);
  const areas = s.business.serviceAreas || [];

  return (
    <section className="relative isolate overflow-hidden bg-navy-950 pb-20 pt-32 text-white sm:pt-40 lg:pb-28" aria-labelledby="hero-title">
      {/* Immersive Scenic Mountain Road Background */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Rohtang_pass.jpg/1280px-Rohtang_pass.jpg"
          alt="Scenic Rohtang Pass mountain highway in Himachal Pradesh"
          className="h-full w-full object-cover object-center scale-105 filter brightness-[0.34] contrast-[1.14] saturate-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/60 to-navy-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/50 to-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(26,166,160,.35),transparent),radial-gradient(50%_50%_at_10%_90%,rgba(242,138,75,.2),transparent)]" aria-hidden="true" />
      <motion.svg style={{ y: far }} viewBox="0 0 1200 300" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 w-full opacity-35" aria-hidden="true"><path d="M0 300V170l120-90 110 70 150-120 140 110 120-60 170 120 130-80 130 70 130-40v150z" fill="#12294A" /></motion.svg>
      <motion.svg style={{ y: near }} viewBox="0 0 1200 300" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full opacity-60" aria-hidden="true"><path d="M0 300V200l140-70 120 60 160-90 150 100 140-50 160 90 140-60 190 60v110z" fill="#0B1B33" /></motion.svg>

      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="eyebrow !text-teal-300">Amb Andaura · Una · Ludhiana · Chandigarh</p>
          <h1 id="hero-title" className="h-display mt-3 !text-white">{s.home?.heroHeadline || 'Comfortable rides across Punjab, Himachal and Chandigarh'}</h1>
          <p className="lead mt-5 max-w-xl !text-white/80">{s.home?.heroSubheadline || 'Local, outstation and airport transfers. Request a quote in minutes.'}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/book"
              className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-sunset-500 to-amber-500 px-7 py-3 text-base font-bold text-navy-950 shadow-lg shadow-sunset-500/30 transition-all duration-200 hover:from-sunset-400 hover:to-amber-400 hover:shadow-xl hover:shadow-sunset-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Book Your Ride</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/destinations"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-md shadow-sm transition-all duration-200 hover:border-white/60 hover:bg-white/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Destinations</span>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/15 px-4 py-2 text-xs font-semibold text-[#25D366] transition hover:bg-[#25D366]/25 hover:border-[#25D366]/60 shadow-sm"
              >
                <MessageCircle size={15} aria-hidden="true" />
                <span>WhatsApp Booking</span>
              </a>
            )}
            {s.callHref && (
              <a
                href={s.callHref}
                className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 transition hover:bg-teal-500/20 hover:border-teal-400/50 shadow-sm"
              >
                <Phone size={14} aria-hidden="true" />
                <span>Call {s.phone}</span>
              </a>
            )}
          </div>
        </div>
        <div className="relative hidden lg:block">
          <HeroShowcase className="w-full" />
        </div>
      </div>

      <form onSubmit={go} aria-label="Quick booking" className="container-x mt-12">
        <div className="glass grid gap-3 rounded-3xl p-4 shadow-float sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_.8fr_.6fr_.8fr_auto]">
          {[['pickup', 'Pickup', 'text'], ['destination', 'Destination', 'text']].map(([k, l, t]) => (
            <div key={k}><label htmlFor={`hq-${k}`} className="mb-1 block text-xs font-medium text-white/80">{l}</label><input id={`hq-${k}`} required type={t} list="hq-areas" value={q[k]} onChange={set(k)} autoComplete="off" className="field" placeholder={k === 'pickup' ? 'e.g. Amb Andaura' : 'e.g. Chandigarh'} /></div>
          ))}
          <datalist id="hq-areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
          <div><label htmlFor="hq-date" className="mb-1 block text-xs font-medium text-white/80">Travel date</label><input id="hq-date" type="date" min={today} value={q.date} onChange={set('date')} className="field" /></div>
          <div><label htmlFor="hq-pax" className="mb-1 block text-xs font-medium text-white/80">Passengers</label><input id="hq-pax" type="number" min="1" max="60" inputMode="numeric" value={q.passengers} onChange={set('passengers')} className="field" /></div>
          <div><label htmlFor="hq-veh" className="mb-1 block text-xs font-medium text-white/80">Vehicle</label>
            <select id="hq-veh" value={q.vehicle} onChange={set('vehicle')} className="field"><option value="">Any</option>{(vehicles || []).map((v) => <option key={v.slug} value={v.name}>{v.name}</option>)}</select></div>
          <div className="flex items-end"><button type="submit" className="btn-primary w-full">Get a Travel Quote</button></div>
        </div>
      </form>
    </section>
  );
}

const Wave = ({ from = '#0B1B33', className = '' }) => (
  <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className={`block h-10 w-full sm:h-14 ${className}`} aria-hidden="true"><path d="M0 0h1440v20c-240 40-480 40-720 20S240 20 0 40z" fill={from} /></svg>
);

const DEFAULT_ROUTES = [
  { from: 'Una', to: 'Delhi', slug: 'una-to-delhi', destinationSlug: 'una-to-delhi', detailsVerified: true, distanceKm: 360, approxDurationMinutes: 390 },
  { from: 'Amb Andaura', to: 'Chandigarh', slug: 'amb-andaura-to-chandigarh', destinationSlug: 'amb-andaura-to-chandigarh', detailsVerified: true, distanceKm: 135, approxDurationMinutes: 195 },
  { from: 'Una', to: 'Chandigarh', slug: 'una-to-chandigarh', destinationSlug: 'una-to-chandigarh', detailsVerified: true, distanceKm: 120, approxDurationMinutes: 165 },
  { from: 'Una', to: 'Ludhiana', slug: 'una-to-ludhiana', destinationSlug: 'una-to-ludhiana', detailsVerified: true, distanceKm: 115, approxDurationMinutes: 150 },
  { from: 'Amb Andaura', to: 'Una', slug: 'amb-andaura-to-una', destinationSlug: 'una', detailsVerified: true, distanceKm: 32, approxDurationMinutes: 45 },
  { from: 'Amb Andaura', to: 'Chintpurni', slug: 'amb-andaura-to-chintpurni', destinationSlug: 'chintpurni', detailsVerified: true, distanceKm: 22, approxDurationMinutes: 40 },
  { from: 'Amb Andaura', to: 'Dharamshala', slug: 'amb-andaura-to-dharamshala', destinationSlug: 'dharamshala', detailsVerified: true, distanceKm: 110, approxDurationMinutes: 180 },
];

export default function Home() {
  const s = useSettings();
  const routes = useApi('routes', () => api.get('/api/routes'));
  const dests = useApi('destinations', () => api.get('/api/destinations'));
  const vehicles = useApi('vehicles', () => api.get('/api/vehicles'));
  const faqs = useApi('faqs', () => api.get('/api/faqs'));
  const blog = useApi('blog:1', () => api.getWithMeta('/api/blog?page=1&limit=9'));
  const places = (dests.data || []).filter((d) => d.kind === 'place');
  const routeItems = (routes.data && routes.data.length > 0) ? routes.data : DEFAULT_ROUTES;
  const why = s.home?.whyChoose || [];
  const steps = s.home?.processSteps || [];
  const reviews = s.reviews || [];

  return (
    <>
      <Seo
        path="/"
        title="Himyatra Tour & Travels | #1 Taxi & Cab Service in Amb Andaura, Una & Himachal"
        description="Book top-rated 24/7 cab service in Amb Andaura, Una, Chintpurni, Ludhiana & Chandigarh. Clean Dzire, Innova Crysta & Tempo Traveller with professional drivers. Instant upfront quotes!"
        jsonLd={[
          localBusinessLd(s),
          faqPageLd(faqs.data),
          breadcrumbLd([{ name: 'Home', path: '/' }]),
        ]}
      />
      <Hero />
      <Wave from="#0B1B33" className="-mt-px" />

      <section className="relative isolate section overflow-hidden bg-slate-50/60" aria-labelledby="routes-h">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg/1280px-Force_Traveller%2C_Leh-Manali_Highway.jpg"
            alt="Tourist cab on scenic Himachal mountain highway"
            className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-slate-50/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,166,160,0.06),transparent_60%)]" />
        </div>
        <div className="container-x relative">
          <SectionHeading eyebrow="Popular routes" title={<span id="routes-h">Routes our customers ask for</span>} intro="Tap a route to see pickup details and request a quote." />
          <div className="mt-8 sm:mt-10">
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {routeItems.slice(0, 6).map((r, i) => (
                <Reveal key={r.slug || `${r.from}-${r.to}`} delay={i * 60}>
                  <RouteCard r={r} i={i} />
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Cta to="/book" variant="secondary" className="w-full sm:w-auto">
                Need a Custom Route? Request Instant Quote
              </Cta>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate section overflow-hidden bg-ivory-100/70" aria-labelledby="dest-h">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Dhauladhar.jpg/1280px-Dhauladhar.jpg"
            alt="Snow-clad Dhauladhar mountains in Himachal Pradesh"
            className="h-full w-full object-cover object-center opacity-[0.09] filter contrast-125 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/80 to-ivory-100/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(242,138,75,0.07),transparent_60%)]" />
        </div>
        <div className="container-x relative">
          <SectionHeading eyebrow="Featured destinations" title={<span id="dest-h">Explore where we travel</span>} intro="Local guidance for each of our main service areas." />
          <div className="mt-10">
            {dests.loading ? <CardGridSkeleton n={4} /> : places.length
              ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{places.slice(0, 8).map((d, i) => <Reveal key={d.slug} delay={i * 70}><DestinationCard d={d} i={i} /></Reveal>)}</div>
              : <EmptyState title="Destinations coming soon" />}
            <div className="mt-8 text-center"><Cta to="/destinations" variant="ghost">View all destinations</Cta></div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-navy-950 py-20 text-white" aria-labelledby="svc-h">
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Toyota_Innova_Crysta_2.4_Z_front_right.jpg/1280px-Toyota_Innova_Crysta_2.4_Z_front_right.jpg"
            alt="Toyota Innova Crysta luxury tour vehicle for Himachal trips"
            className="h-full w-full object-cover object-center filter brightness-[0.24] contrast-[1.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950" />
        </div>
        <div className="container-x relative">
          <SectionHeading light eyebrow="Services" title={<span id="svc-h">Every kind of trip, one team</span>} intro="From a short local ride to a customised multi-day tour." />
          <div className="mt-10"><ServiceGrid dark /></div>
          <div className="mt-8"><Cta to="/services" variant="ghost-light">See all services</Cta></div>
        </div>
      </section>

      {(vehicles.data || []).length > 0 && (
        <section className="relative isolate section overflow-hidden bg-slate-50/70" aria-labelledby="veh-h">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Toyota_Innova_Crysta.jpg/1280px-Toyota_Innova_Crysta.jpg"
              alt="Toyota Innova Crysta touring vehicle in Himachal"
              className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125 saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-slate-100/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(26,166,160,0.06),transparent_70%)]" />
          </div>
          <div className="container-x relative">
            <SectionHeading eyebrow="Vehicles" title={<span id="veh-h">Choose the right vehicle</span>} intro="Tell us your group size and luggage and we confirm the best fit." />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{vehicles.data.slice(0, 6).map((v, i) => <Reveal key={v.slug} delay={i * 70}><VehicleCard v={v} i={i} /></Reveal>)}</div>
            <div className="mt-8 text-center"><Cta to="/vehicles" variant="ghost">All vehicles</Cta></div>
          </div>
        </section>
      )}

      {why.length > 0 && (
        <section className="relative isolate section overflow-hidden bg-ivory-100/70" aria-labelledby="why-h">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Christ_Church%2C_Shimla.jpg/1280px-Christ_Church%2C_Shimla.jpg"
              alt="Christ Church Shimla Himachal Pradesh"
              className="h-full w-full object-cover object-center opacity-[0.09] filter contrast-125 saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ivory-100/90 via-ivory/85 to-ivory-100/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(26,166,160,0.08),transparent_60%)]" />
          </div>
          <div className="container-x relative">
            <SectionHeading center eyebrow="Why choose us" title={<span id="why-h">Why choose {s.business.name}</span>} />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{why.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 70} className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-soft backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <span className="font-display text-3xl font-bold text-sunset-500" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-lg font-semibold text-navy-900">{w.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-navy-700">{w.text}</p>
              </Reveal>))}
            </ul>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="relative isolate section overflow-hidden bg-white" aria-labelledby="how-h">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Atal_Tunnel_Entrance_%28South_Portal%29%2C_Manali.jpg/1280px-Atal_Tunnel_Entrance_%28South_Portal%29%2C_Manali.jpg"
              alt="Atal Tunnel Entrance South Portal near Manali Himachal Pradesh"
              className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125 saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(242,138,75,0.07),transparent_60%)]" />
          </div>
          <div className="container-x relative">
            <SectionHeading center eyebrow="How it works" title={<span id="how-h">Book in three simple steps</span>} />
            <ol className="mt-10 grid gap-6 md:grid-cols-3">{steps.map((st, i) => (
              <Reveal as="li" key={st.title} delay={i * 90} className="relative rounded-3xl border border-navy-900/10 bg-white/95 p-6 shadow-soft backdrop-blur-sm">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-teal-600 font-semibold text-white shadow-sm" aria-hidden="true">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold text-navy-950"><span className="sr-only">Step {i + 1}: </span>{st.title}</h3>
                <p className="mt-2 text-navy-700">{st.text}</p>
              </Reveal>))}
            </ol>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="relative isolate overflow-hidden bg-navy-950 py-24 text-white" aria-labelledby="rev-h">
          <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Dharamshala_Cricket_Stadium_Landscape.jpg/1280px-Dharamshala_Cricket_Stadium_Landscape.jpg"
              alt="HPCA Stadium Dharamshala Himachal Pradesh"
              className="h-full w-full object-cover object-center filter brightness-[0.24] contrast-[1.15]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(26,166,160,0.2),transparent_70%)]" />
          </div>
          <div className="container-x relative">
            <SectionHeading light eyebrow="Reviews" title={<span id="rev-h">What customers say</span>} />
            <ul className="mt-10 grid gap-5 md:grid-cols-3">{reviews.map((r, i) => (
              <li key={i} className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/15 transition duration-300 hover:border-white/30">
                {r.rating ? <p className="flex gap-1 text-sunset-400" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: r.rating }, (_, k) => <Star key={k} size={16} fill="currentColor" aria-hidden="true" />)}</p> : null}
                <blockquote className="mt-3 text-white/90">“{r.text}”</blockquote><p className="mt-3 text-sm font-semibold text-teal-200">{r.author}{r.source ? <span className="font-normal text-white/60"> · {r.source}</span> : null}</p></li>))}</ul>
          </div>
        </section>
      )}

      {(faqs.data || []).length > 0 && (
        <section className="relative isolate section overflow-hidden bg-slate-50/70" aria-labelledby="faq-h">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Khajjiar.jpg/1280px-Khajjiar.jpg"
              alt="Khajjiar meadow in Chamba Himachal Pradesh"
              className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-slate-50/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,166,160,0.06),transparent_60%)]" />
          </div>
          <div className="container-x relative grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <SectionHeading eyebrow="FAQ" title={<span id="faq-h">Questions, answered</span>} intro="Cannot find what you need? Message us and we will help." />
            <div><FaqList items={faqs.data.slice(0, 6)} idPrefix="hfaq" /><p className="mt-4"><Link to="/faq" className="font-semibold text-teal-700 underline underline-offset-2">See all questions</Link></p></div>
          </div>
        </section>
      )}

      {(blog.data?.data || []).length > 0 && (
        <section className="relative isolate section overflow-hidden bg-ivory-100/80" aria-labelledby="blog-h">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/The_Ridge%2C_Shimla.jpg/1280px-The_Ridge%2C_Shimla.jpg"
              alt="The Ridge in Shimla Himachal Pradesh"
              className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125 saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ivory-100/90 via-ivory/80 to-ivory-100/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(242,138,75,0.06),transparent_60%)]" />
          </div>
          <div className="container-x relative">
            <SectionHeading eyebrow="Travel insights" title={<span id="blog-h">From the travel desk</span>} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{blog.data.data.slice(0, 3).map((p, i) => <Reveal key={p.slug} delay={i * 70}><PostCard p={p} /></Reveal>)}</div>
            <div className="mt-8 text-center"><Cta to="/blog" variant="ghost">More travel tips</Cta></div>
          </div>
        </section>
      )}

      <section className="relative isolate overflow-hidden bg-navy-950 py-20 text-center text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Solang_valley.jpg/1280px-Solang_valley.jpg"
            alt="Solang Valley Manali Himachal Pradesh"
            className="h-full w-full object-cover object-center filter brightness-[0.28] contrast-[1.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-navy-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_50%,rgba(26,166,160,.3),transparent)]" />
        </div>
        <div className="container-x relative">
          <h2 className="h-section !text-white">Ready to plan your trip?</h2>
          <p className="lead mx-auto mt-3 max-w-xl !text-white/80">Send your details and our team will get back to you with a quote.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Cta to="/book">Book Your Ride</Cta>
            {s.waHref('Hello Himyatra Tour and Travels, I would like a travel quote.') ? <Cta href={s.waHref('Hello Himyatra Tour and Travels, I would like a travel quote.')} external variant="ghost-light"><MessageCircle size={18} aria-hidden="true" />WhatsApp</Cta> : <Cta to="/contact" variant="ghost-light">Contact us</Cta>}
            {s.callHref && <Cta href={s.callHref} variant="ghost-light"><Phone size={18} aria-hidden="true" />Call now</Cta>}
          </div>
        </div>
      </section>
    </>
  );
}
