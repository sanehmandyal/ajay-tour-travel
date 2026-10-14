import multer from 'multer';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { Media } from '../models/Media.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/respond.js';
import { cleanText } from '../utils/sanitize.js';

export const WIDTHS = [480, 960, 1600];
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } }).single('file');

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose an image file to upload');
  let meta;
  try { meta = await sharp(req.file.buffer).metadata(); } catch { throw ApiError.badRequest('That file is not a supported image'); }
  if (!['jpeg', 'png', 'webp', 'avif', 'gif'].includes(meta.format)) throw ApiError.badRequest('Use a JPEG, PNG, WebP or AVIF image');
  const variants = [];
  for (const w of WIDTHS) {
    const data = await sharp(req.file.buffer).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    variants.push({ width: w, data });
  }
  const doc = await Media.create({ name: cleanText(req.file.originalname).slice(0, 200), alt: cleanText(req.body?.alt || '').slice(0, 200), width: meta.width, height: meta.height, variants });
  created(res, { id: String(doc._id), url: `/api/media/${doc._id}`, name: doc.name, width: meta.width, height: meta.height });
});

export const listMedia = asyncHandler(async (_req, res) => {
  const items = await Media.find().select('-variants').sort({ createdAt: -1 }).limit(200).lean();
  ok(res, items.map((m) => ({ id: String(m._id), url: `/api/media/${m._id}`, name: m.name, alt: m.alt, width: m.width, height: m.height, createdAt: m.createdAt })));
});

export const deleteMedia = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound();
  const d = await Media.findByIdAndDelete(req.params.id);
  if (!d) throw ApiError.notFound();
  ok(res, { deleted: true });
});

/** Public: GET /api/media/:id/:width  (width snaps to the nearest stored variant). */
export const serveMedia = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound();
  const want = Number(req.params.width) || 960;
  const doc = await Media.findById(req.params.id).lean();
  if (!doc) throw ApiError.notFound();
  const v = [...doc.variants].sort((a, b) => a.width - b.width).find((x) => x.width >= want) || doc.variants[doc.variants.length - 1];
  res.set({ 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' });
  const d = v.data;
  res.send(Buffer.isBuffer(d) ? d : Buffer.from(d.buffer));
});
