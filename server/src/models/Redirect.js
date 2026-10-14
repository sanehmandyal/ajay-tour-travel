import mongoose from 'mongoose';

const redirectSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, unique: true, trim: true, match: [/^\/[^\s?#]*$/, 'Must be a path starting with /'] },
    to: { type: String, required: true, trim: true, maxlength: 500 },
    statusCode: { type: Number, enum: [301, 302, 307, 308], default: 301 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Redirect = mongoose.model('Redirect', redirectSchema);
