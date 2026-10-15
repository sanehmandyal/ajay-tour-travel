import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { PageHero, Cta } from '../components/ui.jsx';
import ServiceGrid from '../components/ServiceGrid.jsx';

export default function Services() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }];
  return (
    <>
      <Seo
        path="/services"
        title="24/7 Taxi Services & Outstation Cab Booking | Ajay Tour and Travels"
        description="Book 24/7 taxi services: Amb Andaura railway station pickup, Una cab booking, outstation travel to Chandigarh, Ludhiana, Delhi, and Shaktipeeth pilgrimage tours."
        jsonLd={[breadcrumbLd(crumbs)]}
      />
      <PageHero eyebrow="Services" title="Travel services for every kind of trip" intro="Tell us what you need and we will arrange the right vehicle and plan." crumbs={crumbs} />
      <div className="container-x section">
        <ServiceGrid />
        <div className="mt-12 rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
          <h2 className="h-section !text-white">Not sure which service fits?</h2>
          <p className="lead mt-2 max-w-2xl !text-white/80">Describe your plan in the booking form and our team will suggest the best option.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Cta to="/book">Get a Travel Quote</Cta><Cta to="/destinations" variant="ghost-light">Explore Destinations</Cta></div>
        </div>
      </div>
    </>
  );
}
