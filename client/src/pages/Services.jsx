import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { PageHero, Cta } from '../components/ui.jsx';
import ServiceGrid from '../components/ServiceGrid.jsx';

export default function Services() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }];
  return (
    <>
      <Seo
        path="/services"
        title="24/7 Taxi Services & Outstation Cab Booking | Himyatra Tour and Travels"
        description="Book 24/7 taxi services: Amb Andaura railway station pickup, Una cab booking, outstation travel to Chandigarh, Ludhiana, Delhi, and Shaktipeeth pilgrimage tours."
        jsonLd={[breadcrumbLd(crumbs)]}
      />
      <PageHero
        bgImage="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Atal_Tunnel_Entrance_%28South_Portal%29%2C_Manali.jpg/1280px-Atal_Tunnel_Entrance_%28South_Portal%29%2C_Manali.jpg"
        eyebrow="Services"
        title="Travel services for every kind of trip"
        intro="Tell us what you need and we will arrange the right vehicle and plan."
        crumbs={crumbs}
      />
      <div className="container-x section">
        <ServiceGrid />
        <div className="relative isolate overflow-hidden mt-12 rounded-3xl bg-navy-950 p-8 text-white sm:p-10 border border-white/10 shadow-xl">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Toyota_Innova_Crysta_2.4_Z_front_right.jpg/1280px-Toyota_Innova_Crysta_2.4_Z_front_right.jpg"
              alt="Toyota Innova Crysta luxury tour vehicle for Himachal trips"
              className="h-full w-full object-cover object-center filter brightness-[0.24]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(26,166,160,0.25),transparent_70%)]" />
          </div>
          <div className="relative">
            <h2 className="h-section !text-white">Not sure which service fits?</h2>
            <p className="lead mt-2 max-w-2xl !text-white/80">Describe your plan in the booking form and our team will suggest the best option.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Cta to="/book">Get a Travel Quote</Cta><Cta to="/destinations" variant="ghost-light">Explore Destinations</Cta></div>
          </div>
        </div>
      </div>
    </>
  );
}
