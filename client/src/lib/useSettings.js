import { api } from './api.js';
import { useApi } from './data.jsx';
import { whatsappHref, telHref } from './contact.js';

const DEFAULT = {
  business: {
    name: 'Himyatra Tour and Travels',
    phone: '+91 70110 56581',
    whatsapp: '917011056581',
    serviceAreas: ['Amb Andaura', 'Una', 'Chintpurni', 'Ludhiana', 'Chandigarh'],
    contactVerified: true
  },
  social: {},
  announcement: {},
  home: {},
  footer: {},
  reviews: [],
  analytics: {}
};

export function useSettings() {
  const { data, loading } = useApi('settings', () => api.get('/api/settings/public'));
  const s = data || DEFAULT;
  const rawBusiness = s.business || DEFAULT.business;
  const rawName = rawBusiness.name || '';
  const cleanName = (!rawName || /ajay/i.test(rawName)) ? 'Himyatra Tour and Travels' : rawName;
  const b = {
    ...rawBusiness,
    name: cleanName,
    email: (rawBusiness.email && !/ajay/i.test(rawBusiness.email)) ? rawBusiness.email : (rawBusiness.email ? 'info@himyatratourtravels.com' : ''),
  };
  const phone = b.phone || DEFAULT.business.phone;
  const whatsapp = b.whatsapp || DEFAULT.business.whatsapp;

  const footer = {
    ...s.footer,
    about: s.footer?.about
      ? s.footer.about.replace(/Ajay\s*(Tour(\s*(&|and)?\s*Travels?)?|Travels?)/gi, 'Himyatra Tour and Travels')
      : 'Himyatra Tour and Travels is District Una’s premier taxi and travel agency based near Amb Andaura Railway Station. We provide dependable airport transfers, outstation cabs, Himachal pilgrimage yatra, and customized tour packages across Himachal Pradesh, Punjab, and Chandigarh.',
    copyright: s.footer?.copyright
      ? s.footer.copyright.replace(/Ajay\s*(Tour(\s*(&|and)?\s*Travels?)?|Travels?)/gi, 'Himyatra Tour and Travels')
      : `© ${new Date().getFullYear()} Himyatra Tour and Travels. All rights reserved. Serving Amb Andaura, Una, Ludhiana & Chandigarh.`,
  };

  return {
    ...s,
    footer,
    loading,
    business: b,
    phone,
    whatsapp,
    callHref: phone ? telHref(phone) : null,
    waHref: (text) => whatsappHref(whatsapp, text),
  };
}
