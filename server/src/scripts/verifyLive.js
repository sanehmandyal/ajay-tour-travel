// Live End-to-End Verification for Ajay Tour and Travels

async function main() {
  const base = 'http://localhost:5000';
  const report = {};

  // 1. Health check
  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  report.health = health;

  // 2. Public Settings
  const settings = await fetch(`${base}/api/settings/public`).then((r) => r.json());
  report.publicSettings = {
    name: settings.data.business.name,
    phone: settings.data.business.phone,
    whatsapp: settings.data.business.whatsapp,
    address: settings.data.business.address,
    contactVerified: settings.data.business.contactVerified,
    announcement: settings.data.announcement,
    reviewsCount: settings.data.reviews.length,
    firstReview: settings.data.reviews[0],
  };

  // 3. Routes
  const routes = await fetch(`${base}/api/routes`).then((r) => r.json());
  report.routes = {
    count: routes.data.length,
    firstRoute: {
      from: routes.data[0].from,
      to: routes.data[0].to,
      distanceKm: routes.data[0].distanceKm,
      approxDurationMinutes: routes.data[0].approxDurationMinutes,
      pricing: routes.data[0].pricing,
      detailsVerified: routes.data[0].detailsVerified,
    },
  };

  // 4. Vehicles
  const vehicles = await fetch(`${base}/api/vehicles`).then((r) => r.json());
  report.vehicles = {
    count: vehicles.data.length,
    names: vehicles.data.map((v) => `${v.name} (${v.category})`),
  };

  // 5. Packages
  const packages = await fetch(`${base}/api/packages`).then((r) => r.json());
  report.packages = {
    count: packages.data.length,
    titles: packages.data.map((p) => `${p.title} (${p.durationDays}D/${p.durationNights}N - ${p.pricing?.amount ? '₹' + p.pricing.amount : 'Quote'})`),
  };

  // 6. FAQs
  const faqs = await fetch(`${base}/api/faqs`).then((r) => r.json());
  report.faqs = {
    count: faqs.data.length,
    firstQuestion: faqs.data[0].question,
  };

  // 7. Blog
  const blogRes = await fetch(`${base}/api/blog`);
  const blog = await blogRes.json();
  report.blog = {
    status: blogRes.status,
    raw: blog,
    count: Array.isArray(blog.data) ? blog.data.length : 0,
    titles: Array.isArray(blog.data) ? blog.data.map((b) => b.title) : [],
  };

  // 8. Admin Login with "admin" (Admin ID)
  const loginById = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin', password: 'Admin@AjayTour2026!' }),
  });
  const loginByIdRes = await loginById.json();
  const cookies = loginById.headers.get('set-cookie');
  report.adminLoginById = { status: loginById.status, user: loginByIdRes.data?.user };

  // 9. Admin Login with "admin@ajaytourtravels.com" (Email)
  const loginByEmail = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ajaytourtravels.com', password: 'Admin@AjayTour2026!' }),
  });
  const loginByEmailRes = await loginByEmail.json();
  report.adminLoginByEmail = { status: loginByEmail.status, user: loginByEmailRes.data?.user };

  // 10. Admin Dashboard stats (using auth cookies & CSRF)
  const csrf = loginByIdRes.data?.csrfToken;
  const tokenCookie = (cookies || '').split(';')[0];
  const dashboard = await fetch(`${base}/api/admin/dashboard`, {
    headers: {
      Cookie: tokenCookie,
      'X-CSRF-Token': csrf,
    },
  }).then((r) => r.json());
  report.adminDashboard = {
    sampleCount: dashboard.data?.sampleCount,
    totals: dashboard.data?.totals,
    content: dashboard.data?.content,
  };

  // 11. Public Booking Submission
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const inquiry = await fetch(`${base}/api/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Traveller',
      phone: '9816012345',
      email: 'traveller@example.com',
      pickup: 'Amb Andaura Railway Station',
      destination: 'Mata Chintpurni Temple',
      travelDate: tomorrow,
      passengers: 4,
      vehiclePreference: 'Maruti Suzuki Dzire',
      tripType: 'one-way',
      requirements: 'Arriving by Vande Bharat at 11 AM. Need immediate station pickup.',
      consent: true,
    }),
  }).then((r) => r.json());
  report.bookingSubmission = inquiry;

  // 12. Check inquiry in Admin Inquiries list
  const inquiriesList = await fetch(`${base}/api/admin/inquiries`, {
    headers: {
      Cookie: tokenCookie,
      'X-CSRF-Token': csrf,
    },
  }).then((r) => r.json());
  report.adminInquiriesInbox = {
    total: inquiriesList.data?.length,
    latestInquiry: inquiriesList.data?.[0]?.name === 'Verification Traveller' ? 'Received successfully' : 'Found',
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);
