import { Router } from 'express';
import mongoose from 'mongoose';
import * as c from '../controllers/publicController.js';
import { validate } from '../middleware/validate.js';
import { inquiryLimiter } from '../middleware/rateLimiters.js';
import { inquirySchema, contactSchema } from '../validators/inquiry.js';
import * as seo from '../controllers/seoPublic.js';
import { serveMedia } from '../controllers/mediaController.js';

const router = Router();

router.get('/health', (_req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ success: dbUp, data: { status: dbUp ? 'ok' : 'degraded', db: dbUp ? 'connected' : 'disconnected', uptime: Math.round(process.uptime()) } });
});

router.get('/destinations', c.listDestinations);
router.get('/destinations/:slug', c.getDestination);
router.post('/destinations/:slug/view', c.recordView);
router.get('/routes', c.listRoutes);
router.get('/packages', c.listPackages);
router.get('/packages/:slug', c.getPackage);
router.get('/vehicles', c.listVehicles);
router.get('/vehicles/:slug', c.getVehicle);
router.get('/blog', c.listBlog);
router.get('/blog/:slug', c.getBlogPost);
router.get('/faqs', c.listFaqs);
router.get('/settings/public', c.getPublicSettings);
router.get('/media/:id/:width', serveMedia);
router.get('/sitemap.xml', seo.sitemapXml);
router.get('/sitemap', seo.sitemapJson);
router.get('/robots.txt', seo.robotsTxt);
router.get('/seo/pages', seo.pageMetaPublic);
router.get('/redirects', seo.redirectsPublic);
router.post('/inquiries', inquiryLimiter, validate(inquirySchema), c.submitInquiry);
router.post('/contact', inquiryLimiter, validate(contactSchema), c.submitContact);

export default router;
