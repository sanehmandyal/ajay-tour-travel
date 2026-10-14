import mongoose from 'mongoose';
import { STATUS } from './_shared.js';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 250 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
    // 'global' shows on /faq and home; 'page' attaches to a destination/service slug.
    scope: { type: String, enum: ['global', 'page'], default: 'global' },
    pageSlug: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: STATUS, default: 'published', index: true },
    isSample: { type: Boolean, default: false }, // seeded placeholder content: replace with verified details
  },
  { timestamps: true },
);

faqSchema.index({ scope: 1, pageSlug: 1, sortOrder: 1 });

export const FAQ = mongoose.model('FAQ', faqSchema);
