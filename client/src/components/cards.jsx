import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Users, Luggage, Clock, Wind, ShieldCheck, MessageCircle } from 'lucide-react';
import TiltCard from './TiltCard.jsx';
import { Img, Art } from './ui.jsx';
import { fmtDate } from '../lib/format.js';
import { useSettings } from '../lib/useSettings.js';

export function DestinationCard({ d, i = 0 }) {
  return (
    <TiltCard className="h-full rounded-3xl spatial-card">
      <Link to={`/destinations/${d.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-navy-950">
          {d.heroImage?.url
            ? <Img src={d.heroImage.url} alt={d.heroImage.alt || d.name} ratio="aspect-[4/3]" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            : <Art seed={i} className="h-full w-full" />}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-transparent" aria-hidden="true" />
          <span className="spatial-pill absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white">
            {d.kind === 'route' ? 'Route' : 'Destination'}
          </span>
          <h3 className="absolute bottom-3 left-4 right-4 font-display text-2xl !text-white">{d.name}</h3>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="flex-1 text-[15px] leading-relaxed text-navy-700">{d.summary}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 transition group-hover:text-teal-800">
            Explore Destination <ArrowUpRight size={16} aria-hidden="true" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}

export function RouteCard({ r, i = 0 }) {
  const s = useSettings();
  const to = r.destinationSlug ? `/destinations/${r.destinationSlug}` : `/book?pickup=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(r.to)}`;
  const hrs = r.approxDurationMinutes ? Math.floor(r.approxDurationMinutes / 60) : 0;
  const mins = r.approxDurationMinutes ? r.approxDurationMinutes % 60 : 0;
  const durationStr = hrs || mins ? `~${hrs ? `${hrs}h ` : ''}${mins ? `${mins}m` : ''}`.trim() : null;
  const wa = s.waHref(`Hello Ajay Tour and Travels, I would like to inquire about taxi service from ${r.from} to ${r.to}.`);

  return (
    <TiltCard className="h-full rounded-3xl spatial-card-dark text-white">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/30">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-2xl" aria-hidden="true" />
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow !text-teal-300">Popular route</p>
          {r.detailsVerified && <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] font-semibold text-teal-300 ring-1 ring-teal-400/30">Verified</span>}
        </div>
        <h3 className="mt-2.5 font-display text-xl sm:text-2xl !text-white leading-snug break-words">
          <Link to={to} className="hover:text-teal-300 transition-colors">
            {r.from} <span className="text-sunset-400" aria-hidden="true">→</span><span className="sr-only"> to </span> {r.to}
          </Link>
        </h3>
        <dl className="mt-4 space-y-1.5 text-xs sm:text-sm text-white/80">
          {r.distanceKm ? (
            <div className="flex justify-between gap-2 border-b border-white/10 pb-1.5">
              <dt className="text-white/60">Distance:</dt>
              <dd className="font-semibold text-white">~{r.distanceKm} km</dd>
            </div>
          ) : null}
          {durationStr ? (
            <div className="flex justify-between gap-2 border-b border-white/10 pb-1.5">
              <dt className="text-white/60">Travel Time:</dt>
              <dd className="font-semibold text-white">{durationStr}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-2 pt-0.5">
            <dt className="text-white/60">Fare:</dt>
            <dd className="font-semibold text-teal-300">Quote on Request</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            to={to}
            className="flex-1 inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
          >
            <span>Book Trip</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-bold text-navy-950 shadow-md transition hover:bg-[#20ba5a] active:scale-95"
              aria-label={`Inquire about ${r.from} to ${r.to} on WhatsApp`}
            >
              <MessageCircle size={15} aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </TiltCard>
  );
}

export function VehicleCard({ v, i = 0 }) {
  const s = useSettings();
  const detailUrl = `/vehicles/${v.slug}`;
  const bookUrl = `/book?vehicle=${encodeURIComponent(v.name)}`;
  const wa = s.waHref(`Hello Ajay Tour and Travels, I would like to inquire about booking the ${v.name}.`);

  return (
    <TiltCard className="h-full rounded-3xl spatial-card">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-950">
          <Link to={detailUrl} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
            {v.images?.[0]?.url
              ? <Img src={v.images[0].url} alt={v.images[0].alt || v.name} ratio="aspect-[16/10]" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              : <Art seed={i + 1} className="aspect-[16/10] w-full" />}
          </Link>
          <span className="spatial-pill absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white">
            {v.category || 'Taxi'}
          </span>
          <span className="spatial-pill absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-teal-300">
            Quote on Request
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow">{v.category}</p>
              <h3 className="mt-1 text-xl font-bold text-navy-950">
                <Link to={detailUrl} className="hover:text-teal-700 transition">
                  {v.name}
                </Link>
              </h3>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {v.availability === 'available' ? 'Available' : 'On Request'}
            </span>
          </div>

          {v.description && (
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-navy-700 line-clamp-2">
              {v.description}
            </p>
          )}

          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {v.seats ? (
              <li className="inline-flex items-center gap-1 rounded-full bg-ivory-100 px-3 py-1 font-medium text-navy-800">
                <Users size={13} className="text-teal-700" aria-hidden="true" />
                {v.seats} seats
              </li>
            ) : null}
            {v.luggageCapacity ? (
              <li className="inline-flex items-center gap-1 rounded-full bg-ivory-100 px-3 py-1 font-medium text-navy-800">
                <Luggage size={13} className="text-sunset-600" aria-hidden="true" />
                {v.luggageCapacity}
              </li>
            ) : null}
            <li className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-3 py-1 font-medium text-teal-800">
              <Wind size={13} aria-hidden="true" />
              {v.airConditioning || 'Full AC'}
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-2 border-t border-navy-900/10 pt-4">
            <Link
              to={detailUrl}
              className="flex-1 rounded-full border border-navy-900/15 py-2 text-center text-xs font-bold text-navy-900 transition hover:border-navy-900/40 hover:bg-navy-900/5"
            >
              View Details
            </Link>
            <Link
              to={bookUrl}
              className="flex-1 rounded-full bg-gradient-to-r from-sunset-500 to-amber-500 py-2 text-center text-xs font-bold text-navy-950 shadow-sm transition hover:from-sunset-400 hover:to-amber-400 hover:shadow-md"
            >
              Book Now
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366] text-navy-950 shadow-sm transition hover:bg-[#20ba5a] active:scale-95 shrink-0"
                title="Inquire on WhatsApp"
                aria-label={`Inquire about ${v.name} on WhatsApp`}
              >
                <MessageCircle size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

export function PostCard({ p }) {
  return (
    <TiltCard className="h-full rounded-3xl spatial-card">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-950">
          {p.featuredImage?.url
            ? <Img src={p.featuredImage.url} alt={p.featuredImage.alt || p.title} ratio="aspect-[16/9]" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            : <Art seed={p.title.length} className="aspect-[16/9] w-full" />}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="eyebrow">{p.category || 'Travel tips'}</p>
          <h3 className="mt-1 text-xl font-bold text-navy-950">
            <Link to={`/blog/${p.slug}`} className="after:absolute after:inset-0 hover:text-teal-700 transition">
              {p.title}
            </Link>
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-700">{p.excerpt}</p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-navy-700/80">
            <Clock size={13} aria-hidden="true" />
            {fmtDate(p.publishedAt)}
          </p>
        </div>
      </article>
    </TiltCard>
  );
}
