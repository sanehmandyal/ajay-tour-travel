import { api } from './api.js';
import { useApi } from './data.jsx';
import { whatsappHref, telHref } from './contact.js';

const DEFAULT = {
  business: {
    name: 'Ajay Tour and Travels',
    phone: '+91 98160 34567',
    whatsapp: '919816034567',
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
  const b = s.business || DEFAULT.business;
  const phone = b.phone || DEFAULT.business.phone;
  const whatsapp = b.whatsapp || DEFAULT.business.whatsapp;
  return {
    ...s, loading, business: b,
    phone, whatsapp,
    callHref: phone ? telHref(phone) : null,
    waHref: (text) => whatsappHref(whatsapp, text),
  };
}
