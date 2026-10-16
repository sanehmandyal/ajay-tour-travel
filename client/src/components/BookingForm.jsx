import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { CheckCircle2, Loader2, Phone, MessageCircle } from 'lucide-react';
import { api, ApiError } from '../lib/api.js';
import { useApi } from '../lib/data.jsx';
import { useSettings } from '../lib/useSettings.js';
import { bookingMessage } from '../lib/contact.js';

const phoneRx = /^(?:\+91|91|0)?[6-9]\d{9}$/;
const todayLocal = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export const bookingSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  phone: z.string().trim().refine((v) => phoneRx.test(v.replace(/[\s\-().]/g, '')), 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().max(200).refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address'),
  pickup: z.string().trim().min(2, 'Enter your pickup location').max(200),
  destination: z.string().trim().min(2, 'Enter your destination').max(200),
  travelDate: z.string().min(1, 'Choose a travel date').refine((v) => v >= todayLocal(), 'Travel date cannot be in the past'),
  pickupTime: z.string(),
  passengers: z.coerce.number({ invalid_type_error: 'Enter number of passengers' }).int().min(1, 'At least 1 passenger').max(60, 'For groups above 60 please contact us'),
  vehiclePreference: z.string(),
  tripType: z.enum(['one-way', 'round-trip']),
  returnDate: z.string(),
  requirements: z.string().max(1500, 'Please keep this under 1500 characters'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy notice to continue' }) }),
}).superRefine((v, ctx) => {
  if (v.tripType === 'round-trip') {
    if (!v.returnDate) ctx.addIssue({ code: 'custom', path: ['returnDate'], message: 'Choose a return date' });
    else if (v.returnDate < v.travelDate) ctx.addIssue({ code: 'custom', path: ['returnDate'], message: 'Return date cannot be before travel date' });
  }
});

function Field({ id, label, error, hint, children, required }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}{required && <span aria-hidden="true" className="text-sunset-600"> *</span>}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-navy-700/70">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function BookingForm({ defaults = {} }) {
  const [params] = useSearchParams();
  const s = useSettings();
  const { data: vehicles } = useApi('vehicles', () => api.get('/api/vehicles'));
  const init = useMemo(() => ({
    name: '', phone: '', email: '', pickup: params.get('pickup') || defaults.pickup || '', destination: params.get('destination') || defaults.destination || '',
    travelDate: params.get('date') || defaults.date || '', pickupTime: '', passengers: params.get('passengers') || defaults.passengers || '2',
    vehiclePreference: params.get('vehicle') || defaults.vehiclePreference || defaults.vehicle || '',
    tripType: 'one-way', returnDate: '', requirements: (params.get('requirements') || defaults.requirements || '').slice(0, 300), consent: false, website: '',
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [f, setF] = useState(init);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);
  const submitting = useRef(false);
  const summaryRef = useRef(null);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const ia = (k) => ({ id: `bf-${k}`, 'aria-invalid': errors[k] ? 'true' : undefined, 'aria-describedby': errors[k] ? `bf-${k}-err` : undefined, className: `field ${errors[k] ? 'field-error' : ''}`, value: f[k], onChange: set(k) });
  const areas = s.business.serviceAreas || [];
  const vOptions = ['Any / not sure', ...(vehicles || []).map((v) => v.name), 'Other (describe below)'];

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting.current) return; // duplicate-submission guard
    const parsed = bookingSchema.safeParse(f);
    if (!parsed.success) {
      const errs = {};
      for (const i of parsed.error.issues) errs[i.path[0]] ||= i.message;
      setErrors(errs); setStatus('idle'); setServerError('');
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setErrors({}); setServerError('');
    submitting.current = true; setStatus('submitting');
    try {
      const d = parsed.data;
      const payload = { ...d, email: d.email || undefined, pickupTime: d.pickupTime || undefined, returnDate: d.tripType === 'round-trip' ? d.returnDate : undefined, vehiclePreference: d.vehiclePreference || undefined, requirements: d.requirements || undefined, website: f.website, sourcePage: window.location.pathname };
      const res = await api.post('/api/inquiries', payload);
      setResult({ ...res, summary: d });
      setStatus('success');

      // Seamlessly direct inquiry to admin WhatsApp with generated reference:
      const waMsg = bookingMessage({ ...d, reference: res.reference });
      const waUrl = s.waHref(waMsg);
      if (waUrl && typeof window !== 'undefined') {
        try {
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        } catch (_) {}
      }
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        const errs = {}; for (const x of err.details) errs[x.field] ||= x.message; setErrors(errs);
      }
      setServerError(err.message || 'Something went wrong.'); setStatus('error');
      setTimeout(() => summaryRef.current?.focus(), 0);
    } finally { submitting.current = false; }
  }

  if (status === 'success' && result) {
    const msg = bookingMessage({ ...result.summary, reference: result.reference });
    const wa = s.waHref(msg);
    return (
      <div role="status" className="rounded-3xl bg-white p-6 text-center shadow-soft sm:p-10">
        <CheckCircle2 className="mx-auto text-teal-600" size={48} aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-semibold">Inquiry Logged &amp; WhatsApp Connected</h2>
        <p className="mt-2 text-navy-700">Your inquiry reference number is</p>
        <p className="my-2 inline-block rounded-xl bg-ivory-100 px-4 py-2 font-mono text-lg font-semibold tracking-wider text-teal-800">{result.reference}</p>
        <p className="mx-auto max-w-md text-navy-700">
          Your details have been saved to our management system. A WhatsApp chat with our team has also been launched with your trip details for an instant quote.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-teal shadow-md hover:scale-105 transition-transform">
              <MessageCircle size={18} aria-hidden="true" />
              <span>Continue on WhatsApp</span>
            </a>
          )}
          {s.callHref && (
            <a href={s.callHref} className="btn-ghost">
              <Phone size={18} aria-hidden="true" />
              <span>Call Helpline</span>
            </a>
          )}
          <button type="button" className="btn-ghost" onClick={() => { setF(init); setStatus('idle'); setResult(null); }}>
            Make another request
          </button>
        </div>
      </div>
    );
  }

  const busy = status === 'submitting';
  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl bg-white p-5 shadow-soft sm:p-8" aria-busy={busy}>
      <div ref={summaryRef} tabIndex={-1} className="outline-none" aria-live="assertive">
        {(Object.keys(errors).length > 0 || serverError) && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-semibold">{serverError || 'Please correct the following:'}</p>
            {Object.keys(errors).length > 0 && <ul className="mt-1 list-disc pl-5">{Object.entries(errors).map(([k, m]) => <li key={k}><a href={`#bf-${k}`} className="underline">{m}</a></li>)}</ul>}
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="bf-name" label="Your name" error={errors.name} required><input {...ia('name')} autoComplete="name" /></Field>
        <Field id="bf-phone" label="Phone number" error={errors.phone} hint="10-digit Indian mobile number" required><input {...ia('phone')} type="tel" inputMode="tel" autoComplete="tel" /></Field>
        <Field id="bf-email" label="Email (optional)" error={errors.email}><input {...ia('email')} type="email" autoComplete="email" /></Field>
        <Field id="bf-vehiclePreference" label="Vehicle preference" error={errors.vehiclePreference}>
          <select {...ia('vehiclePreference')}><option value="">Select…</option>{vOptions.map((v) => <option key={v} value={v === 'Any / not sure' ? '' : v}>{v}</option>)}</select>
        </Field>
        <Field id="bf-pickup" label="Pickup location" error={errors.pickup} required><input {...ia('pickup')} list="bf-areas" autoComplete="off" /></Field>
        <Field id="bf-destination" label="Destination" error={errors.destination} required><input {...ia('destination')} list="bf-areas" autoComplete="off" /></Field>
        <datalist id="bf-areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
        <Field id="bf-travelDate" label="Travel date" error={errors.travelDate} required><input {...ia('travelDate')} type="date" min={todayLocal()} /></Field>
        <Field id="bf-pickupTime" label="Pickup time (optional)" error={errors.pickupTime}><input {...ia('pickupTime')} type="time" /></Field>
        <Field id="bf-passengers" label="Passengers" error={errors.passengers} required><input {...ia('passengers')} type="number" inputMode="numeric" min="1" max="60" /></Field>
        <fieldset>
          <legend className="label">Trip type</legend>
          <div className="flex gap-3">
            {[['one-way', 'One way'], ['round-trip', 'Round trip']].map(([v, l]) => (
              <label key={v} className={`flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-medium has-[:checked]:border-teal-600 has-[:checked]:bg-teal-500/10 ${'border-navy-900/15'}`}>
                <input type="radio" name="tripType" value={v} checked={f.tripType === v} onChange={set('tripType')} className="sr-only" />{l}
              </label>
            ))}
          </div>
        </fieldset>
        {f.tripType === 'round-trip' && <Field id="bf-returnDate" label="Return date" error={errors.returnDate} required><input {...ia('returnDate')} type="date" min={f.travelDate || todayLocal()} /></Field>}
      </div>
      <div className="mt-4"><Field id="bf-requirements" label="Additional requirements (optional)" error={errors.requirements}><textarea {...ia('requirements')} rows={3} /></Field></div>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label></div>
      <div className="mt-4">
        <label className="flex items-start gap-3 text-sm text-navy-800">
          <input id="bf-consent" type="checkbox" checked={f.consent} onChange={set('consent')} aria-invalid={errors.consent ? 'true' : undefined} className="mt-1 h-5 w-5 shrink-0 accent-teal-600" />
          <span>I agree that Ajay Tour and Travels may use these details to contact me about this trip, as described in the <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</span>
        </label>
        {errors.consent && <p className="mt-1 text-sm text-red-700">{errors.consent}</p>}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto">
          {busy ? <><Loader2 className="animate-spin" size={18} aria-hidden="true" />Submitting…</> : 'Submit Inquiry & Chat on WhatsApp'}
        </button>
        {s.waHref && (
          <a
            href={s.waHref(`Hello Ajay Tour and Travels, I would like to inquire about taxi service${f.pickup ? ` from ${f.pickup}` : ''}${f.destination ? ` to ${f.destination}` : ''}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/15 px-5 py-2.5 text-xs font-bold text-[#1e9e4d] transition hover:bg-[#25D366]/25 w-full sm:w-auto"
          >
            <MessageCircle size={16} aria-hidden="true" />
            <span>Direct WhatsApp Inquiry</span>
          </a>
        )}
      </div>
      <p className="mt-3 text-xs text-navy-700/70">Submitting this form records your request in our system and connects you directly with our team on WhatsApp for fast confirmation.</p>
    </form>
  );
}

