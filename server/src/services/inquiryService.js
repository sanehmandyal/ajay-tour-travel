import crypto from 'node:crypto';
import { Inquiry } from '../models/Inquiry.js';
import { getSettings } from '../models/WebsiteSettings.js';
import { generateReference } from '../utils/reference.js';
import { notifyNewInquiry } from './mailer.js';
import { env } from '../config/env.js';

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

export async function createInquiry(input, ip) {
  const { website: _honeypot, ...data } = input;
  const dedupeHash = sha([data.phone, data.pickup.toLowerCase(), data.destination.toLowerCase(), data.travelDate].join('|'));

  // Duplicate-submission guard: same person, same trip, within 10 minutes -> return the existing reference.
  const existing = await Inquiry.findOne({ dedupeHash, createdAt: { $gte: new Date(Date.now() - DEDUPE_WINDOW_MS) } }).select('reference');
  if (existing) return { reference: existing.reference, duplicate: true };

  let doc;
  for (let attempt = 0; attempt < 5 && !doc; attempt += 1) {
    try {
      doc = await Inquiry.create({
        ...data,
        reference: generateReference(),
        travelDate: new Date(`${data.travelDate}T00:00:00Z`),
        returnDate: data.returnDate ? new Date(`${data.returnDate}T00:00:00Z`) : undefined,
        consent: { given: true, at: new Date(), policyVersion: '1' },
        dedupeHash,
        ipHash: sha(`${ip || ''}|${env.JWT_SECRET}`).slice(0, 24),
      });
    } catch (err) {
      if (!(err.code === 11000 && err.keyPattern?.reference)) throw err; // retry only on reference collision
    }
  }
  if (!doc) throw new Error('Could not allocate inquiry reference');

  getSettings()
    .then((s) => (s.notifications.emailOnInquiry ? notifyNewInquiry(doc, s.notifications.notifyEmail) : null))
    .catch(() => {});

  return { reference: doc.reference, duplicate: false };
}
