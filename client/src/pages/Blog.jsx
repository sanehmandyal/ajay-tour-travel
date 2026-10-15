import { Link, useSearchParams } from 'react-router-dom';
import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { PageHero, Reveal, CardGridSkeleton, ErrorState, EmptyState } from '../components/ui.jsx';
import { PostCard } from '../components/cards.jsx';

export default function Blog() {
  const [sp] = useSearchParams();
  const page = Math.max(1, parseInt(sp.get('page'), 10) || 1);
  const { data, loading, error } = useApi(`blog:${page}`, () => api.getWithMeta(`/api/blog?page=${page}&limit=9`));
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Travel Tips', path: '/blog' }];
  const meta = data?.meta;
  return (
    <>
      {/* Paginated views beyond page 1 are kept out of the index to avoid thin/duplicate listing pages. */}
      <Seo path="/blog" title="Travel Tips and Insights | Ajay Tour and Travels" description="Practical travel tips for road trips, airport and railway transfers and family travel around Punjab, Himachal and Chandigarh." noindex={page > 1} jsonLd={[breadcrumbLd(crumbs)]} />
      <PageHero
        bgImage="https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/The_Ridge%2C_Shimla.jpg/1280px-The_Ridge%2C_Shimla.jpg"
        eyebrow="Travel insights"
        title="Travel tips and guides"
        intro="Practical advice for planning smoother journeys."
        crumbs={crumbs}
      />
      <div className="relative isolate overflow-hidden bg-ivory-100/60">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Dhauladhar.jpg/1280px-Dhauladhar.jpg"
            alt="Dhauladhar mountains in Himachal Pradesh"
            className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/85 to-ivory-100/90" />
        </div>
        <div className="container-x section relative">
          {loading && <CardGridSkeleton />}
          {error && <ErrorState />}
          {!loading && !error && !data?.data?.length && <EmptyState title="Articles are on the way" />}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{(data?.data || []).map((p, i) => <Reveal key={p.slug} delay={i * 50}><PostCard p={p} /></Reveal>)}</div>
          {meta && meta.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
              {page > 1 && <Link className="btn-ghost" to={page === 2 ? '/blog' : `/blog?page=${page - 1}`}>Previous</Link>}
              <span className="text-sm">Page {page} of {meta.totalPages}</span>
              {page < meta.totalPages && <Link className="btn-ghost" to={`/blog?page=${page + 1}`}>Next</Link>}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
