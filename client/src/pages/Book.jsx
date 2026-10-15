import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { PageHero } from '../components/ui.jsx';
import BookingForm from '../components/BookingForm.jsx';

export default function Book() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Book a Trip', path: '/book' }];
  return (
    <>
      <Seo path="/book" title="Book a Trip | Ajay Tour and Travels" description="Send a trip request with your pickup, destination, date and passengers. Our team will contact you to confirm details and share a quote." jsonLd={[breadcrumbLd(crumbs)]} />
      <PageHero
        bgImage="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Rohtang_pass.jpg/1280px-Rohtang_pass.jpg"
        eyebrow="Book a trip"
        title="Request your ride"
        intro="Fill in your trip details. This sends an inquiry, and our team will contact you to confirm and quote."
        crumbs={crumbs}
      />
      <div className="relative isolate overflow-hidden bg-slate-50/60 pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg/1280px-Force_Traveller%2C_Leh-Manali_Highway.jpg"
            alt="Tourist vehicle travelling on Himachal Pradesh mountain route"
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
