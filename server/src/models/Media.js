import mongoose from 'mongoose';

// Optimized uploads kept in MongoDB so the API needs no persistent disk (Render's disk is ephemeral).
const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 200 },
    alt: { type: String, trim: true, maxlength: 200 },
    width: Number,
    height: Number,
    variants: [{ width: Number, data: Buffer, _id: false }],
  },
  { timestamps: true },
);

export const Media = mongoose.model('Media', mediaSchema);
