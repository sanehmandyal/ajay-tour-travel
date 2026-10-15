// Field definitions that drive the admin forms. Server-side Zod/Mongoose validation is the source of truth.
const seo = { name: 'seo', label: 'SEO', type: 'group', fields: [
  { name: 'title', label: 'SEO title', hint: 'Aim for 60 characters or fewer', maxLength: 70 },
  { name: 'description', label: 'Meta description', type: 'textarea', rows: 3, hint: 'Aim for 70-160 characters', maxLength: 170 },
  { name: 'canonicalUrl', label: 'Canonical URL (optional)', type: 'url', hint: 'Leave empty to use the page URL' },
  { name: 'ogImage', label: 'Social sharing image URL', type: 'text' },
  { name: 'noindex', label: 'Hide from search engines', type: 'checkbox', help: 'Add noindex and leave out of the sitemap' },
] };
const status = { name: 'status', label: 'Publication Status', type: 'select', options: [['published', '🟢 Published (Visible on website)'], ['draft', '⚪ Draft (Hidden from website)']] };
const pricing = { name: 'pricing', label: 'Pricing', type: 'group', fields: [
  { name: 'mode', label: 'Price display', type: 'select', options: [['quote', 'Quote on request (no price shown)'], ['from', 'From amount'], ['fixed', 'Fixed amount']] },
  { name: 'amount', label: 'Amount (INR)', type: 'number', nullable: true, hint: 'Only used for "from" and "fixed"' },
  { name: 'note', label: 'Note', hint: 'e.g. toll and parking extra' },
] };
const image = (name, label) => ({ name, label, type: 'image' });
const sample = { name: 'isSample', label: 'Sample content', type: 'checkbox', help: 'Placeholder content. Untick once you have verified or replaced it.' };

export const RESOURCES = {
  destinations: {
    title: 'Destinations', singular: 'destination', endpoint: '/destinations', search: true,
    preview: (r) => `/destinations/${r.slug}`,
    filters: [{ key: 'status', label: 'Status', options: [['', 'All'], ['published', 'Published'], ['draft', 'Draft']] }, { key: 'kind', label: 'Type', options: [['', 'All'], ['place', 'Place'], ['route', 'Route page']] }],
    columns: [['name', 'Name'], ['slug', 'URL', (r) => `/destinations/${r.slug}`], ['kind', 'Type'], ['status', 'Status'], ['viewCount', 'Views']],
    blank: () => ({ kind: 'place', status: 'published', needsVerification: false, heroImage: {}, gallery: [], sections: [], attractions: [], travelTips: [], faqs: [], vehicleSlugs: [], relatedSlugs: [], seo: {} }),
    fields: [
      { name: 'name', label: 'Name' }, { name: 'slug', label: 'URL slug', hint: 'Lowercase letters, numbers, hyphens. Auto-generated if empty.' },
      { name: 'kind', label: 'Type', type: 'select', options: [['place', 'Place'], ['route', 'Route page']] }, status,
      { name: 'heroImage', label: '📸 Cover Photo / Hero Image (Upload from Device)', type: 'image', wide: true },
      { name: 'h1', label: 'Page heading (H1)', wide: true }, { name: 'summary', label: 'Summary', type: 'textarea', rows: 2 },
      { name: 'gallery', label: '🖼️ Destination Photo Gallery (Upload Multiple Photos from Device)', type: 'imagelist', wide: true },
      { name: 'introduction', label: 'Introduction', type: 'textarea', rows: 6, hint: 'Original, location-specific text. New lines become paragraphs.' },
      { name: 'sections', label: 'Content sections', type: 'list', addLabel: 'Add section', empty: () => ({ heading: '', body: '' }), fields: [{ name: 'heading', label: 'Heading' }, { name: 'body', label: 'Text', type: 'textarea', rows: 4 }] },
      { name: 'pickupInfo', label: 'Pickup information', type: 'textarea', rows: 3 }, { name: 'dropoffInfo', label: 'Drop-off information', type: 'textarea', rows: 3 },
      { name: 'attractions', label: 'Attractions', type: 'list', addLabel: 'Add attraction', empty: () => ({ name: '', description: '' }), fields: [{ name: 'name', label: 'Name' }, { name: 'description', label: 'Description', type: 'textarea', rows: 2 }] },
      { name: 'travelTips', label: 'Travel suggestions (one per line)', type: 'lines' },
      { name: 'vehicleSlugs', label: 'Vehicle slugs (one per line)', type: 'lines', hint: 'Slugs of published vehicles to show here' },
      { name: 'relatedSlugs', label: 'Related destination slugs (one per line)', type: 'lines' },
      { name: 'faqs', label: 'Destination FAQs', type: 'list', addLabel: 'Add FAQ', empty: () => ({ question: '', answer: '' }), fields: [{ name: 'question', label: 'Question' }, { name: 'answer', label: 'Answer', type: 'textarea', rows: 3 }] },
      { name: 'route', label: 'Linked route (for route pages)', type: 'select', nullable: true, optionsFrom: { endpoint: '/routes', label: (r) => `${r.from} to ${r.to}` } },
      { name: 'needsVerification', label: 'Needs verification', type: 'checkbox', help: 'Facts on this page have not yet been confirmed by the business' },
      sample, seo,
    ],
  },
  routes: {
    title: 'Routes', singular: 'route', endpoint: '/routes', search: true,
    filters: [{ key: 'enabled', label: 'Enabled', options: [['', 'All'], ['true', 'Enabled'], ['false', 'Disabled']] }],
    columns: [['from', 'From'], ['to', 'To'], ['enabled', 'Enabled', (r) => (r.enabled ? 'Yes' : 'No')], ['detailsVerified', 'Verified', (r) => (r.detailsVerified ? 'Yes' : 'No')]],
    blank: () => ({ enabled: true, detailsVerified: false, pricing: { mode: 'quote' }, vehicleSlugs: [], seo: {} }),
    fields: [
      { name: 'from', label: 'From' }, { name: 'to', label: 'To' }, { name: 'slug', label: 'Slug' }, { name: 'destinationSlug', label: 'Destination page slug', hint: 'The /destinations/… page this route links to' },
      { name: 'enabled', label: 'Enabled', type: 'checkbox', help: 'Show on the website' },
      { name: 'detailsVerified', label: 'Details verified', type: 'checkbox', help: 'Distance and duration are confirmed. They are hidden until this is ticked.' },
      { name: 'distanceKm', label: 'Distance (km)', type: 'number', nullable: true, step: '0.1', min: 0 }, { name: 'approxDurationMinutes', label: 'Approx. duration (minutes)', type: 'number', nullable: true, min: 0 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { name: 'vehicleSlugs', label: 'Vehicle slugs (one per line)', type: 'lines' }, pricing, seo,
    ],
  },
  vehicles: {
    title: 'Vehicles', singular: 'vehicle', endpoint: '/vehicles', search: true,
    preview: (r) => `/vehicles/${r.slug}`,
    filters: [{ key: 'status', label: 'Status', options: [['', 'All'], ['published', 'Published'], ['draft', 'Draft']] }],
    columns: [['name', 'Name'], ['category', 'Category'], ['seats', 'Seats'], ['availability', 'Availability'], ['status', 'Status']],
    blank: () => ({ status: 'published', availability: 'available', images: [], features: [], included: [], seo: {} }),
    fields: [
      { name: 'name', label: 'Vehicle Model Name' }, { name: 'slug', label: 'Slug' }, { name: 'category', label: 'Category' }, status,
      { name: 'images', label: '🚗 Vehicle Photos (Upload Car Photos from Device)', type: 'imagelist', wide: true },
      { name: 'seats', label: 'Seating capacity', type: 'number', min: 1 }, { name: 'luggageCapacity', label: 'Luggage capacity' },
      { name: 'fuelType', label: 'Fuel Type', placeholder: 'e.g. Diesel / Petrol / Hybrid' },
      { name: 'transmission', label: 'Transmission', placeholder: 'e.g. Manual / Automatic' },
      { name: 'airConditioning', label: 'Air Conditioning', placeholder: 'e.g. Climate Control AC' },
      { name: 'idealFor', label: 'Ideal For', placeholder: 'e.g. Hill Tours, Family Trips, Outstation' },
      { name: 'availability', label: 'Availability', type: 'select', options: [['available', 'Available'], ['on-request', 'On request'], ['unavailable', 'Unavailable']] },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'features', label: 'Features (one per line)', type: 'lines' },
      { name: 'included', label: 'Included In Fare (one per line)', type: 'lines', hint: 'e.g. Driver Allowance, Sanitized Cab, Fuel' },
      sample, seo,
    ],
  },
  packages: {
    title: 'Tour packages', singular: 'package', endpoint: '/packages', search: true,
    preview: () => '/packages',
    filters: [{ key: 'status', label: 'Status', options: [['', 'All'], ['published', 'Published'], ['draft', 'Draft']] }],
    columns: [['title', 'Title'], ['durationDays', 'Days'], ['status', 'Status']],
    blank: () => ({ status: 'published', pricing: { mode: 'quote' }, images: [], itinerary: [], inclusions: [], exclusions: [], seo: {} }),
    fields: [
      { name: 'title', label: 'Package Title' }, { name: 'slug', label: 'Slug' }, status, { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'images', label: '📦 Tour Package Photos (Upload Photos from Device)', type: 'imagelist', wide: true },
      { name: 'durationDays', label: 'Days', type: 'number', min: 1 }, { name: 'durationNights', label: 'Nights', type: 'number', min: 0 },
      { name: 'summary', label: 'Summary', type: 'textarea', rows: 2 }, { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
      { name: 'itinerary', label: 'Itinerary', type: 'list', addLabel: 'Add day', empty: () => ({ title: '', description: '' }), fields: [{ name: 'day', label: 'Day', type: 'number', min: 1 }, { name: 'title', label: 'Title' }, { name: 'description', label: 'Details', type: 'textarea', rows: 2 }] },
      { name: 'inclusions', label: 'Inclusions (one per line)', type: 'lines' }, { name: 'exclusions', label: 'Exclusions (one per line)', type: 'lines' },
      pricing, sample, seo,
    ],
  },
  blog: {
    title: 'Blog posts', singular: 'post', endpoint: '/blog', search: true,
    filters: [{ key: 'status', label: 'Status', options: [['', 'All'], ['published', 'Published'], ['draft', 'Draft']] }],
    columns: [['title', 'Title'], ['category', 'Category'], ['status', 'Status'], ['publishedAt', 'Published', (r) => (r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('en-IN') : '')]],
    blank: () => ({ status: 'published', featuredImage: {}, tags: [], seo: {}, author: 'Ajay Tour and Travels' }),
    preview: (r) => `/blog/${r.slug}`,
    fields: [
      { name: 'title', label: 'Article Title' }, { name: 'slug', label: 'Slug' }, { name: 'author', label: 'Author' }, { name: 'category', label: 'Category' }, status,
      { name: 'featuredImage', label: '📝 Featured Cover Image (Upload from Device)', type: 'image', wide: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
      { name: 'tags', label: 'Tags (one per line)', type: 'lines', rows: 3 },
      { name: 'content', label: 'Content (HTML)', type: 'html', hint: 'Allowed: h2-h4, p, ul/ol/li, strong, em, a, blockquote, img, figure. Anything else is removed when saved.' }, sample, seo,
    ],
  },
  faqs: {
    title: 'FAQs', singular: 'FAQ', endpoint: '/faqs', search: true,
    filters: [{ key: 'scope', label: 'Scope', options: [['', 'All'], ['global', 'Global'], ['page', 'Page-specific']] }],
    columns: [['question', 'Question'], ['scope', 'Scope'], ['pageSlug', 'Page'], ['status', 'Status']],
    blank: () => ({ scope: 'global', status: 'published' }),
    fields: [
      { name: 'question', label: 'Question', wide: true }, { name: 'answer', label: 'Answer', type: 'textarea', rows: 4 },
      { name: 'scope', label: 'Scope', type: 'select', options: [['global', 'Global (FAQ page and home)'], ['page', 'A specific page']] }, { name: 'pageSlug', label: 'Page slug', hint: 'Destination slug, if page-specific' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' }, status, sample,
    ],
  },
  redirects: {
    title: 'Redirects', singular: 'redirect', endpoint: '/redirects', search: true, filters: [],
    columns: [['from', 'From'], ['to', 'To'], ['statusCode', 'Code'], ['enabled', 'Enabled', (r) => (r.enabled ? 'Yes' : 'No')]],
    blank: () => ({ statusCode: 301, enabled: true }),
    fields: [
      { name: 'from', label: 'From path', placeholder: '/old-page', hint: 'Must start with /' }, { name: 'to', label: 'To', placeholder: '/new-page or https://…' },
      { name: 'statusCode', label: 'Status code', type: 'select', numeric: true, options: [['301', '301 Permanent'], ['302', '302 Temporary'], ['307', '307 Temporary (keeps method)'], ['308', '308 Permanent (keeps method)']] },
      { name: 'enabled', label: 'Enabled', type: 'checkbox', help: 'Active' },
    ],
  },
};

const sec = (name, label, fields) => ({ name, label, type: 'group', fields });
export const SETTINGS_TABS = [
  ['Business', [sec('business', 'Business details', [
    { name: 'name', label: 'Business name' }, { name: 'tagline', label: 'Tagline' }, { name: 'logoUrl', label: 'Logo URL' },
    { name: 'phone', label: 'Phone number' }, { name: 'whatsapp', label: 'WhatsApp number', hint: 'With country code, e.g. 91XXXXXXXXXX' },
    { name: 'email', label: 'Business email', type: 'email' }, { name: 'hours', label: 'Business hours' },
    { name: 'address', label: 'Business address', type: 'textarea', rows: 2 }, { name: 'serviceAreas', label: 'Service areas (one per line)', type: 'lines' },
    { name: 'googleBusinessProfileUrl', label: 'Google Business Profile URL', type: 'url' }, { name: 'mapEmbedUrl', label: 'Google Maps embed URL', hint: 'Add only after the real location is verified' },
    { name: 'contactVerified', label: 'Contact details verified', type: 'checkbox', help: 'Tick only when phone, email and address above are real. Until then they stay hidden from visitors and search engines.' },
  ])]],
  ['Homepage', [sec('home', 'Homepage content', [
    { name: 'heroHeadline', label: 'Hero headline', wide: true }, { name: 'heroSubheadline', label: 'Hero sub-headline', type: 'textarea', rows: 2 },
    { name: 'whyChoose', label: 'Why choose us', type: 'list', addLabel: 'Add point', empty: () => ({ title: '', text: '' }), fields: [{ name: 'title', label: 'Title' }, { name: 'text', label: 'Text', type: 'textarea', rows: 2 }] },
    { name: 'processSteps', label: 'Booking steps', type: 'list', addLabel: 'Add step', empty: () => ({ title: '', text: '' }), fields: [{ name: 'title', label: 'Title' }, { name: 'text', label: 'Text', type: 'textarea', rows: 2 }] },
  ])]],
  ['Announcement & footer', [
    sec('announcement', 'Announcement bar', [{ name: 'enabled', label: 'Show', type: 'checkbox', help: 'Show the bar' }, { name: 'text', label: 'Text', maxLength: 200 }, { name: 'linkUrl', label: 'Link (optional)' }]),
    sec('footer', 'Footer', [{ name: 'about', label: 'About text', type: 'textarea', rows: 3 }, { name: 'copyright', label: 'Copyright line' }]),
    sec('social', 'Social links', [{ name: 'facebook', label: 'Facebook URL' }, { name: 'instagram', label: 'Instagram URL' }, { name: 'youtube', label: 'YouTube URL' }]),
  ]],
  ['Reviews', [{ name: 'reviews', label: 'Customer reviews', type: 'list', addLabel: 'Add review', empty: () => ({ author: '', text: '', rating: 5, source: '', approved: false }),
    fields: [{ name: 'author', label: 'Customer name' }, { name: 'text', label: 'Review', type: 'textarea', rows: 3 }, { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1 }, { name: 'source', label: 'Source (e.g. Google)' }, { name: 'approved', label: 'Show on site', type: 'checkbox', help: 'Only add genuine reviews you have permission to publish' }] }]],
  ['Notifications & analytics', [
    sec('notifications', 'Inquiry notifications', [{ name: 'emailOnInquiry', label: 'Email me new inquiries', type: 'checkbox', help: 'Needs SMTP settings on the server' }, { name: 'notifyEmail', label: 'Notification email', type: 'email' }]),
    sec('analytics', 'Analytics and verification', [{ name: 'gaMeasurementId', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' }, { name: 'searchConsoleVerification', label: 'Search Console verification code', hint: 'The content value of the google-site-verification meta tag' }]),
    { name: 'retentionDays', label: 'Keep inquiry details for (days)', type: 'number', min: 30, hint: 'Older inquiries are anonymized when you run the retention clean-up from the Inquiries page.' },
  ]],
];
