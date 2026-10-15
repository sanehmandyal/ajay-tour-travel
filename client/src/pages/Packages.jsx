import { Seo, breadcrumbLd, packageLd, mediaUrl } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { PageHero, Reveal, CardGridSkeleton, ErrorState, EmptyState, Img, Art, Cta } from '../components/ui.jsx';
import { fmtPrice } from '../lib/format.js';
import { Check, X } from 'lucide-react';

export default function Packages() {
  const { data, loading, error } = useApi('packages', () => api.get('/api/packages'));
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Tour Packages', path: '/packages' }];
  return (
    <>
      <Seo
        path="/packages"
        title="Himachal Tour Packages & Custom Taxi Tours | Ajay Tour and Travels"
        description="Book customized tour packages for Chintpurni, Dharamshala, Dalhousie, Manali & Shimla with private cab & driver. Transparent upfront quotes for families and groups."
        jsonLd={[breadcrumbLd(crumbs), ...(data || []).map((p) => packageLd(p)).filter(Boolean)]}
      />
      <PageHero
        bgImage="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1920&q=80"
        eyebrow="Tour packages"
        title="Trips planned around you"
        intro="Packages are starting points. We adjust the plan, vehicle and timing to suit your group."
        crumbs={crumbs}
      />
      <div className="relative isolate overflow-hidden bg-ivory-100/60">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/85 to-ivory-100/90" />
        </div>
        <div className="container-x section space-y-8 relative">
          {loading && <CardGridSkeleton n={2} />}
          {error && <ErrorState message="We could not load packages right now." />}
          {!loading && !error && !data?.length && <EmptyState title="Packages coming soon">Tell us your plan and we will build one for you.<div className="mt-4"><Cta to="/book">Get a Travel Quote</Cta></div></EmptyState>}
          {(data || []).map((p, i) => (
            <Reveal as="article" key={p.slug} className="spatial-card grid overflow-hidden md:grid-cols-[.8fr_1.2fr]">
              {p.images?.[0]?.url ? <Img src={p.images[0].url} alt={p.images[0].alt || p.title} ratio="aspect-[4/3]" className="h-full w-full object-cover" /> : <Art seed={i} className="min-h-[200px]" />}
              <div className="p-6 sm:p-8">
                <p className="eyebrow">{p.durationDays ? `${p.durationDays} day${p.durationDays > 1 ? 's' : ''}${p.durationNights ? ` / ${p.durationNights} night${p.durationNights > 1 ? 's' : ''}` : ''}` : 'Flexible duration'}</p>
                <h2 className="mt-1 text-2xl font-semibold">{p.title}</h2>
                <p className="mt-2 text-navy-700">{p.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-800">
                    Quote on Request
                  </span>
                  <span className="text-xs text-navy-700/80">
                    Customized for your group size &amp; vehicle
                  </span>
                </div>
                {p.description && <p className="mt-3 text-[15px] leading-7 text-navy-700">{p.description}</p>}
                {p.itinerary?.length > 0 && <details className="mt-4 rounded-2xl bg-ivory-100 p-4"><summary className="cursor-pointer font-semibold">Sample itinerary</summary>
                  <ol className="mt-3 space-y-2 text-[15px]">{p.itinerary.map((it, k) => <li key={k}><span className="font-semibold">Day {it.day || k + 1}: {it.title}.</span> {it.description}</li>)}</ol></details>}
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  {p.inclusions?.length > 0 && <ul aria-label="Inclusions" className="space-y-1">{p.inclusions.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />{x}</li>)}</ul>}
                  {p.exclusions?.length > 0 && <ul aria-label="Exclusions" className="space-y-1">{p.exclusions.map((x) => <li key={x} className="flex gap-2"><X size={16} className="mt-0.5 shrink-0 text-sunset-600" aria-hidden="true" />{x}</li>)}</ul>}
                </div>
                <Cta to={`/book?requirements=${encodeURIComponent(`Package: ${p.title}`)}`} className="mt-6">Request Package Quote</Cta>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
