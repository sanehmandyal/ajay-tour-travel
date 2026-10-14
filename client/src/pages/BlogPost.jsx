import { Link, useParams } from 'react-router-dom';
import { Seo, breadcrumbLd, articleLd } from '../lib/seo.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { useSettings } from '../lib/useSettings.js';
import { PageHero, Img, Spinner, Cta } from '../components/ui.jsx';
import NotFound from './NotFound.jsx';
import { fmtDate } from '../lib/format.js';

export default function BlogPost() {
  const { slug } = useParams();
  const s = useSettings();
  const { data: p, loading, error } = useApi(`post:${slug}`, () => api.get(`/api/blog/${encodeURIComponent(slug)}`));
  if (loading) return <div className="grid min-h-[60vh] place-items-center bg-navy-900 text-white"><Spinner label="Loading article" /></div>;
  if (error || !p) return <NotFound />;
  const path = `/blog/${p.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Travel Tips', path: '/blog' }, { name: p.title, path }];
  return (
    <>
      <Seo path={path} override={false} type="article" title={p.seo?.title || `${p.title} | Ajay Tour and Travels`} description={p.seo?.description || p.excerpt}
        canonical={p.seo?.canonicalUrl || undefined} image={p.seo?.ogImage || p.featuredImage?.url} noindex={p.seo?.noindex} jsonLd={[breadcrumbLd(crumbs), articleLd(p, s)]} />
      <PageHero eyebrow={p.category || 'Travel tips'} title={p.title} intro={p.excerpt} crumbs={crumbs}>
        <p className="mt-4 text-sm text-white/70">By {p.author} · <time dateTime={p.publishedAt}>{fmtDate(p.publishedAt)}</time></p>
      </PageHero>
      <article className="container-x py-12"><div className="mx-auto max-w-3xl">
        {p.featuredImage?.url && <Img src={p.featuredImage.url} alt={p.featuredImage.alt || ''} priority sizes="(min-width:768px) 768px, 100vw" ratio="aspect-[16/9]" className="mb-8 w-full rounded-3xl object-cover" />}
        {/* Admin-authored HTML, sanitized by the API with a strict allowlist before it is stored. */}
        <div className="prose-ajt" dangerouslySetInnerHTML={{ __html: p.content }} />
        {p.tags?.length > 0 && <ul className="mt-8 flex flex-wrap gap-2 text-sm">{p.tags.map((t) => <li key={t} className="rounded-full bg-ivory-100 px-3 py-1">#{t}</li>)}</ul>}
        <div className="mt-12 rounded-3xl bg-navy-900 p-6 text-white"><h2 className="text-xl font-semibold !text-white">Planning a trip?</h2><p className="mt-1 text-white/80">Tell us where and when and we will send a quote.</p><Cta to="/book" className="mt-4">Get a Travel Quote</Cta></div>
        <p className="mt-8"><Link to="/blog" className="font-semibold text-teal-700 underline underline-offset-2">← Back to all articles</Link></p>
      </div></article>
    </>
  );
}
