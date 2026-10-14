export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
export const fmtDuration = (m) => (m ? `${Math.floor(m / 60) ? `${Math.floor(m / 60)} hr ` : ''}${m % 60 ? `${m % 60} min` : ''}`.trim() : '');
export const fmtPrice = () => 'Quote on request';
export const paragraphs = (t = '') => String(t).split(/\n+/).map((x) => x.trim()).filter(Boolean);
