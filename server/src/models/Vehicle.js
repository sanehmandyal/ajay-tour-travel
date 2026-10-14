import mongoose from 'mongoose';
import { slugField, imageSchemaDef, pricingSchemaDef, seoSchemaDef, STATUS } from './_shared.js';

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: slugField,
    category: { type: String, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 1500 },
    seats: { type: Number, min: 1, max: 60 },
    luggageCapacity: { type: String, trim: true, maxlength: 100 },
    features: [{ type: String, trim: true, maxlength: 100 }],
    images: [imageSchemaDef],
    pricing: pricingSchemaDef,
    ratePerKm: { type: Number, min: 0, default: null },
    fuelType: { type: String, trim: true, maxlength: 60 },
    transmission: { type: String, trim: true, maxlength: 60 },
    airConditioning: { type: String, trim: true, maxlength: 60 },
    idealFor: { type: String, trim: true, maxlength: 120 },
    included: [{ type: String, trim: true, maxlength: 100 }],
    popularRoutes: [
      {
        routeName: { type: String, trim: true, maxlength: 120 },
        fare: { type: Number, min: 0 },
        duration: { type: String, trim: true, maxlength: 60 },
      },
    ],
    seo: seoSchemaDef,
    availability: { type: String, enum: ['available', 'on-request', 'unavailable'], default: 'on-request' },
    status: { type: String, enum: STATUS, default: 'draft', index: true },
    sortOrder: { type: Number, default: 0 },
    isSample: { type: Boolean, default: false }, // seeded placeholder content: replace with verified details
  },
  { timestamps: true },
);

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
