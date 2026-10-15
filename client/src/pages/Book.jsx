import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { PageHero } from '../components/ui.jsx';
import BookingForm from '../components/BookingForm.jsx';

export default function Book() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Book a Trip', path: '/book' }];
  return (
    <>
      <Seo path="/book" title="Book a Trip | Ajay Tour and Travels" description="Send a trip request with your pickup, destination, date and passengers. Our team will contact you to confirm details and share a quote." jsonLd={[breadcrumbLd(crumbs)]} />
      <PageHero
        bgImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
        eyebrow="Book a trip"
        title="Request your ride"
        intro="Fill in your trip details. This sends an inquiry, and our team will contact you to confirm and quote."
        crumbs={crumbs}
      />
      <div className="relative isolate overflow-hidden bg-slate-50/60 pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
            alt=""
            className="h-full w-full object-cover object-center opacity-[0.08] filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-slate-50" />
        </div>
        <div className="container-x relative -mt-8 sm:-mt-12">
          <div className="mx-auto max-w-3xl">
            <BookingForm />
          </div>
        </div>
      </div>
    </>
  );
}
