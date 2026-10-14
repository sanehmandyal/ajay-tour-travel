import { Helmet } from 'react-helmet-async';
import { SITE_URL, API_BASE, api } from './api.js';
import { useApi } from './data.jsx';

export const abs = (p) => (/^https?:\/\//.test(p) ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`);
export const mediaUrl = (u) => (u && u.startsWith('/api/media/') ? `${API_BASE}${u}` : u || '');

export function usePageMeta() {
  return useApi('pagemeta', () => api.get('/api/seo/pages')).data || [];
}

/**
 * One <Seo> per page. `path` is the canonical path. For static pages the admin SEO module can override
 * title/description/canonical/og image/noindex via PageMeta.
 */
export function Seo({ title, description, path, canonical: canonicalProp, image, noindex = false, type = 'website', jsonLd = [], override = true }) {
  const metas = usePageMeta();
  const o = override ? metas.find((m) => m.path === path) : null;
  const t = o?.title || title;
  const d = o?.description || description;
  const canonical = o?.canonicalUrl || canonicalProp || abs(path);
  const img = o?.ogImage || image;
  const hide = noindex || o?.noindex;
  const ld = jsonLd.filter(Boolean);
  return (
    <Helmet>
      <title>{t}</title>
      {d && <meta name="description" content={d} />}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={hide ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <meta property="og:site_name" content="Ajay Tour and Travels" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={t} />
      {d && <meta property="og:description" content={d} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="en_IN" />
      {img && <meta property="og:image" content={abs(mediaUrl(img))} />}
      <meta name="twitter:card" content={img ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={t} />
      {d && <meta name="twitter:description" content={d} />}
      {ld.map((obj, i) => <script key={i} type="application/ld+json">{JSON.stringify(obj).replace(/</g, '\\u003c')}</script>)}
    </Helmet>
  );
}

// ---- JSON-LD builders. Only verified business details are ever emitted. ----
export function localBusinessLd(settings) {
  const b = settings?.business || {};
  const ld = { '@context': 'https://schema.org', '@type': 'TravelAgency', '@id': `${SITE_URL}/#business`, name: b.name || 'Ajay Tour and Travels', url: SITE_URL };
  if (b.tagline) ld.description = b.tagline;
  if (b.serviceAreas?.length) ld.areaServed = b.serviceAreas.map((name) => ({ '@type': 'Place', name }));
  if (b.logoUrl) ld.logo = abs(mediaUrl(b.logoUrl));
  if (b.contactVerified) {
    if (b.phone) ld.telephone = b.phone;
    if (b.email) ld.email = b.email;
    if (b.address) ld.address = { '@type': 'PostalAddress', streetAddress: b.address, addressCountry: 'IN' };
  }
  const same = [b.googleBusinessProfileUrl, ...Object.values(settings?.social || {})].filter((u) => /^https:\/\//.test(u || ''));
  if (same.length) ld.sameAs = same;
  return ld;
}

export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const articleLd = (post, settings) => ({
  '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.excerpt || undefined,
  datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt,
  author: { '@type': 'Organization', name: post.author || settings?.business?.name || 'Ajay Tour and Travels' },
  publisher: { '@type': 'Organization', name: settings?.business?.name || 'Ajay Tour and Travels' },
  mainEntityOfPage: abs(`/blog/${post.slug}`), image: post.featuredImage?.url ? abs(mediaUrl(post.featuredImage.url)) : undefined,
});

export const serviceLd = (dest) => ({
  '@context': 'https://schema.org', '@type': 'Service', name: dest.h1 || dest.name, description: dest.summary || undefined,
  provider: { '@id': `${SITE_URL}/#business` }, areaServed: dest.kind === 'route' ? undefined : { '@type': 'Place', name: dest.name },
  url: abs(`/destinations/${dest.slug}`), serviceType: 'Taxi and tour service',
});
