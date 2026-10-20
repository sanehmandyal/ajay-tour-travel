import { WebsiteSettings, FAQ, Destination, TourPackage } from '../models/index.js';
import { logger } from '../utils/logger.js';

export async function syncPhoneNumbers() {
  try {
    const s = await WebsiteSettings.findOne({ key: 'main' });
    if (s) {
      let changed = false;
      if (!s.business?.phone || s.business.phone.includes('98160')) {
        s.business.phone = '+91 70110 56581';
        changed = true;
      }
      if (!s.business?.whatsapp || s.business.whatsapp.includes('98160')) {
        s.business.whatsapp = '917011056581';
        changed = true;
      }
      if (!s.business?.contactVerified) {
        s.business.contactVerified = true;
        changed = true;
      }
      if (s.announcement?.text && s.announcement.text.includes('98160')) {
        s.announcement.text = s.announcement.text.replace(/98160\s*34567/g, '70110 56581');
        changed = true;
      }
      if (changed) {
        await s.save();
        logger.info('WebsiteSettings phone number synced to 7011056581 and contactVerified enabled.');
      }
    }

    // Replace any remaining old phone numbers in FAQ answers
    await FAQ.updateMany(
      { answer: /98160/ },
      [{ $set: { answer: { $replaceAll: { input: "$answer", find: "+91 98160 34567", replacement: "+91 70110 56581" } } } }]
    ).catch(() => {});

    // Replace in Destination SEO descriptions if any
    await Destination.updateMany(
      { "seo.description": /98160/ },
      [{ $set: { "seo.description": { $replaceAll: { input: "$seo.description", find: "+91 98160 34567", replacement: "+91 70110 56581" } } } }]
    ).catch(() => {});

    // Ensure Una to Delhi Tour Package exists in DB
    const existingDelhi = await TourPackage.findOne({ slug: 'una-to-delhi-tour-package' });
    if (!existingDelhi) {
      await TourPackage.create({
        title: 'Una to Delhi & NCR Capital Tour Package (2D/1N)',
        slug: 'una-to-delhi-tour-package',
        durationDays: 2,
        durationNights: 1,
        pricing: { mode: 'from', amount: 8500, currency: 'INR', note: 'Sedan cab package. Tolls and state taxes included. Custom hotels on request.' },
        summary: 'Direct doorstep cab travel from Una / Amb Andaura to Delhi NCR, covering India Gate, Red Fort, Qutub Minar, shopping hubs, and IGI Airport drop.',
        description: 'Travel effortlessly between Una / Amb Andaura and New Delhi with Ajay Tour and Travels. Whether you need a comfortable one-way airport drop at IGI Terminal 1/3, a family sightseeing weekend in Old & New Delhi, or an important business trip, our dedicated air-conditioned private cabs provide safe highway driving along NH44 with courteous drivers, zero waiting, and total privacy.',
        itinerary: [
          { day: 1, title: 'Doorstep Pickup in Una & Smooth Highway Drive to Delhi', description: 'Early morning pickup from your home or hotel in Una / Amb Andaura. Comfortable cruise along the 6-lane NH44 highway via Chandigarh, Ambala, and Murthal (popular dhaba breakfast stop). Afternoon arrival in Delhi, hotel check-in. Evening leisure visit to India Gate, Kartavya Path, and Connaught Place. Overnight stay in Delhi.' },
          { day: 2, title: 'Delhi Sightseeing, Shopping & IGI Airport / Return Drop', description: 'Explore iconic Delhi monuments including Qutub Minar, Lotus Temple, Red Fort, or Sarojini Nagar / Chandni Chowk shopping. Evening on-time drop at Indira Gandhi International Airport (IGI T1/T2/T3), New Delhi Railway Station, or relaxed return drive to Una.' },
        ],
        inclusions: [
          'Dedicated private AC vehicle (Sedan / SUV / Innova Crysta)',
          'Experienced highway driver with full knowledge of Delhi NCR routes',
          'Fuel charges and driver allowance included',
          'Doorstep pickup in Una / Amb and direct drop at your Delhi destination / Airport terminal',
          'Round-the-clock customer support on WhatsApp and phone'
        ],
        exclusions: [
          'Hotel accommodation and meals',
          'Monument entry tickets and personal shopping',
          'Delhi MCD state border commercial tax (if applicable on outstation commercial vehicles)'
        ],
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/1280px-India_Gate_in_New_Delhi_03-2016.jpg', alt: 'India Gate New Delhi historical monument' },
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Qutub_Minar_Delhi.jpg/1280px-Qutub_Minar_Delhi.jpg', alt: 'Qutub Minar complex in New Delhi' }
        ],
        status: 'published',
        isSample: false,
        sortOrder: 6,
        seo: {
          title: 'Una to Delhi Tour Package (2D/1N) | Ajay Tour and Travels',
          description: 'Book comfortable private cab package from Una to Delhi & IGI Airport. Experienced drivers, sanitized cabs, door-to-door service. Call +91 70110 56581.'
        },
      });
      logger.info('Created Una to Delhi Tour Package in database.');
    }
  } catch (err) {
    logger.warn({ err }, 'Error during syncPhoneNumbers (non-fatal)');
  }
}
