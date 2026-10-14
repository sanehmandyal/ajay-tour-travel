import { Link } from 'react-router-dom';
import { MapPin, Route, Plane, TrainFront, Users, Compass, ArrowRight } from 'lucide-react';
import { SERVICES } from '../lib/content.js';
import { Reveal } from './ui.jsx';

const ICONS = { MapPin, Route, Plane, TrainFront, Users, Compass };

export default function ServiceGrid({ dark = false }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s, i) => {
        const Icon = ICONS[s.icon];
        return (
          <Reveal as="li" key={s.id} delay={i * 60} className={`flex flex-col rounded-3xl p-6 ${dark ? 'glass text-white' : 'bg-white shadow-soft'}`}>
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${dark ? 'bg-white/15' : 'bg-teal-500/10 text-teal-700'}`}><Icon size={22} aria-hidden="true" /></span>
            <h3 className={`mt-4 text-xl font-semibold ${dark ? '!text-white' : ''}`}>{s.title}</h3>
            <p className={`mt-2 flex-1 text-[15px] leading-7 ${dark ? 'text-white/80' : 'text-navy-700'}`}>{s.text}</p>
            <Link to={`/book?requirements=${encodeURIComponent(`Service request: ${s.title}`)}`} className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition ${dark ? 'text-teal-300 hover:text-white' : 'text-teal-700 hover:text-navy-950'}`}>
              Book this service <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}
