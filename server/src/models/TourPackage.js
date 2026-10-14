import mongoose from 'mongoose';
import { slugField, seoSchemaDef, imageSchemaDef, pricingSchemaDef, STATUS } from './_shared.js';

const tourPackageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: slugField,
    summary: { type: String, trim: true, maxlength: 400 },
    description: { type: String, trim: true, maxlength: 6000 },
    durationDays: { type: Number, min: 1, max: 60 },
    durationNights: { type: Number, min: 0, max: 60 },
    itinerary: [{ day: Number, title: { type: String, trim: true }, description: { type: String, trim: true, maxlength: 2000 } }],
    inclusions: [{ type: String, trim: true, maxlength: 200 }],
    exclusions: [{ type: String, trim: true, maxlength: 200 }],
    pricing: pricingSchemaDef,
    images: [imageSchemaDef],
    status: { type: String, enum: STATUS, default: 'draft', index: true },
    sortOrder: { type: Number, default: 0 },
    seo: seoSchemaDef,
    isSample: { type: Boolean, default: false }, // seeded placeholder content: replace with verified details
  },
  { timestamps: true },
);

export const TourPackage = mongoose.model('TourPackage', tourPackageSchema);
