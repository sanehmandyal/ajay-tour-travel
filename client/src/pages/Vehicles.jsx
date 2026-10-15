import { Link } from 'react-router-dom';
import { ShieldCheck, Wind, Users, Phone, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { useSettings } from '../lib/useSettings.js';
import { PageHero, Reveal, CardGridSkeleton, ErrorState, EmptyState, Cta } from '../components/ui.jsx';
import { VehicleCard } from '../components/cards.jsx';

export default function Vehicles() {
  const s = useSettings();
  const { data, loading, error } = useApi('vehicles', () => api.get('/api/vehicles'));
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Our Vehicles', path: '/vehicles' }];

  const wa = s.waHref('Hello Ajay Tour and Travels, I need assistance choosing a vehicle.');

  return (
    <>
      <Seo
        path="/vehicles"
        title="Our Taxi Fleet & Car Hire | Ajay Tour and Travels"
        description="Explore our clean, air-conditioned taxi fleet: Maruti Dzire, Toyota Innova Crysta, Maruti Ertiga, Scorpio, and Tempo Travellers in Amb Andaura & Una."
        jsonLd={[breadcrumbLd(crumbs)]}
      />
      <PageHero
        bgImage="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80"
        eyebrow="Our Fleet"
        title="Verified Vehicles for Every Group Size & Mountain Journey"
        intro="From comfortable sedans for station transfers to luxury Innova Crysta for hill tours and Tempo Travellers for family pilgrimages."
        crumbs={crumbs}
      />

      {/* Fleet Grid */}
      <div className="container-x section space-y-16">
        {loading && <CardGridSkeleton n={6} />}
        {error && <ErrorState message="We could not load vehicles right now." />}
        {!loading && !error && !data?.length && (
          <EmptyState title="Fleet details coming soon">
            Request a quote and we will suggest a vehicle.
            <div className="mt-4">
              <Cta to="/book">Get a Travel Quote</Cta>
            </div>
          </EmptyState>
        )}

        {data?.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((v, i) => (
              <Reveal key={v.slug} delay={i * 60}>
                <VehicleCard v={v} i={i} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Fleet Comparison & Guidance */}
        <section aria-labelledby="guide-heading" className="rounded-3xl border border-navy-900/10 bg-ivory-100/70 p-8 shadow-soft sm:p-10">
          <div className="max-w-3xl">
            <p className="eyebrow !text-teal-700">Vehicle Selection Guide</p>
            <h2 id="guide-heading" className="h-section mt-2 text-navy-950">
              Not sure which car fits your journey?
            </h2>
            <p className="lead mt-3 text-navy-700">
              Here is our quick recommendation based on passenger count, hill terrain, and luggage requirements:
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="spatial-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Solo / Couple / 3 Pax</p>
              <h3 className="mt-1 font-display text-lg font-bold text-navy-950">Comfort Sedan (Dzire)</h3>
              <p className="mt-2 text-xs text-navy-700">
                Best for fast, economical highway transfers between Amb Andaura, Una, Ludhiana &amp; Chandigarh. Fits 2 large suitcases.
              </p>
            </div>

            <div className="spatial-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Family of 4 to 6 Pax</p>
              <h3 className="mt-1 font-display text-lg font-bold text-navy-950">Family MUV (Ertiga)</h3>
              <p className="mt-2 text-xs text-navy-700">
                Spacious 3-row layout, roof-mounted rear AC, and budget-friendly rides for temple visits and city day trips.
              </p>
            </div>

            <div className="spatial-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-sunset-700">Hill Vacation / 6-7 Pax</p>
              <h3 className="mt-1 font-display text-lg font-bold text-navy-950">Toyota Innova Crysta</h3>
              <p className="mt-2 text-xs text-navy-700">
                The gold standard for Manali, Shimla &amp; Dharamshala mountain roads. Captain seats, heavy luggage carrier, and unmatched safety.
              </p>
            </div>

            <div className="spatial-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Large Groups / 8 to 17 Pax</p>
              <h3 className="mt-1 font-display text-lg font-bold text-navy-950">Tempo Traveller</h3>
              <p className="mt-2 text-xs text-navy-700">
                Pushback seats, individual AC blowers, huge separate luggage boot, and sound system for pilgrimage yatras &amp; weddings.
              </p>
            </div>
          </div>
        </section>

        {/* Fleet Guarantees */}
        <section aria-labelledby="fleet-promise-heading" className="relative isolate overflow-hidden rounded-3xl bg-navy-950 p-8 text-white sm:p-12 border border-white/10 shadow-2xl">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80"
              alt=""
              className="h-full w-full object-cover object-center filter brightness-[0.24] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(26,166,160,0.25),transparent_70%)]" />
          </div>
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="eyebrow !text-teal-300">Ajay Tour &amp; Travels Quality Standard</p>
              <h2 id="fleet-promise-heading" className="h-display mt-2 !text-white">
                Every vehicle inspected, sanitized &amp; certified before departure
              </h2>
              <ul className="mt-6 space-y-3.5">
                {[
                  '100% Guaranteed Working Air-Conditioning (Front & Rear)',
                  'Hill-certified drivers with verified Himachal & Punjab commercial permits',
                  'Zero hidden surge charges — tolls, parking, and driver allowance confirmed upfront',
                  'Luggage carriers and clean child/senior friendly seat covers in all cars',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 size={18} className="shrink-0 text-teal-400" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="spatial-glass rounded-2xl p-6">
              <h3 className="font-display text-xl font-bold text-white">Need a Custom Vehicle or Multiple Cabs?</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/80">
                Organizing a wedding in Una, corporate group in Chandigarh, or pilgrim tour from Amb Andaura? We arrange multi-vehicle fleets with coordinated timings.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <Link to="/book" className="btn-primary w-full text-center">
                  Request a Fleet Quote
                </Link>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/20 text-xs font-bold text-[#25D366] transition hover:bg-[#25D366]/30"
                  >
                    <MessageCircle size={15} aria-hidden="true" />
                    <span>Talk to Fleet Manager on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
