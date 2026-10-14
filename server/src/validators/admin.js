import { z } from 'zod';
import { cleanMultiline, cleanRichHtml } from '../utils/sanitize.js';
import { SLUG_REGEX } from '../utils/slug.js';

const s = (max) => z.string().transform(cleanMultiline).pipe(z.string().max(max));
const slug = z.string().trim().toLowerCase().max(120).regex(SLUG_REGEX, 'Use lowercase letters, numbers and single hyphens');
const urlish = z.string().trim().max(600).refine((v) => v === '' || /^(https:\/\/|\/)/.test(v), 'Must start with https:// or /');
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');
const status = z.enum(['draft', 'published']);
const money = z.number().min(0).max(10_000_000).nullable();

const image = z.object({ url: urlish, alt: s(200).optional(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional() });
const seo = z.object({
  title: s(70).optional(), description: s(170).optional(),
  canonicalUrl: z.string().trim().max(500).refine((v) => v === '' || /^https:\/\//.test(v), 'Canonical must be an https URL').optional(),
  ogImage: urlish.optional(), noindex: z.boolean().optional(),
});
const pricing = z.object({ mode: z.enum(['quote', 'from', 'fixed']), amount: money.optional(), currency: z.literal('INR').optional(), note: s(300).optional() })
  .refine((p) => p.mode === 'quote' || (p.amount !== null && p.amount !== undefined), { message: 'Enter an amount, or choose "quote" to show no price', path: ['amount'] });

const withPartial = (base, refine) => ({
  create: refine ? base.superRefine(refine) : base,
  update: refine ? base.partial().superRefine(refine) : base.partial(),
});

export const destination = withPartial(z.object({
  name: s(120).pipe(z.string().min(2)), slug: slug.optional(), kind: z.enum(['place', 'route']).optional(), status: status.optional(),
  h1: s(140).optional(), summary: s(400).optional(), introduction: s(5000).optional(),
  sections: z.array(z.object({ heading: s(140), body: s(5000) })).max(20).optional(),
  heroImage: image.optional(), gallery: z.array(image).max(20).optional(),
  pickupInfo: s(2000).optional(), dropoffInfo: s(2000).optional(),
  attractions: z.array(z.object({ name: s(120), description: s(600).optional() })).max(30).optional(),
  travelTips: z.array(s(400)).max(30).optional(),
  vehicleSlugs: z.array(slug).max(20).optional(), relatedSlugs: z.array(slug).max(20).optional(),
  faqs: z.array(z.object({ question: s(250), answer: s(2000) })).max(30).optional(),
  route: objectId.nullable().optional(), needsVerification: z.boolean().optional(), seo: seo.optional(), isSample: z.boolean().optional(),
}));

export const route = withPartial(z.object({
  from: s(100).pipe(z.string().min(2)), to: s(100).pipe(z.string().min(2)), slug: slug.optional(), enabled: z.boolean().optional(),
  description: s(3000).optional(), distanceKm: z.number().min(0).max(5000).nullable().optional(),
  approxDurationMinutes: z.number().min(0).max(10000).nullable().optional(), detailsVerified: z.boolean().optional(),
  vehicleSlugs: z.array(slug).max(20).optional(), pricing: pricing.optional(), destinationSlug: slug.or(z.literal('')).optional(), seo: seo.optional(),
}));

export const vehicle = withPartial(z.object({
  name: s(100).pipe(z.string().min(2)), slug: slug.optional(), category: s(60).optional(), description: s(1500).optional(),
  seats: z.number().int().min(1).max(60).optional(), luggageCapacity: s(100).optional(), features: z.array(s(100)).max(30).optional(),
  images: z.array(image).max(10).optional(), availability: z.enum(['available', 'on-request', 'unavailable']).optional(),
  status: status.optional(), isSample: z.boolean().optional(), sortOrder: z.number().int().optional(),
  pricing: pricing.optional(), ratePerKm: z.number().min(0).max(1000).nullable().optional(),
  fuelType: s(60).optional(), transmission: s(60).optional(), airConditioning: s(60).optional(),
  idealFor: s(120).optional(), included: z.array(s(100)).max(20).optional(),
  popularRoutes: z.array(z.object({ routeName: s(120), fare: z.number().min(0).optional(), duration: s(60).optional() })).max(20).optional(),
  seo: seo.optional(),
}));

export const tourPackage = withPartial(z.object({
  title: s(140).pipe(z.string().min(2)), slug: slug.optional(), summary: s(400).optional(), description: s(6000).optional(),
  durationDays: z.number().int().min(1).max(60).optional(), durationNights: z.number().int().min(0).max(60).optional(),
  itinerary: z.array(z.object({ day: z.number().int().min(1).optional(), title: s(140), description: s(2000).optional() })).max(60).optional(),
  inclusions: z.array(s(200)).max(40).optional(), exclusions: z.array(s(200)).max(40).optional(),
  pricing: pricing.optional(), images: z.array(image).max(10).optional(), status: status.optional(), sortOrder: z.number().int().optional(), seo: seo.optional(), isSample: z.boolean().optional(),
}));

export const blogPost = withPartial(z.object({
  title: s(160).pipe(z.string().min(2)), slug: slug.optional(), excerpt: s(400).optional(),
  content: z.string().max(60000).transform(cleanRichHtml), author: s(80).optional(), category: s(60).optional(),
  tags: z.array(s(40)).max(15).optional(), featuredImage: image.optional(), status: status.optional(),
  publishedAt: z.coerce.date().nullable().optional(), seo: seo.optional(), isSample: z.boolean().optional(),
}));

export const faq = withPartial(z.object({
  question: s(250).pipe(z.string().min(3)), answer: s(2000).pipe(z.string().min(3)), scope: z.enum(['global', 'page']).optional(),
  pageSlug: slug.or(z.literal('')).optional(), sortOrder: z.number().int().optional(), status: status.optional(), isSample: z.boolean().optional(),
}), (v, ctx) => { if (v.scope === 'page' && !v.pageSlug) ctx.addIssue({ code: 'custom', path: ['pageSlug'], message: 'Choose which page this FAQ belongs to' }); });

const path = z.string().trim().regex(/^\/[^\s?#]*$/, 'Must be a path like /old-page');
export const redirect = withPartial(z.object({
  from: path, to: z.string().trim().max(500).refine((v) => /^\/[^\s]*$/.test(v) || /^https:\/\//.test(v), 'Target must be a /path or https:// URL'),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).optional(), enabled: z.boolean().optional(),
}), (v, ctx) => {
  if (v.from && /^\/(admin|api)(\/|$)/.test(v.from)) ctx.addIssue({ code: 'custom', path: ['from'], message: 'Cannot redirect /admin or /api' });
  if (v.from && v.to && v.from === v.to) ctx.addIssue({ code: 'custom', path: ['to'], message: 'Redirect cannot point to itself' });
});

export const statusUpdate = z.object({ status: z.enum(['New', 'Contacted', 'Quoted', 'Confirmed', 'Completed', 'Cancelled']) });
export const noteSchema = z.object({ text: s(2000).pipe(z.string().min(1, 'Note cannot be empty')) });

const str = (max) => s(max).optional();
export const settingsSchema = z.object({
  business: z.object({
    name: s(100).pipe(z.string().min(2)).optional(), tagline: str(160), logoUrl: urlish.optional(),
    phone: str(30), whatsapp: z.string().trim().transform((v) => v.replace(/\D/g, '')).pipe(z.string().max(15)).optional(),
    email: z.string().trim().max(200).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Invalid email').optional(),
    address: str(300), serviceAreas: z.array(s(80)).max(30).optional(), hours: str(200),
    googleBusinessProfileUrl: z.string().trim().max(500).refine((v) => v === '' || /^https:\/\//.test(v), 'Must be https').optional(),
    mapEmbedUrl: z.string().trim().max(800).refine((v) => v === '' || /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(v), 'Use a Google Maps embed URL').optional(),
    contactVerified: z.boolean().optional(),
  }).optional(),
  social: z.object({ facebook: urlish.optional(), instagram: urlish.optional(), youtube: urlish.optional() }).optional(),
  announcement: z.object({ enabled: z.boolean().optional(), text: str(200), linkUrl: urlish.optional() }).optional(),
  home: z.object({
    heroHeadline: str(160), heroSubheadline: str(300),
    whyChoose: z.array(z.object({ title: s(80), text: s(300) })).max(8).optional(),
    processSteps: z.array(z.object({ title: s(80), text: s(300) })).max(6).optional(),
  }).optional(),
  footer: z.object({ about: str(400), copyright: str(200) }).optional(),
  reviews: z.array(z.object({ author: s(80), text: s(800), rating: z.number().int().min(1).max(5).optional(), source: str(80), approved: z.boolean().optional() })).max(50).optional(),
  analytics: z.object({ gaMeasurementId: z.string().trim().regex(/^(G-[A-Z0-9]+)?$/, 'Format: G-XXXXXXXX').optional(), searchConsoleVerification: z.string().trim().max(120).optional() }).optional(),
  notifications: z.object({ emailOnInquiry: z.boolean().optional(), notifyEmail: z.string().trim().max(200).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Invalid email').optional() }).optional(),
  retentionDays: z.number().int().min(30).max(3650).optional(),
});

export const pageMetaSchema = z.object({
  path: z.string().trim().regex(/^\/[a-z0-9\-/]*$/), title: s(70).optional(), description: s(170).optional(),
  canonicalUrl: z.string().trim().max(500).refine((v) => v === '' || /^https:\/\//.test(v), 'Must be https').optional(),
  ogImage: urlish.optional(), noindex: z.boolean().optional(),
});
