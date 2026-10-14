import mongoose from 'mongoose';
import { slugField, seoSchemaDef, imageSchemaDef, STATUS } from './_shared.js';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: slugField,
    excerpt: { type: String, trim: true, maxlength: 400 },
    content: { type: String, required: true }, // sanitized HTML, cleaned on write
    author: { type: String, trim: true, maxlength: 80, default: 'Ajay Tour and Travels' },
    category: { type: String, trim: true, maxlength: 60, index: true },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    featuredImage: imageSchemaDef,
    status: { type: String, enum: STATUS, default: 'draft', index: true },
    publishedAt: { type: Date, index: true },
    seo: seoSchemaDef,
    isSample: { type: Boolean, default: false }, // seeded placeholder content: replace with verified details
  },
  { timestamps: true },
);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
