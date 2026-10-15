import mongoose from 'mongoose';

// SEO overrides for the static public pages (/, /about, ...), keyed by path.
const pageMetaSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, trim: true, match: /^\/[a-z0-9\-/]*$/ },
    title: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 300 },
    canonicalUrl: { type: String, trim: true, maxlength: 1000 },
    ogImage: { type: String, trim: true, maxlength: 1000 },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PageMeta = mongoose.model('PageMeta', pageMetaSchema);
