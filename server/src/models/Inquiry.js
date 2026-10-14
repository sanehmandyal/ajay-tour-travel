import mongoose from 'mongoose';

export const INQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Completed', 'Cancelled'];

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const inquirySchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 200 },
    pickup: { type: String, required: true, trim: true, maxlength: 200 },
    destination: { type: String, required: true, trim: true, maxlength: 200 },
    travelDate: { type: Date, required: true },
    pickupTime: { type: String, trim: true, maxlength: 5 },
    passengers: { type: Number, required: true, min: 1, max: 60 },
    vehiclePreference: { type: String, trim: true, maxlength: 80 },
    tripType: { type: String, enum: ['one-way', 'round-trip'], default: 'one-way' },
    returnDate: Date,
    requirements: { type: String, trim: true, maxlength: 1500 },
    consent: {
      given: { type: Boolean, required: true },
      at: { type: Date, required: true },
      policyVersion: { type: String, default: '1' },
    },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'New', index: true },
    notes: [noteSchema],
    sourcePage: { type: String, trim: true, maxlength: 200 },
    // Hashes only: raw IPs are not stored.
    dedupeHash: { type: String, index: true },
    ipHash: String,
    anonymizedAt: Date,
  },
  { timestamps: true },
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ name: 'text', reference: 'text', pickup: 'text', destination: 'text' });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
