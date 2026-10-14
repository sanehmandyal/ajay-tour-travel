import mongoose from 'mongoose';
import { slugField, seoSchemaDef, pricingSchemaDef } from './_shared.js';

const routeSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, trim: true, maxlength: 100 },
    to: { type: String, required: true, trim: true, maxlength: 100 },
    slug: slugField,
    enabled: { type: Boolean, default: false, index: true },
    description: { type: String, trim: true, maxlength: 3000 },
    // null until the business verifies the figures.
    distanceKm: { type: Number, min: 0, default: null },
    approxDurationMinutes: { type: Number, min: 0, default: null },
    detailsVerified: { type: Boolean, default: false },
    vehicleSlugs: [{ type: String, trim: true }],
    pricing: pricingSchemaDef,
    destinationSlug: { type: String, trim: true },
    seo: seoSchemaDef,
  },
  { timestamps: true },
);

routeSchema.index({ from: 1, to: 1 });

export const Route = mongoose.model('Route', routeSchema);
