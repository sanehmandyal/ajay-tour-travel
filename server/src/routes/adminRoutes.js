import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAdmin, csrfProtect } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import * as auth from '../controllers/authController.js';
import * as R from '../controllers/resources.js';
import * as inq from '../controllers/inquiryAdmin.js';
import * as media from '../controllers/mediaController.js';
import { dashboard } from '../controllers/dashboardController.js';
import { getAdminSettings, updateSettings, getSeo, upsertPageMeta } from '../controllers/settingsController.js';
import * as V from '../validators/admin.js';
import { inquirySchema } from '../validators/inquiry.js';

const router = Router();
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

// --- Auth (login is the only unauthenticated admin route; there is deliberately no register route) ---
router.post('/auth/login', loginLimiter, validate(auth.loginSchema), auth.login);
router.post('/auth/logout', auth.logout);

router.use(requireAdmin, csrfProtect);
router.get('/auth/me', auth.me);
router.post('/auth/change-password', validate(auth.passwordSchema), auth.changePassword);
router.get('/dashboard', dashboard);

const mount = (name, ctrl, schema) => {
  router.get(`/${name}`, ctrl.list);
  router.get(`/${name}/:id`, ctrl.get);
  router.post(`/${name}`, validate(schema.create), ctrl.create);
  router.put(`/${name}/:id`, validate(schema.update), ctrl.update);
  router.delete(`/${name}/:id`, ctrl.remove);
};
mount('destinations', R.destinations, V.destination);
mount('routes', R.routes, V.route);
mount('vehicles', R.vehicles, V.vehicle);
mount('packages', R.packages, V.tourPackage);
mount('blog', R.blog, V.blogPost);
mount('faqs', R.faqs, V.faq);
mount('redirects', R.redirects, V.redirect);

// --- Inquiries (static paths first so ":id" does not swallow them) ---
router.get('/inquiries/export.csv', inq.exportCsv);
router.post('/inquiries/purge-expired', inq.purgeExpired);
router.get('/inquiries', inq.list);
router.post('/inquiries', validate(inquirySchema), inq.createManual);
router.get('/inquiries/:id', inq.get);
router.patch('/inquiries/:id/status', validate(V.statusUpdate), inq.setStatus);
router.post('/inquiries/:id/notes', validate(V.noteSchema), inq.addNote);
router.post('/inquiries/:id/anonymize', inq.anonymize);
router.delete('/inquiries/:id', inq.remove);

router.get('/settings', getAdminSettings);
router.put('/settings', validate(V.settingsSchema), updateSettings);
router.get('/seo', getSeo);
router.put('/seo', validate(V.pageMetaSchema), upsertPageMeta);

router.get('/media', media.listMedia);
router.post('/media', media.upload, media.uploadImage);
router.delete('/media/:id', media.deleteMedia);

export default router;
