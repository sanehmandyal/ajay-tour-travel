import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { PageHero } from '../components/ui.jsx';
import BookingForm from '../components/BookingForm.jsx';

export default function Book() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Book a Trip', path: '/book' }];
  return (
    <>
      <Seo path="/book" title="Book a Trip | Ajay Tour and Travels" description="Send a trip request with your pickup, destination, date and passengers. Our team will contact you to confirm details and share a quote." jsonLd={[breadcrumbLd(crumbs)]} />
      <PageHero eyebrow="Book a trip" title="Request your ride" intro="Fill in your trip details. This sends an inquiry, and our team will contact you to confirm and quote." crumbs={crumbs} />
      <div className="container-x -mt-8 pb-20 sm:-mt-12"><div className="mx-auto max-w-3xl"><BookingForm /></div></div>
    </>
  );
}
