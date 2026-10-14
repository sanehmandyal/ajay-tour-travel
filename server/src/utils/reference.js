import crypto from 'node:crypto';

// No 0/O/1/I so references are easy to read out over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReference(date = new Date()) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const bytes = crypto.randomBytes(5);
  let suffix = '';
  for (const b of bytes) suffix += ALPHABET[b % ALPHABET.length];
  return `AJT-${ymd}-${suffix}`;
}
