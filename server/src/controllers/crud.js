import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created, parsePagination, pageMeta } from '../utils/respond.js';
import { slugify } from '../utils/slug.js';
import { triggerRebuild } from '../services/deployHook.js';

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const idOr404 = (id) => { if (!mongoose.isValidObjectId(id)) throw ApiError.notFound(); return id; };

/**
 * Generic admin CRUD. `filters` lists query params that may filter (string equality or "true"/"false").
 * `beforeSave(data, existingDoc)` may be async and may throw ApiError.
 */
export function crudController(Model, { search = [], filters = [], sort = { createdAt: -1 }, slugFrom, beforeSave, publicContent = true } = {}) {
  const afterChange = () => { if (publicContent) triggerRebuild(); };

  const prepare = async (data, existing) => {
    const out = { ...data };
    if (slugFrom && !out.slug && !existing && out[slugFrom]) out.slug = slugify(out[slugFrom]);
    if (beforeSave) await beforeSave(out, existing);
    return out;
  };

  return {
    list: asyncHandler(async (req, res) => {
      const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
      const filter = {};
      for (const f of filters) {
        const v = req.query[f];
        if (typeof v === 'string' && v !== '') filter[f] = v === 'true' ? true : v === 'false' ? false : v;
      }
      if (typeof req.query.q === 'string' && req.query.q.trim() && search.length) {
        const rx = new RegExp(escapeRegex(req.query.q.trim().slice(0, 80)), 'i');
        filter.$or = search.map((f) => ({ [f]: rx }));
      }
      const [items, total] = await Promise.all([Model.find(filter).sort(sort).skip(skip).limit(limit).lean(), Model.countDocuments(filter)]);
      ok(res, items, pageMeta(page, limit, total));
    }),
    get: asyncHandler(async (req, res) => {
      const doc = await Model.findById(idOr404(req.params.id)).lean();
      if (!doc) throw ApiError.notFound();
      ok(res, doc);
    }),
    create: asyncHandler(async (req, res) => {
      const doc = await Model.create(await prepare(req.body));
      afterChange();
      created(res, doc);
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await Model.findById(idOr404(req.params.id));
      if (!doc) throw ApiError.notFound();
      doc.set(await prepare(req.body, doc));
      await doc.save();
      afterChange();
      ok(res, doc);
    }),
    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(idOr404(req.params.id));
      if (!doc) throw ApiError.notFound();
      afterChange();
      ok(res, { deleted: true });
    }),
  };
}
