import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { api, ApiError } from '../lib/api.js';
import { useSettings } from '../lib/useSettings.js';
import { PageHero, Cta } from '../components/ui.jsx';

const phoneRx = /^(?:\+91|91|0)?[6-9]\d{9}$/;

function ContactForm() {
  const s = useSettings();
  const [f, setF] = useState({ name: '', phone: '', email: '', message: '', consent: false, website: '' });
  const [errs, setErrs] = useState({});
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const busy = useRef(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const ia = (k) => ({ id: `cf-${k}`, value: f[k], onChange: set(k), 'aria-invalid': errs[k] ? 'true' : undefined, 'aria-describedby': errs[k] ? `cf-${k}-e` : undefined, className: `field ${errs[k] ? 'field-error' : ''}` });

  async function submit(e) {
    e.preventDefault();
    if (busy.current) return;
    const v = {};
    if (f.name.trim().length < 2) v.name = 'Please enter your name';
    if (!phoneRx.test(f.phone.replace(/[\s\-().]/g, ''))) v.phone = 'Enter a valid 10-digit Indian mobile number';
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) v.email = 'Enter a valid email address';
    if (f.message.trim().length < 5) v.message = 'Please write a short message';
    if (!f.consent) v.consent = 'Please accept the privacy notice to continue';
    setErrs(v);
    if (Object.keys(v).length) return;
    busy.current = true; setState('sending'); setMsg('');
    try {
      await api.post('/api/contact', { name: f.name, phone: f.phone, email: f.email || undefined, message: f.message, consent: true, website: f.website });
      setState('done');
      const waMsg = `Hello Himyatra Tour and Travels,\nName: ${f.name}\nPhone: ${f.phone}${f.email ? `\nEmail: ${f.email}` : ''}\nMessage: ${f.message}`;
      const waUrl = s.waHref(waMsg);
      if (waUrl && typeof window !== 'undefined') {
        try { window.open(waUrl, '_blank', 'noopener,noreferrer'); } catch (_) {}
      }
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) setErrs(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      setMsg(err.message); setState('error');
    } finally { busy.current = false; }
  }

  if (state === 'done') {
    const waMsg = `Hello Himyatra Tour and Travels,\nName: ${f.name}\nPhone: ${f.phone}${f.email ? `\nEmail: ${f.email}` : ''}\nMessage: ${f.message}`;
    const wa = s.waHref(waMsg);
    return (
      <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto text-teal-600" size={44} aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-semibold">Message Sent &amp; Connected to WhatsApp</h2>
        <p className="mt-2 text-navy-700">Thank you! Your message has been saved in our system and opened on WhatsApp for an instant response.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-teal">
              <MessageCircle size={18} aria-hidden="true" />
              <span>Chat on WhatsApp</span>
            </a>
          )}
          {s.callHref && (
            <a href={s.callHref} className="btn-ghost">
              <Phone size={18} aria-hidden="true" />
              <span>Call Helpline</span>
            </a>
          )}
        </div>
      </div>
    );
  }
  const E = ({ k }) => (errs[k] ? <p id={`cf-${k}-e`} className="mt-1 text-sm text-red-700">{errs[k]}</p> : null);
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl bg-white p-6 shadow-soft sm:p-8" aria-busy={state === 'sending'}>
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      {msg && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">{msg}</p>}
      <div><label htmlFor="cf-name" className="label">Name *</label><input {...ia('name')} autoComplete="name" /><E k="name" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="cf-phone" className="label">Phone *</label><input {...ia('phone')} type="tel" inputMode="tel" autoComplete="tel" /><E k="phone" /></div>
        <div><label htmlFor="cf-email" className="label">Email (optional)</label><input {...ia('email')} type="email" autoComplete="email" /><E k="email" /></div>
      </div>
      <div><label htmlFor="cf-message" className="label">Message *</label><textarea {...ia('message')} rows={4} /><E k="message" /></div>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label></div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={f.consent} onChange={set('consent')} className="mt-1 h-5 w-5 shrink-0 accent-teal-600" /><span>I agree to be contacted about this message, as described in the <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.</span></label>
      <E k="consent" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state === 'sending'} className="btn-primary">
          {state === 'sending' ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />Sending…</> : 'Send Message & Chat on WhatsApp'}
        </button>
        {s.waHref && (
          <a
            href={s.waHref('Hello Himyatra Tour and Travels, I have an inquiry.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/15 px-5 py-2.5 text-xs font-bold text-[#1e9e4d] transition hover:bg-[#25D366]/25"
          >
            <MessageCircle size={16} aria-hidden="true" />
            <span>Direct WhatsApp</span>
          </a>
        )}
      </div>
    </form>
  );
}

export default function Contact() {
  const s = useSettings();
  const b = s.business;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Contact Us', path: '/contact' }];
  const wa = s.waHref('Hello Himyatra Tour and Travels, I have a question.');
  return (
    <>
      <Seo
        path="/contact"
        title="Contact Us & 24/7 Cab Booking Helpline | Himyatra Tour and Travels"
        description="Get in touch with Himyatra Tour and Travels. 24/7 taxi booking helpline, WhatsApp inquiry, and instant upfront quotes for Amb Andaura station, Una & Himachal tours."
        jsonLd={[breadcrumbLd(crumbs)]}
      />
      <PageHero
        bgImage="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Dhauladhar.jpg/1280px-Dhauladhar.jpg"
        eyebrow="Contact"
        title="Talk to our team"
        intro="Send a message, request a quote or reach us directly."
        crumbs={crumbs}
      />
      <div className="relative isolate overflow-hidden bg-slate-50/60">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Christ_Church%2C_Shimla.jpg/1280px-Christ_Church%2C_Shimla.jpg"
            alt="Christ Church Shimla Himachal Pradesh"
            className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-slate-50" />
        </div>
        <div className="container-x relative grid gap-8 py-14 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-2xl font-semibold">Reach us</h2>
              {b.contactVerified ? (
                <ul className="mt-4 space-y-3 text-[15px]">
                  {b.phone && <li className="flex items-center gap-3"><Phone size={18} className="text-teal-600" aria-hidden="true" /><a href={s.callHref} className="underline-offset-2 hover:underline">{b.phone}</a></li>}
                  {wa && <li className="flex items-center gap-3"><MessageCircle size={18} className="text-teal-600" aria-hidden="true" /><a href={wa} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">Message on WhatsApp</a></li>}
                  {b.email && <li className="flex items-center gap-3"><Mail size={18} className="text-teal-600" aria-hidden="true" /><a href={`mailto:${b.email}`} className="underline-offset-2 hover:underline">{b.email}</a></li>}
                  {b.address && <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" /><span>{b.address}</span></li>}
                  {b.hours && <li className="flex items-center gap-3"><Clock size={18} className="text-teal-600" aria-hidden="true" />{b.hours}</li>}
                </ul>
              ) : <p className="mt-3 text-navy-700">Use the form to send us a message or request a quote, and we will get back to you.</p>}
              <div className="mt-5 flex flex-wrap gap-3"><Cta to="/book">Get a Travel Quote</Cta>{b.googleBusinessProfileUrl && <Cta href={b.googleBusinessProfileUrl} external variant="ghost">View on Google</Cta>}</div>
            </div>
            {b.contactVerified && b.mapEmbedUrl && (
              <div className="overflow-hidden rounded-3xl shadow-soft"><iframe title="Map showing our location" src={b.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0" /></div>
            )}
          </div>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
