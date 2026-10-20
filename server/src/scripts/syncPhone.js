import { WebsiteSettings, FAQ, Destination, TourPackage, Route } from '../models/index.js';
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

    // Ensure Una to Delhi Route exists in DB
    const existingRoute = await Route.findOne({ slug: 'una-to-delhi' });
    if (!existingRoute) {
      await Route.create({
        from: 'Una',
        to: 'Delhi',
        slug: 'una-to-delhi',
        destinationSlug: 'una-to-delhi',
        enabled: true,
        detailsVerified: true,
        distanceKm: 360,
        approxDurationMinutes: 390,
        pricing: { mode: 'from', amount: 6200, currency: 'INR', note: 'Door-to-door drop in Delhi NCR. Tolls extra.' },
        vehicleSlugs: ['toyota-innova-crysta', 'maruti-ertiga', 'maruti-dzire'],
        description: 'Direct outstation taxi service from Una to New Delhi & NCR (Connaught Place, Karol Bagh, South Delhi, Railway Stations, Gurgaon, Noida) via NH44. Experienced highway drivers, sanitized AC cabs, 24/7 availability.',
        seo: { title: 'Una to Delhi Taxi Service | Direct Outstation Cab | Ajay Travels', description: 'Book verified 24/7 one-way or round-trip cab from Una to New Delhi & Delhi NCR. Clean AC cabs, experienced highway drivers. Call +91 70110 56581.' },
      });
      logger.info('Created Una to Delhi Route in database.');
    }

    // Ensure Una to Delhi Destination exists in DB
    const existingDest = await Destination.findOne({ slug: 'una-to-delhi' });
    if (!existingDest) {
      await Destination.create({
        name: 'Una to Delhi',
        slug: 'una-to-delhi',
        kind: 'route',
        status: 'published',
        isSample: false,
        needsVerification: false,
        h1: 'Una to Delhi Taxi Service & Outstation Cabs',
        summary: '24/7 direct cab service from Una to New Delhi, Connaught Place, Railway Stations & NCR. ~360 km via NH44.',
        introduction: 'Planning a trip from Una to New Delhi or Delhi NCR? Skip the hassle of waiting for train confirmations or crowded bus journeys.\nAjay Tour and Travels provides comfortable, sanitized doorstep taxi transfers from Una and surrounding Himachal regions directly to anywhere in Delhi NCR. Whether you are travelling for corporate meetings, family visits, hospital appointments, or shopping at Chandni Chowk and Connaught Place, our skilled highway drivers ensure a smooth, relaxed journey along National Highway 44.',
        sections: [
          { heading: 'Fast & Safe NH44 Highway Journey', body: 'The route connects Una through Mehatpur, Nangal, Rupnagar, Chandigarh bypass, Ambala, Kurukshetra, Karnal, Panipat, and Sonipat directly into Delhi via the modern 6-lane NH44. We provide comfortable stops at top dhabas like Murthal for food and refreshments.' },
          { heading: 'Complete Delhi NCR Coverage', body: 'We drop you right at your doorstep anywhere in Delhi NCR, including Central Delhi, South Delhi, West Delhi, New Delhi Railway Station (NDLS), Old Delhi Station (DLI), Hazrat Nizamuddin, as well as Noida, Gurugram, and Faridabad.' },
        ],
        heroImage: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/1280px-India_Gate_in_New_Delhi_03-2016.jpg', alt: 'Una to Delhi highway taxi service' },
        pickupInfo: 'Doorstep pickup from anywhere in Una district, Amb, Mehatpur, Haroli, or Bangana.',
        dropoffInfo: 'Direct drop at your requested address, hotel, railway station, or airport anywhere in Delhi NCR.',
        attractions: [
          { name: 'India Gate & Kartavya Path', description: 'Iconic national monument and scenic central promenade of New Delhi.' },
          { name: 'Connaught Place', description: 'Central commercial and shopping district with premier restaurants and metro hub.' },
          { name: 'New Delhi Railway Station (NDLS)', description: 'Primary intercity railway terminal with direct vehicle porch access.' },
        ],
        travelTips: [
          'Early morning departures (4:00 AM – 6:00 AM) help you beat Delhi peak-hour ring road traffic.',
          'Enjoy authentic stuffed parathas at Murthal dhabas midway during the drive.',
          'Sedans (Dzire) are ideal for 1-4 passengers; Ertiga and Innova Crysta provide expansive legroom and luggage space for families.'
        ],
        relatedSlugs: ['delhi-airport', 'una', 'amb-andaura', 'una-to-chandigarh'],
        vehicleSlugs: ['toyota-innova-crysta', 'maruti-ertiga', 'maruti-dzire'],
        faqs: [
          { question: 'What is the taxi fare from Una to Delhi?', answer: 'Our taxi fares for Una to Delhi start from ₹6,200 for a comfortable private sedan (Maruti Dzire). Premium 6-7 seater vehicles like Maruti Ertiga and Toyota Innova Crysta are also available at competitive rates.' },
          { question: 'How long does a cab take from Una to Delhi?', answer: 'The driving distance is approximately 360 km via NH44, which typically takes around 6 to 7 hours depending on traffic and rest stops.' },
          { question: 'Do you offer doorstep pickup and drop anywhere in Delhi?', answer: 'Yes! We provide 100% door-to-door pickup from your home or hotel in Una and direct drop at your exact destination in Delhi, Gurgaon, Noida, or Faridabad.' }
        ],
        seo: { title: 'Una to Delhi Taxi Service | Cabs from Una to New Delhi | Ajay Travels', description: 'Book private one-way or roundtrip cab from Una to New Delhi & NCR. Clean sanitized cabs, experienced drivers, upfront pricing. Call +91 70110 56581.' },
      });
      logger.info('Created Una to Delhi Destination in database.');
    }
  } catch (err) {
    logger.warn({ err }, 'Error during syncPhoneNumbers (non-fatal)');
  }
}
