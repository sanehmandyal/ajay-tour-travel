export const telHref = (phone) => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;

/** wa.me link with a correctly encoded message. `number` may include +, spaces or dashes. */
export const whatsappHref = (number, text = '') => {
  const digits = String(number || '').replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export function bookingMessage(f) {
  const lines = ['Hello Ajay Tour and Travels, I would like a quote.',
    f.pickup && `Pickup: ${f.pickup}`, f.destination && `Destination: ${f.destination}`,
    f.travelDate && `Date: ${f.travelDate}`, f.passengers && `Passengers: ${f.passengers}`,
    f.vehiclePreference && `Vehicle: ${f.vehiclePreference}`, f.reference && `Reference: ${f.reference}`];
  return lines.filter(Boolean).join('\n');
}
