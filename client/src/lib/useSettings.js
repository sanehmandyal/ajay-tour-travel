import { api } from './api.js';
import { useApi } from './data.jsx';
import { whatsappHref, telHref } from './contact.js';

const DEFAULT = { business: { name: 'Ajay Tour and Travels', serviceAreas: [], contactVerified: false }, social: {}, announcement: {}, home: {}, footer: {}, reviews: [], analytics: {} };

export function useSettings() {
  const { data, loading } = useApi('settings', () => api.get('/api/settings/public'));
  const s = data || DEFAULT;
  const b = s.business || DEFAULT.business;
  return {
    ...s, loading, business: b,
    phone: b.phone || '', whatsapp: b.whatsapp || '',
    callHref: b.phone ? telHref(b.phone) : null,
    waHref: (text) => (b.whatsapp ? whatsappHref(b.whatsapp, text) : null),
  };
}
