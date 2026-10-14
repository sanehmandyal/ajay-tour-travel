import { describe, it, expect } from 'vitest';
import { whatsappHref, telHref, bookingMessage } from '../lib/contact.js';
import { fmtPrice, fmtDuration, paragraphs } from '../lib/format.js';
import { bookingSchema } from '../components/BookingForm.jsx';
import { localBusinessLd, breadcrumbLd } from '../lib/seo.jsx';

const future = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
const valid = { name: 'Asha', phone: '98765 43210', email: '', pickup: 'Una', destination: 'Chandigarh', travelDate: future, pickupTime: '', passengers: '3', vehiclePreference: '', tripType: 'one-way', returnDate: '', requirements: '', consent: true };

describe('contact helpers', () => {
  it('encodes WhatsApp messages and strips the number to digits', () => {
    const href = whatsappHref('+91 98765-43210', 'Hi & hello\nPickup: Una');
    expect(href).toBe('https://wa.me/919876543210?text=Hi%20%26%20hello%0APickup%3A%20Una');
  });
  it('builds tel links', () => expect(telHref('+91 98765 43210')).toBe('tel:+919876543210'));
  it('builds a booking message', () => expect(bookingMessage({ pickup: 'Una', destination: 'Ludhiana', reference: 'AJT-1' })).toContain('Reference: AJT-1'));
});

describe('formatting', () => {
  it('never invents a price', () => {
    expect(fmtPrice({ mode: 'quote' })).toBe('Quote on request');
    expect(fmtPrice({ mode: 'from', amount: null })).toBe('Quote on request');
    expect(fmtPrice({ mode: 'from', amount: 2500 })).toBe('Quote on request');
  });
  it('formats durations and paragraphs', () => {
    expect(fmtDuration(95)).toBe('1 hr 35 min');
    expect(paragraphs('a\n\nb')).toEqual(['a', 'b']);
  });
});

describe('booking form validation', () => {
  it('accepts a valid request', () => expect(bookingSchema.safeParse(valid).success).toBe(true));
  it.each([['phone', '12345'], ['name', 'A'], ['travelDate', '2001-01-01'], ['passengers', '0'], ['consent', false]])('rejects bad %s', (k, v) => {
    expect(bookingSchema.safeParse({ ...valid, [k]: v }).success).toBe(false);
  });
  it('requires a return date for round trips', () => {
    expect(bookingSchema.safeParse({ ...valid, tripType: 'round-trip' }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...valid, tripType: 'round-trip', returnDate: future }).success).toBe(true);
  });
});

describe('structured data', () => {
  it('omits unverified contact details', () => {
    const ld = localBusinessLd({ business: { name: 'X', phone: '999', email: 'a@b.c', address: 'Somewhere', contactVerified: false }, social: {} });
    expect(ld.telephone).toBeUndefined(); expect(ld.address).toBeUndefined(); expect(ld.email).toBeUndefined();
    expect(ld.aggregateRating).toBeUndefined();
  });
  it('includes verified contact details', () => {
    const ld = localBusinessLd({ business: { name: 'X', phone: '999', contactVerified: true }, social: {} });
    expect(ld.telephone).toBe('999');
  });
  it('numbers breadcrumb items from 1', () => {
    const ld = breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]);
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});
