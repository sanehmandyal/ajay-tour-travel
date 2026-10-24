import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Clock, Route as RouteIcon, MessageCircle, Phone, Lightbulb, Landmark, ArrowRight, ShieldCheck } from 'lucide-react';
import { Seo, breadcrumbLd, serviceLd, faqPageLd } from '../lib/seo.jsx';
import { api, API_BASE } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { useSettings } from '../lib/useSettings.js';
import { Breadcrumbs, Cta, Img, Art, Reveal, SectionHeading, Spinner } from '../components/ui.jsx';
import { DestinationCard, VehicleCard } from '../components/cards.jsx';
import FaqList from '../components/FaqList.jsx';
import BookingForm from '../components/BookingForm.jsx';
import NotFound from './NotFound.jsx';
import { fmtDuration, paragraphs } from '../lib/format.js';

export default function DestinationDetail() {
  const { slug } = useParams();
  const s = useSettings();
  const { data: d, loading, error } = useApi(`destination:${slug}`, () => api.get(`/api/destinations/${encodeURIComponent(slug)}`));
  useEffect(() => { if (d) fetch(`${API_BASE}/api/destinations/${encodeURIComponent(slug)}/view`, { method: 'POST' }).catch(() => {}); }, [slug, !!d]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="grid min-h-[60vh] place-items-center bg-navy-900 text-white"><Spinner label="Loading destination" /></div>;
  if (error || !d) return <NotFound />;

  const path = `/destinations/${d.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Destinations', path: '/destinations' }, { name: d.name, path }];
  const r = d.route;
  const verified = r?.detailsVerified;
  const msg = `Hello Himyatra Tour and Travels, I would like a quote for ${d.name}.`;
  const wa = s.waHref(msg);
  const defaults = r ? { pickup: r.from, destination: r.to } : d.kind === 'place' ? { destination: d.name } : {};

  return (
    <>
      <Seo path={path} override={false} title={d.seo?.title || `${d.h1 || d.name} Taxi Service | Himyatra Tour and Travels`} description={d.seo?.description || d.summary}
        canonical={d.seo?.canonicalUrl || undefined} image={d.seo?.ogImage || d.heroImage?.url} noindex={d.seo?.noindex} jsonLd={[breadcrumbLd(crumbs), serviceLd(d), faqPageLd(d.faqs)].filter(Boolean)} />
      <header className="relative isolate overflow-hidden bg-navy-900 pb-14 pt-28 text-white sm:pb-20 sm:pt-36">
        {d.heroImage?.url
          ? <Img src={d.heroImage.url} alt={d.heroImage.alt || ''} priority sizes="100vw" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          : <Art seed={d.slug.length} className="absolute inset-0 -z-20" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-900/70 to-navy-900/40" aria-hidden="true" />
        <div className="container-x">
          <div className="mb-5"><Breadcrumbs items={crumbs} light /></div>
          <p className="eyebrow !text-teal-300">{d.kind === 'route' ? 'Route' : 'Destination'}</p>
          <h1 className="h-display mt-2 max-w-4xl !text-white">{d.h1 || d.name}</h1>
          {d.summary && <p className="lead mt-4 max-w-2xl !text-white/85">{d.summary}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <Cta to={`/book?${new URLSearchParams(defaults).toString()}`}>Book Your Ride <ArrowRight size={18} aria-hidden="true" /></Cta>
            {wa ? <Cta href={wa} external variant="ghost-light"><MessageCircle size={18} aria-hidden="true" />WhatsApp inquiry</Cta> : <Cta to="#quote" variant="ghost-light">Get a Travel Quote</Cta>}
          </div>
        </div>
      </header>

      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-12">
          <section aria-labelledby="intro-h">
            <h2 id="intro-h" className="h-section">About {d.name}</h2>
            <div className="prose-ajt mt-3">{paragraphs(d.introduction).map((p, i) => <p key={i}>{p}</p>)}</div>
          </section>

          {r && (
            <section aria-labelledby="route-h" className="spatial-card p-6 sm:p-7">
              <h2 id="route-h" className="text-2xl font-semibold">Route overview</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3"><RouteIcon className="mt-0.5 text-teal-600" size={20} aria-hidden="true" /><div><dt className="text-sm text-navy-700">Route</dt><dd className="font-semibold">{r.from} to {r.to}</dd></div></div>
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 text-teal-600" size={20} aria-hidden="true" /><div><dt className="text-sm text-navy-700">Distance</dt><dd className="font-semibold">{verified && r.distanceKm ? `About ${r.distanceKm} km` : 'Confirmed when we quote'}</dd></div></div>
                <div className="flex items-start gap-3"><Clock className="mt-0.5 text-teal-600" size={20} aria-hidden="true" /><div><dt className="text-sm text-navy-700">Approx. journey time</dt><dd className="font-semibold">{verified && r.approxDurationMinutes ? fmtDuration(r.approxDurationMinutes) : 'Depends on pickup point and traffic'}</dd></div></div>
                <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-teal-600" size={20} aria-hidden="true" /><div><dt className="text-sm text-navy-700">Pricing</dt><dd className="font-semibold text-teal-700">Quote on Request (Upfront &amp; Fixed)</dd></div></div>
              </dl>
            </section>
          )}

          {(d.sections || []).map((sec) => (
            <section key={sec.heading}><h2 className="text-2xl font-semibold">{sec.heading}</h2><div className="prose-ajt mt-2">{paragraphs(sec.body).map((p, i) => <p key={i}>{p}</p>)}</div></section>
          ))}

          <section aria-labelledby="pd-h" className="grid gap-5 sm:grid-cols-2">
            <h2 id="pd-h" className="sr-only">Pickup and drop-off</h2>
            <div className="rounded-3xl bg-ivory-100 p-6"><h3 className="text-lg font-semibold">Pickup information</h3><p className="mt-2 text-[15px] leading-7 text-navy-700">{d.pickupInfo || 'Share your exact pickup point when you request a quote and we will confirm it with you.'}</p></div>
            <div className="rounded-3xl bg-ivory-100 p-6"><h3 className="text-lg font-semibold">Drop-off information</h3><p className="mt-2 text-[15px] leading-7 text-navy-700">{d.dropoffInfo || 'Share your drop-off address or landmark and we will confirm it in advance.'}</p></div>
          </section>

          {d.vehicles?.length > 0 && (
            <section aria-labelledby="veh-h"><h2 id="veh-h" className="text-2xl font-semibold">Available vehicle categories</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">{d.vehicles.map((v, i) => <VehicleCard key={v.slug} v={v} i={i} />)}</div></section>
          )}

          {d.gallery?.length > 0 && (
            <section aria-labelledby="gallery-h">
              <h2 id="gallery-h" className="text-2xl font-semibold">Destination Photo Gallery</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {d.gallery.map((img, idx) => (
                  <div key={idx} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-950 border border-slate-200 shadow-soft">
                    <Img
                      src={img.url}
                      alt={img.alt || `${d.name} photo ${idx + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {img.alt && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 to-transparent p-3 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                        {img.alt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {d.attractions?.length > 0 && (
            <section aria-labelledby="att-h"><h2 id="att-h" className="flex items-center gap-2 text-2xl font-semibold"><Landmark size={22} className="text-sunset-500" aria-hidden="true" />Places worth visiting</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">{d.attractions.map((a) => <li key={a.name} className="rounded-2xl bg-white p-5 shadow-soft"><h3 className="font-semibold">{a.name}</h3><p className="mt-1 text-[15px] text-navy-700">{a.description}</p></li>)}</ul></section>
          )}

          {d.travelTips?.length > 0 && (
            <section aria-labelledby="tips-h"><h2 id="tips-h" className="flex items-center gap-2 text-2xl font-semibold"><Lightbulb size={22} className="text-sunset-500" aria-hidden="true" />Travel suggestions</h2>
              <ul className="mt-4 space-y-3">{d.travelTips.map((t) => <li key={t} className="flex gap-3 text-navy-800"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />{t}</li>)}</ul></section>
          )}

          {d.faqs?.length > 0 && (
            <section aria-labelledby="faq-h"><h2 id="faq-h" className="mb-5 text-2xl font-semibold">Frequently asked questions</h2><FaqList items={d.faqs} idPrefix="df" /></section>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start" id="quote" aria-labelledby="quote-h">
          <div className="rounded-3xl bg-navy-900 p-6 text-white shadow-float">
            <h2 id="quote-h" className="text-2xl font-semibold !text-white">Get a travel quote</h2>
            <p className="mt-2 text-sm text-white/75">{d.needsVerification ? 'Fares and timings are confirmed personally before you travel.' : 'Tell us your plan and we will reply with a quote.'}</p>
            <div className="mt-5 flex flex-col gap-3">
              <Cta to={`/book?${new URLSearchParams(defaults).toString()}`}>Book Your Ride</Cta>
              {wa && <Cta href={wa} external variant="ghost-light"><MessageCircle size={18} aria-hidden="true" />WhatsApp</Cta>}
              {s.callHref && <Cta href={s.callHref} variant="ghost-light"><Phone size={18} aria-hidden="true" />{s.phone}</Cta>}
            </div>
          </div>
        </aside>
      </div>

      {d.related?.length > 0 && (
        <section className="section bg-ivory-100" aria-labelledby="rel-h"><div className="container-x">
          <SectionHeading eyebrow="Keep exploring" title={<span id="rel-h">Related destinations and routes</span>} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{d.related.map((x, i) => <Reveal key={x.slug}><DestinationCard d={x} i={i} /></Reveal>)}</div>
        </div></section>
      )}
    </>
  );
}
