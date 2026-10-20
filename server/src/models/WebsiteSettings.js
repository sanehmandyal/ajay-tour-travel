import mongoose from 'mongoose';

// Singleton document (key = 'main'). Contact values are placeholders until the owner verifies them.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    business: {
      name: { type: String, default: 'Ajay Tour and Travels' },
      tagline: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      phone: { type: String, default: '+91 70110 56581' },
      whatsapp: { type: String, default: '917011056581' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      serviceAreas: { type: [String], default: ['Amb Andaura', 'Una', 'Ludhiana', 'Chandigarh'] },
      hours: { type: String, default: '' },
      googleBusinessProfileUrl: { type: String, default: '' },
      mapEmbedUrl: { type: String, default: '' },
      // Public pages hide phone/address/map/JSON-LD fields until verified by admin.
      contactVerified: { type: Boolean, default: false },
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    announcement: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: '', maxlength: 200 },
      linkUrl: { type: String, default: '' },
    },
    home: {
      heroHeadline: { type: String, default: 'Comfortable rides across Punjab, Himachal and Chandigarh' },
      heroSubheadline: { type: String, default: 'Local, outstation and airport transfers with a driver you can trust. Request a quote in minutes.' },
      whyChoose: [{ title: String, text: String }],
      processSteps: [{ title: String, text: String }],
    },
    footer: { about: { type: String, default: '' }, copyright: { type: String, default: '' } },
    reviews: [
      {
        author: { type: String, trim: true },
        text: { type: String, trim: true },
        rating: { type: Number, min: 1, max: 5 },
        source: { type: String, trim: true },
        approved: { type: Boolean, default: false },
      },
    ],
    analytics: { gaMeasurementId: { type: String, default: '' }, searchConsoleVerification: { type: String, default: '' } },
    notifications: { emailOnInquiry: { type: Boolean, default: true }, notifyEmail: { type: String, default: '' } },
    retentionDays: { type: Number, default: 365, min: 30 },
  },
  { timestamps: true },
);

export const WebsiteSettings = mongoose.model('WebsiteSettings', settingsSchema);

export async function getSettings() {
  return WebsiteSettings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
