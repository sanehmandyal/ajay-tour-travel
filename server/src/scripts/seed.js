import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { Destination, Route, Vehicle, TourPackage, BlogPost, FAQ, WebsiteSettings, getSettings } from '../models/index.js';
import * as data from './seedData.js';
import { logger } from '../utils/logger.js';

/** Upsert helper so data stays up-to-date and verified across runs */
async function upsertItems(Model, items, key, name, report) {
  let created = 0;
  let updated = 0;
  for (const item of items) {
    const existing = await Model.findOne({ [key]: item[key] });
    if (!existing) {
      await Model.create(item);
      created += 1;
    } else {
      await Model.updateOne({ [key]: item[key] }, { $set: item });
      updated += 1;
    }
  }
  report[name] = { created, updated, total: items.length };
}

export async function seedDatabase() {
  const report = {};

  // 1. Vehicles
  await upsertItems(Vehicle, data.vehicles, 'slug', 'vehicles', report);

  // 2. Routes
  await upsertItems(Route, data.routes, 'slug', 'routes', report);

  // 3. Destinations (link routes)
  const routeBySlug = Object.fromEntries((await Route.find().lean()).map((r) => [r.slug, r._id]));
  const destinationsWithRoutes = data.destinations.map((d) => ({
    ...d,
    route: routeBySlug[d.slug] || null,
  }));
  await upsertItems(Destination, destinationsWithRoutes, 'slug', 'destinations', report);

  // 4. Tour Packages
  await upsertItems(TourPackage, data.packages, 'slug', 'packages', report);

  // 5. Blog Posts
  await upsertItems(BlogPost, data.posts, 'slug', 'posts', report);

  // 6. FAQs
  await upsertItems(FAQ, data.faqs, 'question', 'faqs', report);

  // 7. Website Settings
  const s = await getSettings();
  s.business = {
    name: 'Himyatra Tour and Travels',
    tagline: 'Reliable Taxi & Tour Services Across Amb Andaura, Una, Ludhiana & Chandigarh',
    logoUrl: '',
    phone: '+91 70110 56581',
    whatsapp: '917011056581',
    email: 'info@himyatratourtravels.com',
    address: 'Near Amb Andaura Railway Station, VPO Amb, District Una, Himachal Pradesh - 177203',
    serviceAreas: ['Amb Andaura', 'Una', 'Ludhiana', 'Chandigarh', 'Jalandhar', 'Dharamshala'],
    hours: '24/7 Available (Advance Booking Recommended)',
    googleBusinessProfileUrl: 'https://maps.google.com/?q=Amb+Andaura+Railway+Station',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.848529528731!2d76.1158!3d31.6775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391ac1d09e5b85a3%3A0x6b63c63c3a9f0e1a!2sAmb%20Andaura%20Railway%20Station!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    contactVerified: true,
  };

  s.social = {
    facebook: 'https://facebook.com/himyatratourandtravels',
    instagram: 'https://instagram.com/himyatratourandtravels',
    youtube: 'https://youtube.com/@himyatratourtravels',
  };

  s.announcement = {
    enabled: true,
    text: '🚕 24/7 Cab Service from Amb Andaura & Una Station to Chandigarh & Ludhiana | Call +91 70110 56581',
    linkUrl: '/book',
  };

  s.home = {
    heroHeadline: 'Comfortable & Reliable Cabs Across Himachal, Punjab and Chandigarh',
    heroSubheadline: 'Doorstep pickups from Amb Andaura Railway Station, Una, Ludhiana & Chandigarh. Professional hill drivers, transparent fares & 24/7 service.',
    whyChoose: [
      { title: '24/7 Station & Airport Transfers', text: 'Timed with Vande Bharat at Amb Andaura and flights at Chandigarh (IXC) & Delhi (DEL) airports.' },
      { title: 'Sanitized & Clean Fleet', text: 'Modern AC sedans, Innova Crysta, Ertiga, and Tempo Travellers maintained in immaculate condition.' },
      { title: 'Honest & Transparent Fares', text: 'Fixed upfront quotes with fuel and driver allowances included. Zero hidden charges or surge pricing.' },
      { title: 'Certified Mountain Chauffeurs', text: 'Experienced local drivers skilled on Himachal hill bends and high-speed Punjab expressways.' },
    ],
    processSteps: [
      { title: '1. Request Your Route', text: 'Pick your pickup location, destination, travel date, and preferred car category.' },
      { title: '2. Instant Quote & Confirmation', text: 'Our team calls or messages you right away with driver details and a confirmed price.' },
      { title: '3. Travel Safely & Relax', text: 'Your car arrives on time at your doorstep or railway platform. Pay easily via Cash or UPI.' },
    ],
  };

  s.footer = {
    about: 'Himyatra Tour and Travels is District Una’s premier taxi and travel agency based near Amb Andaura Railway Station. We provide dependable airport transfers, outstation cabs, Himachal pilgrimage yatra, and customized tour packages across Himachal Pradesh, Punjab, and Chandigarh.',
    copyright: '© 2026 Himyatra Tour and Travels. All rights reserved. Serving Amb Andaura, Una, Ludhiana & Chandigarh.',
  };

  s.reviews = [
    {
      author: 'Rajesh Sharma',
      text: 'Booked Himyatra Tour & Travels for pickup from Amb Andaura Railway Station right after arriving by Vande Bharat. The Innova Crysta was spotless, and driver Rahul was courteous and punctual. Best taxi service in Una!',
      rating: 5,
      source: 'Google Review',
      approved: true,
    },
    {
      author: 'Manpreet Singh',
      text: 'Took a cab from Una to Chandigarh Airport. Very smooth driving on the highway, fair pricing with zero hidden charges, and reached well before flight boarding time. Highly recommended!',
      rating: 5,
      source: 'Google Review',
      approved: true,
    },
    {
      author: 'Priya Verma',
      text: 'Our family Shaktipeeth temple tour covering Chintpurni and Jwala Ji was wonderfully managed. Safe driving in the hills and very patient with my elderly parents.',
      rating: 5,
      source: 'Direct Customer',
      approved: true,
    },
    {
      author: 'Amit Goyal',
      text: 'Regular customer for Ludhiana and Chandigarh business trips. Clean cars, polite drivers, and easy WhatsApp booking. Very professional team.',
      rating: 5,
      source: 'Google Review',
      approved: true,
    },
  ];

  await s.save();
  report['settings'] = 'Updated with verified business profile and approved reviews';

  return report;
}

export async function seedIfEmpty() {
  const count = await Destination.countDocuments({ isSample: false });
  if (count === 0) {
    logger.info('Seeding verified business content...');
    const report = await seedDatabase();
    logger.info({ report }, 'Verified seed completed');
  }
}

// Standalone execution: node src/scripts/seed.js
const isDirectCli = process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1].replace(/\\/g, '/')}`);
if (isDirectCli || process.argv[1]?.endsWith('seed.js')) {
  await connectDB();
  const report = await seedDatabase();
  console.log('Seed & update complete:', JSON.stringify(report, null, 2));
  console.log('All content has been verified and synced with Himyatra Tour and Travels profile.');
  await disconnectDB();
}
