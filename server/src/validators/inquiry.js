import { z } from 'zod';
import { cleanText, cleanMultiline } from '../utils/sanitize.js';

const text = (min, max, label) =>
  z.string({ required_error: `${label} is required` }).transform(cleanText).pipe(
    z.string().min(min, `${label} is required`).max(max, `${label} is too long`),
  );

export const normalizeIndianPhone = (raw) => {
  const digits = String(raw).replace(/[\s\-().]/g, '');
  const m = digits.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return m ? `+91${m[1]}` : null;
};

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'Invalid date');

// Allow "yesterday" in UTC so a user in IST booking for today is never rejected.
const notInPast = (s) => Date.parse(`${s}T00:00:00Z`) >= Date.now() - 36 * 3600 * 1000;

export const inquirySchema = z
  .object({
    name: text(2, 100, 'Name'),
    phone: z.string({ required_error: 'Phone number is required' }).transform((v, ctx) => {
      const n = normalizeIndianPhone(v);
      if (!n) ctx.addIssue({ code: 'custom', message: 'Enter a valid 10-digit Indian mobile number' });
      return n ?? z.NEVER;
    }),
    email: z.string().trim().max(200).optional().transform((v) => v || undefined).pipe(z.string().email('Enter a valid email address').optional()),
    pickup: text(2, 200, 'Pickup location'),
    destination: text(2, 200, 'Destination'),
    travelDate: dateStr.refine(notInPast, 'Travel date cannot be in the past'),
    pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM').optional().or(z.literal('').transform(() => undefined)),
    passengers: z.coerce.number().int().min(1, 'At least 1 passenger').max(60, 'For groups above 60 please contact us'),
    vehiclePreference: z.string().transform(cleanText).pipe(z.string().max(80)).optional(),
    tripType: z.enum(['one-way', 'round-trip']).default('one-way'),
    returnDate: dateStr.optional().or(z.literal('').transform(() => undefined)),
    requirements: z.string().transform(cleanMultiline).pipe(z.string().max(1500)).optional(),
    consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy notice to continue' }) }),
    sourcePage: z.string().max(200).optional(),
    // Honeypot: real users never see or fill this field.
    website: z.string().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tripType === 'round-trip') {
      if (!v.returnDate) ctx.addIssue({ code: 'custom', path: ['returnDate'], message: 'Return date is required for round trips' });
      else if (v.returnDate < v.travelDate) ctx.addIssue({ code: 'custom', path: ['returnDate'], message: 'Return date cannot be before travel date' });
    }
  });

export const contactSchema = z.object({
  name: text(2, 100, 'Name'),
  phone: inquirySchema.innerType().shape.phone,
  email: inquirySchema.innerType().shape.email,
  message: z.string({ required_error: 'Message is required' }).transform(cleanMultiline).pipe(z.string().min(5, 'Please write a short message').max(1500)),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy notice to continue' }) }),
  website: z.string().max(200).optional(),
});
