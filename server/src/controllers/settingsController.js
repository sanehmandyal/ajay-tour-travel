import { WebsiteSettings, getSettings, PageMeta, Destination, Route, TourPackage, BlogPost } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';
import { STATIC_PAGES } from '../utils/pages.js';
import { triggerRebuild } from '../services/deployHook.js';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** Flatten nested plain objects to dotted $set paths; arrays are replaced whole. */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (isObj(v)) flatten(v, `${prefix}${k}.`, out); else out[`${prefix}${k}`] = v;
  }
  return out;
}

export const getAdminSettings = asyncHandler(async (_req, res) => ok(res, await getSettings()));

export const updateSettings = asyncHandler(async (req, res) => {
  await getSettings();
  if (req.body.business) {
    if (req.body.business.phone && !req.body.business.whatsapp) {
      req.body.business.whatsapp = req.body.business.phone.replace(/\D/g, '');
    }
  }
  const doc = await WebsiteSettings.findOneAndUpdate({ key: 'main' }, { $set: flatten(req.body) }, { new: true, runValidators: true });
  triggerRebuild();
  ok(res, doc);
});

export const getSeo = asyncHandler(async (_req, res) => {
  const [stored, destinations, routes, packages, posts] = await Promise.all([
    PageMeta.find().lean(),
    Destination.find({ status: 'published' }).select('name slug seo summary').lean(),
    Route.find({ enabled: true }).select('from to slug seo').lean(),
    TourPackage.find({ status: 'published' }).select('title slug seo').lean(),
    BlogPost.find({ status: 'published' }).select('title slug seo excerpt').lean(),
  ]);
  const byPath = Object.fromEntries(stored.map((p) => [p.path, p]));
  const pages = STATIC_PAGES.map((p) => ({ ...p, meta: byPath[p.path] || { path: p.path } }));

  const entries = [
    ...pages.map((p) => ({ kind: 'page', ref: p.path, title: p.meta.title, description: p.meta.description })),
    ...destinations.map((d) => ({ kind: 'destination', ref: d.slug, title: d.seo?.title, description: d.seo?.description })),
    ...routes.map((r) => ({ kind: 'route', ref: r.slug, title: r.seo?.title, description: r.seo?.description })),
    ...packages.map((p) => ({ kind: 'package', ref: p.slug, title: p.seo?.title, description: p.seo?.description })),
    ...posts.map((b) => ({ kind: 'blog', ref: b.slug, title: b.seo?.title, description: b.seo?.description })),
  ];
  const issues = [];
  const seenT = new Map(); const seenD = new Map();
  for (const e of entries) {
    if (!e.title) issues.push({ ...e, issue: 'Missing SEO title' });
    else if (e.title.length > 60) issues.push({ ...e, issue: `Title is ${e.title.length} chars (aim for 60 or fewer)` });
    if (!e.description) issues.push({ ...e, issue: 'Missing meta description' });
    else if (e.description.length < 70 || e.description.length > 160) issues.push({ ...e, issue: `Description is ${e.description.length} chars (aim for 70-160)` });
    if (e.title) { const k = e.title.toLowerCase(); seenT.has(k) ? issues.push({ ...e, issue: `Duplicate title (also used by ${seenT.get(k)})` }) : seenT.set(k, e.ref); }
    if (e.description) { const k = e.description.toLowerCase(); seenD.has(k) ? issues.push({ ...e, issue: `Duplicate description (also used by ${seenD.get(k)})` }) : seenD.set(k, e.ref); }
  }
  ok(res, { pages, audit: { checked: entries.length, issueCount: issues.length, issues } });
});

export const upsertPageMeta = asyncHandler(async (req, res) => {
  const { path, ...rest } = req.body;
  const doc = await PageMeta.findOneAndUpdate({ path }, { $set: rest, $setOnInsert: { path } }, { upsert: true, new: true, runValidators: true });
  triggerRebuild();
  ok(res, doc);
});
