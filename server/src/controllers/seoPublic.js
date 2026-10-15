import { Destination, Vehicle, TourPackage, BlogPost, PageMeta, Redirect } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { env } from '../config/env.js';
import { STATIC_PAGES } from '../utils/pages.js';

const xmlEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const base = () => env.SITE_URL.replace(/\/$/, '');

/** Canonical, published, indexable URLs only. */
async function collectUrls() {
  const [metas, dests, vehicles, packages, posts] = await Promise.all([
    PageMeta.find().lean(),
    Destination.find({ status: 'published', 'seo.noindex': { $ne: true } }).select('slug updatedAt').lean(),
    Vehicle.find({ status: 'published', 'seo.noindex': { $ne: true } }).select('slug updatedAt').lean(),
    TourPackage.find({ status: 'published', 'seo.noindex': { $ne: true } }).select('slug updatedAt').lean(),
    BlogPost.find({ status: 'published', publishedAt: { $lte: new Date() }, 'seo.noindex': { $ne: true } }).select('slug updatedAt').lean(),
  ]);
  const noindex = new Set(metas.filter((m) => m.noindex).map((m) => m.path));
  return [
    ...STATIC_PAGES.filter((p) => !noindex.has(p.path)).map((p) => ({ path: p.path })),
    ...dests.map((d) => ({ path: `/destinations/${d.slug}`, lastmod: d.updatedAt })),
    ...vehicles.map((v) => ({ path: `/vehicles/${v.slug}`, lastmod: v.updatedAt })),
    ...packages.map((pkg) => ({ path: `/packages`, lastmod: pkg.updatedAt })),
    ...posts.map((b) => ({ path: `/blog/${b.slug}`, lastmod: b.updatedAt })),
  ];
}

export const sitemapJson = asyncHandler(async (_req, res) => ok(res, await collectUrls()));

export const sitemapXml = asyncHandler(async (_req, res) => {
  const urls = await collectUrls();
  const body = urls.map((u) => `  <url><loc>${xmlEsc(base() + u.path)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
});

export const robotsTxt = (_req, res) =>
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /book?\nDisallow: /*?q=\n\nSitemap: ${base()}/sitemap.xml\n`);

export const pageMetaPublic = asyncHandler(async (_req, res) => ok(res, await PageMeta.find().select('-__v').lean()));

export const redirectsPublic = asyncHandler(async (_req, res) =>
  ok(res, await Redirect.find({ enabled: true }).select('from to statusCode -_id').lean()));
