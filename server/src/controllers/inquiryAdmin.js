import mongoose from 'mongoose';
import { Inquiry } from '../models/Inquiry.js';
import { getSettings } from '../models/WebsiteSettings.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created, parsePagination, pageMeta } from '../utils/respond.js';
import { createInquiry } from '../services/inquiryService.js';
import { escapeRegex } from './crud.js';

const idOr404 = (id) => { if (!mongoose.isValidObjectId(id)) throw ApiError.notFound(); return id; };

function buildFilter(q) {
  const f = {};
  if (typeof q.status === 'string' && q.status) f.status = q.status;
  if (typeof q.q === 'string' && q.q.trim()) {
    const rx = new RegExp(escapeRegex(q.q.trim().slice(0, 80)), 'i');
    f.$or = ['name', 'reference', 'phone', 'pickup', 'destination'].map((k) => ({ [k]: rx }));
  }
  const range = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.from || '')) range.$gte = new Date(`${q.from}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.to || '')) range.$lte = new Date(`${q.to}T23:59:59Z`);
  if (Object.keys(range).length) f.createdAt = range;
  return f;
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const filter = buildFilter(req.query);
  const [items, total] = await Promise.all([
    Inquiry.find(filter).select('-dedupeHash -ipHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Inquiry.countDocuments(filter),
  ]);
  ok(res, items, pageMeta(page, limit, total));
});

export const get = asyncHandler(async (req, res) => {
  const doc = await Inquiry.findById(idOr404(req.params.id)).select('-dedupeHash -ipHash').lean();
  if (!doc) throw ApiError.notFound();
  ok(res, doc);
});

export const createManual = asyncHandler(async (req, res) => {
  const result = await createInquiry({ ...req.body, consent: true }, 'admin');
  created(res, result);
});

export const setStatus = asyncHandler(async (req, res) => {
  const doc = await Inquiry.findByIdAndUpdate(idOr404(req.params.id), { status: req.body.status }, { new: true }).select('-dedupeHash -ipHash');
  if (!doc) throw ApiError.notFound();
  ok(res, doc);
});

export const addNote = asyncHandler(async (req, res) => {
  const doc = await Inquiry.findByIdAndUpdate(
    idOr404(req.params.id),
    { $push: { notes: { text: req.body.text, by: req.admin._id } } },
    { new: true },
  ).select('-dedupeHash -ipHash');
  if (!doc) throw ApiError.notFound();
  ok(res, doc);
});

export const remove = asyncHandler(async (req, res) => {
  const doc = await Inquiry.findByIdAndDelete(idOr404(req.params.id));
  if (!doc) throw ApiError.notFound();
  ok(res, { deleted: true });
});

const ANON = { name: 'Anonymized', phone: 'anonymized', requirements: '', notes: [], ipHash: null, dedupeHash: null };
const anonymizeUpdate = () => ({ $set: { ...ANON, anonymizedAt: new Date() }, $unset: { email: '' } });

export const anonymize = asyncHandler(async (req, res) => {
  const doc = await Inquiry.findByIdAndUpdate(idOr404(req.params.id), anonymizeUpdate(), { new: true }).select('-dedupeHash -ipHash');
  if (!doc) throw ApiError.notFound();
  ok(res, doc);
});

/** Retention policy: anonymize every inquiry older than settings.retentionDays. */
export const purgeExpired = asyncHandler(async (_req, res) => {
  const { retentionDays } = await getSettings();
  const cutoff = new Date(Date.now() - retentionDays * 86400000);
  const r = await Inquiry.updateMany({ createdAt: { $lt: cutoff }, anonymizedAt: { $exists: false } }, anonymizeUpdate());
  ok(res, { anonymized: r.modifiedCount, retentionDays });
});

// Neutralize spreadsheet formula injection (=, +, -, @, tab, CR) and quote every cell.
const cell = (v) => {
  let t = v instanceof Date ? v.toISOString() : v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export const exportCsv = asyncHandler(async (req, res) => {
  const cols = ['reference', 'createdAt', 'status', 'name', 'phone', 'email', 'pickup', 'destination', 'travelDate', 'pickupTime', 'passengers', 'vehiclePreference', 'tripType', 'returnDate', 'requirements'];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.write('\uFEFF' + cols.join(',') + '\n');
  for await (const d of Inquiry.find(buildFilter(req.query)).sort({ createdAt: -1 }).lean().cursor()) {
    res.write(cols.map((c) => cell(d[c])).join(',') + '\n');
  }
  res.end();
});
