import mongoose from 'mongoose';
import { slugField, seoSchemaDef, imageSchemaDef, STATUS } from './_shared.js';

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: slugField,
    kind: { type: String, enum: ['place', 'route'], default: 'place' },
    status: { type: String, enum: STATUS, default: 'draft', index: true },
    h1: { type: String, trim: true, maxlength: 140 },
    summary: { type: String, trim: true, maxlength: 400 },
    introduction: { type: String, trim: true, maxlength: 5000 },
    sections: [{ heading: { type: String, trim: true, maxlength: 140 }, body: { type: String, trim: true, maxlength: 5000 } }],
    heroImage: imageSchemaDef,
    gallery: [imageSchemaDef],
    pickupInfo: { type: String, trim: true, maxlength: 2000 },
    dropoffInfo: { type: String, trim: true, maxlength: 2000 },
    attractions: [{ name: { type: String, trim: true, maxlength: 120 }, description: { type: String, trim: true, maxlength: 600 } }],
    travelTips: [{ type: String, trim: true, maxlength: 400 }],
    vehicleSlugs: [{ type: String, trim: true }],
    relatedSlugs: [{ type: String, trim: true }],
    faqs: [{ question: { type: String, trim: true, maxlength: 250 }, answer: { type: String, trim: true, maxlength: 2000 } }],
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    // Facts such as distance/duration/prices must be verified by the business before publishing.
    needsVerification: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    seo: seoSchemaDef,
    publishedAt: Date,
    isSample: { type: Boolean, default: false }, // seeded placeholder content: replace with verified details
  },
  { timestamps: true },
);

destinationSchema.index({ status: 1, kind: 1, name: 1 });
destinationSchema.pre('save', function setPublishedAt(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

export const Destination = mongoose.model('Destination', destinationSchema);
