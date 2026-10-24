import { Seo, breadcrumbLd } from '../lib/seo.jsx';
import { useSettings } from '../lib/useSettings.js';
import { PageHero } from '../components/ui.jsx';

const UPDATED = 'This page was last reviewed when the site was built. The business owner should review it, and have it checked by a qualified adviser, before relying on it.';

function Shell({ path, title, description, intro, children }) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: title, path }];
  return (
    <>
      <Seo path={path} title={`${title} | Himyatra Tour and Travels`} description={description} jsonLd={[breadcrumbLd(crumbs)]} />
      <PageHero eyebrow="Legal" title={title} intro={intro} crumbs={crumbs} />
      <div className="container-x py-12"><div className="prose-ajt mx-auto max-w-3xl">{children}<p className="mt-10 text-sm text-navy-700/80">{UPDATED}</p></div></div>
    </>
  );
}

function Contactline() {
  const s = useSettings();
  const b = s.business;
  return b.contactVerified && (b.email || b.phone)
    ? <p>You can contact us at {[b.email, b.phone].filter(Boolean).join(' or ')}.</p>
    : <p>You can contact us using the form on our <a href="/contact">Contact page</a>.</p>;
}

export function Privacy() {
  const s = useSettings();
  const n = s.business.name;
  return (
    <Shell path="/privacy-policy" title="Privacy Policy" description={`How ${n} collects, uses and protects the details you send when you request a quote or contact us.`} intro="What we collect, why, and how long we keep it.">
      <h2>What we collect</h2>
      <p>When you send a trip request or contact message we collect the details you enter: your name, phone number, optional email address, pickup and destination, travel dates, passenger numbers, vehicle preference and any notes. We also store a one-way hash of your network address to help us detect spam. We do not store your raw IP address.</p>
      <h2>Why we use it</h2>
      <p>We use these details only to respond to your request, prepare a quote and arrange your trip. We do not sell your personal information.</p>
      <h2>Who can see it</h2>
      <p>Your details are visible to authorised staff of {n} through a private administration area. Service providers that host this website and our database process data on our behalf. If email notifications are enabled, a notification containing your request may be sent to our business email.</p>
      <h2>How long we keep it</h2>
      <p>We keep inquiry details for a limited period and then delete or anonymize them. You may ask us to delete or anonymize your details earlier.</p>
      <h2>Cookies and analytics</h2>
      <p>This website does not use advertising cookies. If website analytics are enabled, they are used in aggregate to understand how the site is used.</p>
      <h2>Your choices</h2>
      <p>You can ask us to access, correct or delete the personal information we hold about you.</p>
      <Contactline />
      <h2>Changes</h2>
      <p>We may update this policy from time to time. The current version is always on this page.</p>
    </Shell>
  );
}

export function Terms() {
  const n = useSettings().business.name;
  return (
    <Shell path="/terms-and-conditions" title="Terms and Conditions" description={`The terms that apply when you use the ${n} website and request our travel services.`} intro="Please read these terms before requesting a trip.">
      <h2>Inquiries are not bookings</h2>
      <p>Submitting a form on this website sends an inquiry. A trip is confirmed only after our team has spoken with you and agreed the details, including the vehicle, route, date and price.</p>
      <h2>Quotes and fares</h2>
      <p>Fares depend on the vehicle, route, date and other factors, and are confirmed in the quote we send you. Information shown on this website, such as example routes or vehicle categories, is general guidance and may change.</p>
      <h2>Vehicles and availability</h2>
      <p>Vehicle availability is confirmed at the time of booking. We may offer a comparable vehicle if the one you asked for is unavailable.</p>
      <h2>Changes and cancellations</h2>
      <p>Please tell us as early as possible if your plans change. Cancellation and change terms are shared with you when your trip is confirmed.</p>
      <h2>Your responsibilities</h2>
      <p>Please provide accurate trip details and be ready at the agreed pickup time and place. Carry any identification or documents your journey requires.</p>
      <h2>Limitation</h2>
      <p>We are not responsible for delays caused by events outside our reasonable control, such as traffic, weather, road closures or government restrictions.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>
      <Contactline />
    </Shell>
  );
}
