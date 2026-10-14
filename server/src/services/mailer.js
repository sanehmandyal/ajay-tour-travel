import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const configured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
let transporter;

async function getTransporter() {
  if (!transporter) {
    const nodemailer = (await import('nodemailer')).default;
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Fire-and-forget: never throws, so an SMTP outage cannot fail a customer's inquiry. */
export async function notifyNewInquiry(inquiry, to) {
  if (!configured() || !to) return false;
  try {
    const t = await getTransporter();
    await t.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: `New trip inquiry ${inquiry.reference}`,
      html: `<h2>New inquiry ${esc(inquiry.reference)}</h2>
<p><b>${esc(inquiry.name)}</b> – ${esc(inquiry.phone)}</p>
<p>${esc(inquiry.pickup)} → ${esc(inquiry.destination)}<br>${esc(inquiry.tripType)} · ${new Date(inquiry.travelDate).toISOString().slice(0, 10)} · ${inquiry.passengers} passenger(s)</p>
<p>${esc(inquiry.requirements || '')}</p>`,
    });
    return true;
  } catch (err) {
    logger.error({ err }, 'Inquiry email failed');
    return false;
  }
}
