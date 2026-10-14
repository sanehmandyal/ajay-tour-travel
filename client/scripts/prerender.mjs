// Post-build pre-rendering: fetches published content from the API and writes static, crawlable HTML
// (with page-specific <title>, meta, canonical, JSON-LD and body content) for every public route.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = (process.env.VITE_API_URL || process.env.API_URL || '').replace(/\/$/, '');
const SITE = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const DIST = path.resolve('dist');
const STATIC = ['/', '/about', '/destinations', '/services', '/vehicles', '/packages', '/contact', '/book', '/faq', '/blog', '/privacy-policy', '/terms-and-conditions'];

const log = (...a) => console.log('[prerender]', ...a);
const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

async function get(p, full = false) {
  const res = await fetch(`${API}${p}`);
  if (!res.ok) throw new Error(`${p} -> HTTP ${res.status}`);
  const json = await res.json();
  return full ? json : json.data;
}

async function writeFile(rel, content) {
  const file = path.join(DIST, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
// SPA shell for /admin/*: no pre-rendered content and no embedded data.
await writeFile('_shell.html', template.replace('<!--app-head-->', '<meta name="robots" content="noindex, nofollow" />').replace('<!--app-html-->', '').replace('<!--app-data-->', ''));

if (!API) {
  log('VITE_API_URL not set; skipping pre-render (built SPA mode).');
  process.exit(0);
}
if (!SITE) { console.error('[prerender] VITE_SITE_URL is not set.'); process.exit(1); }

let base;
try {
  const [settings, pagemeta, destinations, routes, packages, vehicles, faqs, blog1] = await Promise.all([
    get('/api/settings/public'), get('/api/seo/pages'), get('/api/destinations'), get('/api/routes'), get('/api/packages'),
    get('/api/vehicles'), get('/api/faqs'), get('/api/blog?page=1&limit=9', true),
  ]);
  base = { settings, pagemeta, destinations, routes, packages, vehicles, faqs, 'blog:1': blog1 };
} catch (err) {
  if (process.env.ALLOW_OFFLINE_PRERENDER === '1') { log(`API unreachable (${err.message}); skipping pre-render.`); process.exit(0); }
  console.error(`[prerender] Could not reach the API at ${API}: ${err.message}\nFailing the build rather than publishing empty pages. (Set ALLOW_OFFLINE_PRERENDER=1 to override.)`);
  process.exit(1);
}

const { render } = await import(pathToFileURL(path.resolve('dist-server/entry-server.js')).href);
const jobs = STATIC.map((url) => ({ url, extra: {} }));

for (const d of destinations) jobs.push({ url: `/destinations/${d.slug}`, extra: { [`destination:${d.slug}`]: await get(`/api/destinations/${d.slug}`) } });
for (const v of vehicles) jobs.push({ url: `/vehicles/${v.slug}`, extra: { [`vehicle:${v.slug}`]: await get(`/api/vehicles/${v.slug}`) } });

// All published posts (pages of 30).
const posts = [];
for (let page = 1; ; page += 1) {
  const r = await get(`/api/blog?page=${page}&limit=30`, true);
  posts.push(...r.data);
  if (page >= r.meta.totalPages) break;
}
for (const p of posts) jobs.push({ url: `/blog/${p.slug}`, extra: { [`post:${p.slug}`]: await get(`/api/blog/${p.slug}`) } });

function inject(rendered, data) {
  const embed = Object.fromEntries(rendered.used.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));
  let out = template
    .replace('<!--app-head-->', () => rendered.head)
    .replace('<!--app-html-->', () => rendered.html)
    .replace('<!--app-data-->', () => `<script>window.__DATA__=${safeJson(embed)}</script>`);
  if (rendered.htmlAttrs) out = out.replace(/<html[^>]*>/, () => `<html ${rendered.htmlAttrs}>`);
  return out;
}

let ok = 0;
for (const { url, extra } of jobs) {
  const data = { ...base, ...extra };
  const html = inject(render(url, data), data);
  await writeFile(url === '/' ? 'index.html' : `${url.slice(1)}/index.html`, html);
  ok += 1;
}

// 404 page (Vercel serves /404.html with a real 404 status for unknown URLs).
const nf = render('/page-not-found-placeholder', base);
await writeFile('404.html', inject(nf, base));

// sitemap.xml + robots.txt from the API's canonical, published, indexable URL list.
const urls = await get('/api/sitemap');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u.path}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
await writeFile('sitemap.xml', xml);
await writeFile('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /book?\n\nSitemap: ${SITE}/sitemap.xml\n`);

log(`Wrote ${ok} pages + 404.html, sitemap.xml (${urls.length} URLs), robots.txt, _shell.html`);
