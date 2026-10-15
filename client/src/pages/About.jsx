import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { useSettings } from '../lib/useSettings.js';
import { PageHero, Cta, SectionHeading, Reveal } from '../components/ui.jsx';
import { MapPin } from 'lucide-react';

export default function About() {
  const s = useSettings();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }];
  const values = [
    ['Clear communication', 'We confirm pickup, route and quote with you before the trip, so there are no surprises.'],
    ['Right-sized vehicles', 'Tell us your passengers and luggage and we suggest a vehicle that fits comfortably.'],
    ['Local knowledge', 'We serve Amb Andaura, Una, Ludhiana and Chandigarh regularly and can advise on pickups and timings.'],
  ];
  return (
    <>
      <Seo
        path="/about"
        title="About Ajay Tour & Travels | Trusted Himachal Taxi Service"
        description="Learn about Ajay Tour and Travels: 15+ years experience providing reliable taxi services, verified courteous drivers, sanitized cabs, and transparent quotes across Amb Andaura, Una, Punjab & Himachal."
        jsonLd={[breadcrumbLd(crumbs)]}
      />
      <PageHero
        bgImage="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=80"
        eyebrow="About us"
        title={`About ${s.business.name}`}
        intro="A local travel service helping families, pilgrims and business travellers move between Himachal Pradesh, Punjab and Chandigarh."
        crumbs={crumbs}
      />
      <div className="container-x section grid items-center gap-12 lg:grid-cols-2">
        <div className="prose-ajt">
          <h2 className="!mt-0">How we work</h2>
          <p>{s.business.name} arranges taxis and tours for people travelling in and around Amb Andaura, Una, Ludhiana and Chandigarh. You send us the details of your trip, and our team contacts you personally to confirm the plan and the price.</p>
          <p>We handle local rides, outstation journeys, airport and railway station transfers, family trips and customised tours. If your plan is unusual, tell us. We would rather adjust the trip than fit you into a package that does not suit.</p>
          <h2>Where we serve</h2>
          <ul>{(s.business.serviceAreas || []).map((a) => <li key={a}>{a}</li>)}</ul>
          <p>Need to go somewhere else? Ask us. We confirm other destinations case by case.</p>
        </div>
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-navy-900/10 bg-navy-900 shadow-float">
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
                alt="Ajay Tour & Travels cab service at Amb Andaura Railway Station"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-navy-900/80 px-3 py-1.5 font-semibold backdrop-blur-md">
                  📍 Amb Andaura Station &amp; Una Hub
                </span>
                <span className="rounded-full border border-white/20 bg-navy-900/80 px-3 py-1.5 font-bold text-sunset-400 backdrop-blur-md">
                  10+ Yrs Trusted
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-5 text-center shadow-soft">
              <p className="font-display text-3xl font-bold text-teal-600">10+</p>
              <p className="mt-1 text-xs font-medium text-navy-700">Years of Experience</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center shadow-soft">
              <p className="font-display text-3xl font-bold text-sunset-500">15,000+</p>
              <p className="mt-1 text-xs font-medium text-navy-700">Trips Completed</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center shadow-soft">
              <p className="font-display text-3xl font-bold text-navy-900">50+</p>
              <p className="mt-1 text-xs font-medium text-navy-700">Destinations &amp; Routes</p>
            </div>
            <div className="rounded-2xl bg-white p-5 text-center shadow-soft">
              <p className="font-display text-3xl font-bold text-teal-600">24/7</p>
              <p className="mt-1 text-xs font-medium text-navy-700">Customer Support</p>
            </div>
          </div>
        </div>
      </div>
      <section className="section bg-ivory-100" aria-labelledby="val-h"><div className="container-x">
        <SectionHeading center eyebrow="What to expect" title={<span id="val-h">Our approach</span>} />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">{values.map(([t, d], i) => <Reveal as="li" key={t} delay={i * 80} className="rounded-3xl bg-white p-6 shadow-soft"><MapPin className="text-teal-600" aria-hidden="true" /><h3 className="mt-3 text-xl font-semibold">{t}</h3><p className="mt-2 text-navy-700">{d}</p></Reveal>)}</ul>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Cta to="/book">Get a Travel Quote</Cta>
          {s.callHref && <Cta href={s.callHref} variant="ghost">Call {s.phone}</Cta>}
        </div>
      </div></section>
    </>
  );
}
