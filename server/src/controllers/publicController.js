import { Destination, Route, Vehicle, TourPackage, BlogPost, FAQ, getSettings } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created, parsePagination, pageMeta } from '../utils/respond.js';
import { createInquiry } from '../services/inquiryService.js';
import { SLUG_REGEX } from '../utils/slug.js';

const PUBLISHED = { status: 'published' };
const INTERNAL = '-__v -viewCount';
const slugParam = (req) => {
  const s = String(req.params.slug || '').toLowerCase();
  if (!SLUG_REGEX.test(s)) throw ApiError.notFound();
  return s;
};

export const listDestinations = asyncHandler(async (req, res) => {
  const filter = { ...PUBLISHED };
  if (['place', 'route'].includes(req.query.kind)) filter.kind = req.query.kind;
  const items = await Destination.find(filter)
    .select('name slug kind h1 summary heroImage seo.noindex updatedAt')
    .sort({ kind: 1, name: 1 })
    .lean();
  ok(res, items);
});

export const getDestination = asyncHandler(async (req, res) => {
  const slug = slugParam(req);
  const dest = await Destination.findOne({ slug, ...PUBLISHED })
    .select(INTERNAL)
    .populate('route', 'from to distanceKm approxDurationMinutes detailsVerified pricing enabled')
    .lean();
  if (!dest) throw ApiError.notFound('Destination not found');
  const [related, faqs] = await Promise.all([
    Destination.find({ slug: { $in: dest.relatedSlugs || [] }, ...PUBLISHED }).select('name slug kind summary heroImage').lean(),
    FAQ.find({ scope: 'page', pageSlug: slug, ...PUBLISHED }).sort({ sortOrder: 1 }).select('question answer').lean(),
  ]);
  const vehicles = dest.vehicleSlugs?.length
    ? await Vehicle.find({ slug: { $in: dest.vehicleSlugs }, ...PUBLISHED }).select('name slug category seats images availability').lean()
    : [];
  ok(res, { ...dest, related, vehicles, faqs: [...(dest.faqs || []), ...faqs] });
});

export const listRoutes = asyncHandler(async (_req, res) => {
  const items = await Route.find({ enabled: true }).select('-__v').sort({ from: 1, to: 1 }).lean();
  ok(res, items);
});

export const listPackages = asyncHandler(async (_req, res) => {
  const items = await TourPackage.find(PUBLISHED).select(INTERNAL).sort({ sortOrder: 1, createdAt: -1 }).lean();
  ok(res, items);
});

export const getPackage = asyncHandler(async (req, res) => {
  const pkg = await TourPackage.findOne({ slug: slugParam(req), ...PUBLISHED }).select(INTERNAL).lean();
  if (!pkg) throw ApiError.notFound('Package not found');
  ok(res, pkg);
});

export const listVehicles = asyncHandler(async (_req, res) => {
  const items = await Vehicle.find(PUBLISHED).select('-__v').sort({ sortOrder: 1, name: 1 }).lean();
  ok(res, items);
});

export const getVehicle = asyncHandler(async (req, res) => {
  const item = await Vehicle.findOne({ slug: slugParam(req), ...PUBLISHED }).select('-__v').lean();
  if (!item) throw ApiError.notFound('Vehicle not found');
  ok(res, item);
});

export const listBlog = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 9, maxLimit: 30 });
  const filter = { ...PUBLISHED, publishedAt: { $lte: new Date() } };
  if (typeof req.query.category === 'string') filter.category = req.query.category.slice(0, 60);
  if (typeof req.query.tag === 'string') filter.tags = req.query.tag.toLowerCase().slice(0, 40);
  const [items, total] = await Promise.all([
    BlogPost.find(filter).select('title slug excerpt author category tags featuredImage publishedAt').sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    BlogPost.countDocuments(filter),
  ]);
  ok(res, items, pageMeta(page, limit, total));
});

export const getBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: slugParam(req), ...PUBLISHED, publishedAt: { $lte: new Date() } }).select('-__v').lean();
  if (!post) throw ApiError.notFound('Article not found');
  ok(res, post);
});

export const listFaqs = asyncHandler(async (req, res) => {
  const filter = { ...PUBLISHED };
  if (typeof req.query.page === 'string') { filter.scope = 'page'; filter.pageSlug = req.query.page.slice(0, 120); } else filter.scope = 'global';
  ok(res, await FAQ.find(filter).sort({ sortOrder: 1 }).select('question answer pageSlug').lean());
});

/** Public site settings. Contact fields stay empty until verified by admin. */
export const getPublicSettings = asyncHandler(async (_req, res) => {
  const s = (await getSettings()).toObject();
  const verified = Boolean(s.business?.contactVerified);
  const activePhone = s.business?.phone || '+91 70110 56581';
  const activeWa = s.business?.whatsapp || (activePhone ? activePhone.replace(/\D/g, '') : '917011056581');
  ok(res, {
    business: {
      name: s.business?.name || 'Ajay Tour and Travels',
      tagline: s.business?.tagline || '',
      logoUrl: s.business?.logoUrl || '',
      serviceAreas: s.business?.serviceAreas || [],
      contactVerified: verified,
      phone: verified ? activePhone : '',
      whatsapp: verified ? activeWa : '',
      email: verified ? (s.business?.email || '') : '',
      address: verified ? (s.business?.address || '') : '',
      hours: verified ? (s.business?.hours || '') : '',
      googleBusinessProfileUrl: s.business?.googleBusinessProfileUrl || '',
      mapEmbedUrl: verified ? (s.business?.mapEmbedUrl || '') : '',
    },
    social: s.social || {},
    announcement: s.announcement || {},
    home: s.home || {},
    footer: s.footer || {},
    reviews: (s.reviews || []).filter((r) => r.approved).map(({ author, text, rating, source }) => ({ author, text, rating, source })),
    analytics: s.analytics || {},
  });
});

export const submitInquiry = asyncHandler(async (req, res) => {
  // Bots that fill the hidden field get a fake success so they learn nothing.
  if (req.body.website) return created(res, { reference: 'AJT-RECEIVED', duplicate: false });
  const result = await createInquiry(req.body, req.ip);
  return result.duplicate ? ok(res, result) : created(res, result);
});

/** Contact-form messages are stored as inquiries so the admin has a single inbox. */
export const submitContact = asyncHandler(async (req, res) => {
  if (req.body.website) return created(res, { reference: 'AJT-RECEIVED', duplicate: false });
  const { message, ...rest } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  const result = await createInquiry(
    { ...rest, pickup: 'Contact form', destination: 'General question', travelDate: today, passengers: 1, tripType: 'one-way', requirements: message, sourcePage: '/contact' },
    req.ip,
  );
  return result.duplicate ? ok(res, result) : created(res, result);
});

/** Beacon from the browser (pre-rendered pages do not refetch data, so views are counted here). */
export const recordView = asyncHandler(async (req, res) => {
  await Destination.updateOne({ slug: slugParam(req), ...PUBLISHED }, { $inc: { viewCount: 1 } });
  res.status(204).end();
});
