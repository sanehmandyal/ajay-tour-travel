import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { PageHero, Reveal, CardGridSkeleton, ErrorState, EmptyState, SectionHeading } from '../components/ui.jsx';
import { DestinationCard } from '../components/cards.jsx';

export default function Destinations() {
  const { data, loading, error } = useApi('destinations', () => api.get('/api/destinations'));
  const places = (data || []).filter((d) => d.kind === 'place');
  const routes = (data || []).filter((d) => d.kind === 'route');
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Destinations', path: '/destinations' }];
  return (
    <>
      <Seo path="/destinations" title="Destinations and Routes | Ajay Tour and Travels" description="Explore the places and routes we serve: Amb Andaura, Una, Ludhiana, Chandigarh and routes between them. Request a quote online." jsonLd={[breadcrumbLd(crumbs)]} />
      <PageHero eyebrow="Where we travel" title="Destinations and routes" intro="Pickup guidance, travel suggestions and quote requests for each place we serve." crumbs={crumbs} />
      <div className="container-x section space-y-14">
        {loading && <CardGridSkeleton n={6} />}
        {error && <ErrorState message="We could not load destinations right now." />}
        {!loading && !error && !data?.length && <EmptyState title="Destinations are being added" />}
        {places.length > 0 && <section aria-labelledby="pl-h"><SectionHeading title={<span id="pl-h">Places</span>} /><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{places.map((d, i) => <Reveal key={d.slug} delay={i * 60}><DestinationCard d={d} i={i} /></Reveal>)}</div></section>}
        {routes.length > 0 && <section aria-labelledby="rt-h"><SectionHeading title={<span id="rt-h">Routes</span>} /><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{routes.map((d, i) => <Reveal key={d.slug} delay={i * 60}><DestinationCard d={d} i={i + 2} /></Reveal>)}</div></section>}
      </div>
    </>
  );
}
