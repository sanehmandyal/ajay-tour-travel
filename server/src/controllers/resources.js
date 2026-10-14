import { Destination, Route, Vehicle, TourPackage, BlogPost, FAQ, Redirect } from '../models/index.js';
import { crudController } from './crud.js';
import { ApiError } from '../utils/ApiError.js';

const pubDate = (data, existing) => {
  const status = data.status ?? existing?.status;
  if (status === 'published' && !data.publishedAt && !existing?.publishedAt) data.publishedAt = new Date();
};

export const destinations = crudController(Destination, {
  search: ['name', 'slug', 'h1'], filters: ['status', 'kind'], sort: { updatedAt: -1 }, slugFrom: 'name',
  beforeSave: (d) => { if (d.route === null || d.route === '') d.route = null; },
});
export const routes = crudController(Route, {
  search: ['from', 'to', 'slug'], filters: ['enabled'], sort: { from: 1, to: 1 },
  beforeSave: (d, existing) => {
    if (!d.slug && !existing) d.slug = `${d.from}-to-${d.to}`.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  },
});
export const vehicles = crudController(Vehicle, { search: ['name', 'category'], filters: ['status'], sort: { sortOrder: 1, name: 1 }, slugFrom: 'name' });
export const packages = crudController(TourPackage, { search: ['title', 'slug'], filters: ['status'], sort: { sortOrder: 1, createdAt: -1 }, slugFrom: 'title' });
export const blog = crudController(BlogPost, { search: ['title', 'slug', 'category'], filters: ['status', 'category'], sort: { createdAt: -1 }, slugFrom: 'title', beforeSave: pubDate });
export const faqs = crudController(FAQ, { search: ['question'], filters: ['status', 'scope', 'pageSlug'], sort: { scope: 1, sortOrder: 1 } });

export const redirects = crudController(Redirect, {
  search: ['from', 'to'], filters: ['enabled'], sort: { from: 1 },
  beforeSave: async (d, existing) => {
    const from = d.from ?? existing?.from;
    const to = d.to ?? existing?.to;
    const self = existing?._id;
    // Reject chains and loops: A->B while B->? or ?->A already exists.
    if (to?.startsWith('/') && (await Redirect.exists({ from: to, enabled: true, _id: { $ne: self } }))) {
      throw ApiError.conflict('That target is itself redirected; point directly at the final URL to avoid a redirect chain.');
    }
    if (from && (await Redirect.exists({ to: from, enabled: true, _id: { $ne: self } }))) {
      throw ApiError.conflict('Another redirect already points at this path; update it to avoid a redirect chain.');
    }
  },
});
