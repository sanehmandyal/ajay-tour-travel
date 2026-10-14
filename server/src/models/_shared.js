import { SLUG_REGEX } from '../utils/slug.js';

export const slugField = {
  type: String,
  required: [true, 'Slug is required'],
  unique: true,
  lowercase: true,
  trim: true,
  maxlength: 120,
  match: [SLUG_REGEX, 'Slug may contain only lowercase letters, numbers and single hyphens'],
};

export const seoSchemaDef = {
  title: { type: String, trim: true, maxlength: 70 },
  description: { type: String, trim: true, maxlength: 170 },
  canonicalUrl: { type: String, trim: true, maxlength: 500 },
  ogImage: { type: String, trim: true, maxlength: 500 },
  noindex: { type: Boolean, default: false },
};

export const imageSchemaDef = {
  url: { type: String, trim: true, maxlength: 600 },
  alt: { type: String, trim: true, maxlength: 200 },
  width: Number,
  height: Number,
};

export const pricingSchemaDef = {
  // 'quote' = never display a figure; 'from' / 'fixed' require an admin-entered amount.
  mode: { type: String, enum: ['quote', 'from', 'fixed'], default: 'quote' },
  amount: { type: Number, min: 0, default: null },
  currency: { type: String, default: 'INR' },
  note: { type: String, trim: true, maxlength: 300 },
};

export const STATUS = ['draft', 'published'];
