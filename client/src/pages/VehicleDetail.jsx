import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Users,
  Luggage,
  Fuel,
  Wind,
  CheckCircle2,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Gauge,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { Seo, breadcrumbLd, vehicleLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { useSettings } from '../lib/useSettings.js';
import { Breadcrumbs, Cta, Img, Art, Spinner } from '../components/ui.jsx';
import BookingForm from '../components/BookingForm.jsx';
import NotFound from './NotFound.jsx';
import { fmtPrice } from '../lib/format.js';

export default function VehicleDetail() {
  const { slug } = useParams();
  const s = useSettings();
  const [activeImg, setActiveImg] = useState(0);
  const { data: v, loading, error } = useApi(`vehicle:${slug}`, () => api.get(`/api/vehicles/${encodeURIComponent(slug)}`));
  const { data: allVehicles } = useApi('vehicles', () => api.get('/api/vehicles'));

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-navy-900 text-white">
        <Spinner label="Loading vehicle details..." />
      </div>
    );
  }

  if (error || !v) return <NotFound />;

  const path = `/vehicles/${v.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Our Vehicles', path: '/vehicles' },
    { name: v.name, path },
  ];

  const waMsg = `Hello Ajay Tour and Travels, I would like to book or inquire about ${v.name}.`;
  const wa = s.waHref(waMsg);
  const otherVehicles = (allVehicles || []).filter((item) => item.slug !== v.slug).slice(0, 3);

  return (
    <>
      <Seo
        path={path}
        title={v.seo?.title || `${v.name} Taxi Booking | Ajay Tour and Travels`}
        description={v.seo?.description || v.description}
        image={v.images?.[0]?.url}
        jsonLd={[breadcrumbLd(crumbs), vehicleLd(v)]}
      />

      {/* Hero Header */}
      <header className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-36 text-white sm:pb-24 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src={v.images?.[0]?.url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Toyota_Innova_Crysta.jpg/1280px-Toyota_Innova_Crysta.jpg'}
            alt=""
            className="h-full w-full object-cover object-center filter brightness-[0.22] contrast-[1.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/70 to-navy-950" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(26,166,160,.25),transparent),radial-gradient(50%_50%_at_10%_90%,rgba(242,138,75,.18),transparent)]" />
        </div>

        <div className="container-x">
          <div className="mb-6">
            <Breadcrumbs items={crumbs} light />
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-teal-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-300">
                  {v.category || 'Taxi Fleet'}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  🟢 {v.availability === 'available' ? 'Available 24/7' : v.availability === 'unavailable' ? 'Currently Booked' : 'Available on Request'}
                </span>
              </div>

              <h1 className="h-display mt-4 !text-white">{v.name}</h1>
              <p className="lead mt-4 max-w-xl !text-white/85">{v.description}</p>

              {/* Spatial Upfront Quote Banner */}
              <div className="spatial-glass mt-6 flex flex-wrap items-center gap-3 rounded-2xl p-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-white/70">Ride Fare</span>
                  <p className="font-display text-2xl font-bold text-sunset-400 sm:text-3xl">
                    Quote on Request
                  </p>
                </div>
                <span className="spatial-pill rounded-full px-3 py-1 text-xs font-semibold text-teal-300">
                  Transparent Upfront Pricing
                </span>
                <span className="text-xs text-white/75">
                  • Fuel &amp; Driver Allowance Included • Zero Surge Guarantee
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to={`/book?vehicle=${encodeURIComponent(v.name)}`}
                  className="btn-primary"
                >
                  <span>Book This Vehicle</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#25D366]/50 bg-[#25D366]/20 px-6 py-3 text-base font-bold text-[#25D366] backdrop-blur-md transition-all hover:bg-[#25D366]/30 hover:border-[#25D366]"
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                )}
                {s.callHref && (
                  <a
                    href={s.callHref}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-teal-400/40 bg-teal-500/10 px-5 py-3 text-base font-semibold text-teal-300 transition-all hover:bg-teal-500/20"
                  >
                    <Phone size={16} aria-hidden="true" />
                    <span>Call {s.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Vehicle Image Showcase */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-navy-950 shadow-2xl">
                <div className="aspect-[16/11] w-full overflow-hidden">
                  {v.images?.[activeImg]?.url || v.images?.[0]?.url ? (
                    <Img
                      src={v.images[activeImg]?.url || v.images[0].url}
                      alt={v.images[activeImg]?.alt || v.images[0]?.alt || v.name}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                  ) : (
                    <Art seed={v.slug.length} className="h-full w-full" />
                  )}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/20 bg-navy-900/85 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-teal-400" aria-hidden="true" />
                    Sanitized &amp; AC Verified
                  </span>
                  <span className="text-sunset-300">Himachal &amp; Punjab Permit Ready</span>
                </div>
              </div>

              {/* Clickable Image Strip if multiple photos uploaded */}
              {v.images?.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
                  {v.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className={`relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        activeImg === idx ? 'border-teal-400 ring-2 ring-teal-400/40 shadow-md scale-105' : 'border-white/20 opacity-70 hover:opacity-100 hover:border-white/50'
                      }`}
                      aria-label={`Show vehicle photo ${idx + 1}`}
                    >
                      <Img src={img.url} alt={img.alt || ''} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-12">
          {/* Key Specifications */}
          <section aria-labelledby="specs-heading" className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-soft">
            <h2 id="specs-heading" className="text-2xl font-bold text-navy-950">
              Vehicle Specifications &amp; Capacities
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-ivory-100 p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600">
                  <Users size={16} className="text-teal-600" aria-hidden="true" />
                  Seating
                </span>
                <p className="mt-1 font-display text-lg font-bold text-navy-950">
                  {v.seats ? `${v.seats} Passengers` : 'Standard'}
                </p>
                <p className="text-[11px] text-navy-700/80">Excluding Driver</p>
              </div>

              <div className="rounded-2xl bg-ivory-100 p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600">
                  <Luggage size={16} className="text-sunset-600" aria-hidden="true" />
                  Luggage Space
                </span>
                <p className="mt-1 font-display text-lg font-bold text-navy-950">
                  {v.luggageCapacity || 'Spacious Boot'}
                </p>
                <p className="text-[11px] text-navy-700/80">Roof carrier available</p>
              </div>

              <div className="rounded-2xl bg-ivory-100 p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600">
                  <Wind size={16} className="text-teal-600" aria-hidden="true" />
                  Air Conditioning
                </span>
                <p className="mt-1 font-display text-lg font-bold text-navy-950">
                  {v.airConditioning || 'Full Climate Control'}
                </p>
                <p className="text-[11px] text-navy-700/80">100% Chilled AC</p>
              </div>

              <div className="rounded-2xl bg-ivory-100 p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600">
                  <Fuel size={16} className="text-amber-600" aria-hidden="true" />
                  Fuel Type
                </span>
                <p className="mt-1 font-display text-lg font-bold text-navy-950">
                  {v.fuelType || 'Petrol / Diesel'}
                </p>
                <p className="text-[11px] text-navy-700/80">Smooth &amp; Clean Running</p>
              </div>

              <div className="rounded-2xl bg-ivory-100 p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600">
                  <Gauge size={16} className="text-teal-600" aria-hidden="true" />
                  Transmission
                </span>
                <p className="mt-1 font-display text-lg font-bold text-navy-950">
                  {v.transmission || 'Manual / Automatic'}
                </p>
                <p className="text-[11px] text-navy-700/80">Hill Responsive</p>
              </div>

              <div className="rounded-2xl bg-ivory-100 p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-600">
                  <Sparkles size={16} className="text-sunset-600" aria-hidden="true" />
                  Best Suited For
                </span>
                <p className="mt-1 font-display text-sm font-bold text-navy-950 line-clamp-2">
                  {v.idealFor || 'Local & Outstation Trips'}
                </p>
              </div>
            </div>
          </section>

          {/* Features & Inclusions */}
          <section aria-labelledby="features-heading" className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-soft">
            <h2 id="features-heading" className="text-2xl font-bold text-navy-950">
              Features &amp; Ride Amenities
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-teal-700">Vehicle Highlights</h3>
                <ul className="mt-3 space-y-2.5">
                  {(v.features || []).map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-navy-800">
                      <CheckCircle2 size={16} className="shrink-0 text-teal-600" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-sunset-700">What’s Included in Every Ride</h3>
                <ul className="mt-3 space-y-2.5">
                  {(v.included || [
                    'Uniformed & Hill-Certified Chauffeur',
                    'Clean & Sanitized Cabin before pickup',
                    'Mobile USB Charging Points',
                    'Overhead Luggage Carrier on request',
                    'Transparent Fare with Zero Surprise Surges',
                    '24/7 Roadside Assistance & Live Support',
                  ]).map((inc) => (
                    <li key={inc} className="flex items-center gap-2.5 text-sm text-navy-800">
                      <ShieldCheck size={16} className="shrink-0 text-sunset-500" aria-hidden="true" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Popular Routes & Estimated Fares Table */}
          {v.popularRoutes?.length > 0 && (
            <section aria-labelledby="routes-table-heading" className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="routes-table-heading" className="text-2xl font-bold text-navy-950">
                    Popular Routes &amp; Fares for {v.name}
                  </h2>
                  <p className="mt-1 text-sm text-navy-700">
                    Upfront one-way estimates. Toll taxes and state permits explained clearly.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-navy-900/10 bg-ivory-100/70 text-xs font-bold uppercase tracking-wider text-navy-700">
                    <tr>
                      <th className="py-3 pl-4 pr-3">Route Destination</th>
                      <th className="px-3 py-3">Est. Duration</th>
                      <th className="px-3 py-3">Pricing Quote</th>
                      <th className="py-3 pl-3 pr-4 text-right">Instant Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-900/5">
                    {v.popularRoutes.map((rt) => (
                      <tr key={rt.routeName} className="transition hover:bg-ivory-50">
                        <td className="py-3.5 pl-4 pr-3 font-semibold text-navy-950">
                          {rt.routeName}
                        </td>
                        <td className="px-3 py-3.5 text-navy-700">{rt.duration || 'Direct Run'}</td>
                        <td className="px-3 py-3.5 font-semibold text-teal-700">
                          Quote on Request
                        </td>
                        <td className="py-3.5 pl-3 pr-4 text-right">
                          <Link
                            to={`/book?vehicle=${encodeURIComponent(v.name)}&destination=${encodeURIComponent(rt.routeName)}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-sunset-600 hover:text-sunset-700 hover:underline"
                          >
                            Request Quote <ArrowRight size={13} aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Compare Other Fleet Cars */}
          {otherVehicles.length > 0 && (
            <section aria-labelledby="other-cars-heading">
              <h2 id="other-cars-heading" className="text-2xl font-bold text-navy-950">
                Explore Other Cars in Fleet
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {otherVehicles.map((other) => (
                  <Link
                    key={other.slug}
                    to={`/vehicles/${other.slug}`}
                    className="spatial-card group flex flex-col overflow-hidden p-4"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-navy-900">
                      {other.images?.[0]?.url ? (
                        <img
                          src={other.images[0].url}
                          alt={other.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <Art seed={other.slug.length} className="h-full w-full" />
                      )}
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase text-teal-700">{other.category}</p>
                    <h3 className="mt-1 font-semibold text-navy-950 group-hover:text-teal-700">{other.name}</h3>
                    <p className="mt-1 text-xs font-bold text-sunset-600">
                      Quote on Request
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Booking Widget */}
        <aside className="space-y-6">
          <div className="sticky top-28 rounded-3xl border border-navy-900/10 bg-white p-6 shadow-soft">
            <h3 className="font-display text-xl font-bold text-navy-950">
              Request {v.name}
            </h3>
            <p className="mt-1 text-xs text-navy-700">
              Share your travel details for instant quote and guaranteed car availability.
            </p>
            <div className="mt-5">
              <BookingForm defaults={{ vehicle: v.name }} />
            </div>

            <div className="mt-6 border-t border-navy-900/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-600">Need Immediate Help?</p>
              <div className="mt-2.5 flex flex-col gap-2">
                {s.callHref && (
                  <a
                    href={s.callHref}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-50 px-4 text-xs font-bold text-teal-800 transition hover:bg-teal-100"
                  >
                    <Phone size={15} className="text-teal-600" aria-hidden="true" />
                    <span>Call 24/7: {s.phone}</span>
                  </a>
                )}
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 px-4 text-xs font-bold text-[#25D366] transition hover:bg-[#25D366]/25"
                  >
                    <MessageCircle size={15} aria-hidden="true" />
                    <span>Instant WhatsApp Chat</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
