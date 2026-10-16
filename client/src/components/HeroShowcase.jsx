import { Star, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

export default function HeroShowcase({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer Spatial Frame */}
      <div className="relative mx-auto max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-navy-900/80 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
        {/* Main Vehicle Showcase Image */}
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-950">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Toyota_Innova_Crysta.jpg/1280px-Toyota_Innova_Crysta.jpg"
            alt="Toyota Innova Crysta luxury tour vehicle serving Amb Andaura, Una, and Himachal Pradesh"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="eager"
            decoding="async"
            width={800}
            height={500}
          />
          {/* Lighting Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-950/60 via-transparent to-transparent" />

          {/* Top-Left Live Status Badge */}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/20 bg-navy-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-md sm:left-4 sm:top-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>24/7 Station Taxi</span>
          </div>

          {/* Top-Right Verified Rating Badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-navy-950/80 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-md backdrop-blur-md sm:right-4 sm:top-4">
            <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            <span>4.9 (500+ Trips)</span>
          </div>

          {/* Clean Bottom Overlay Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 via-navy-950/75 to-transparent px-4 pb-3.5 pt-8">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-300">
              <Sparkles size={12} className="text-teal-300" aria-hidden="true" />
              Amb Andaura &amp; Una Station Cabs
            </p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-white">
              Vande Bharat Timed Pickups &amp; Highway Drops
            </p>
          </div>
        </div>

        {/* Integrated Clean Trust Feature Row */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
            <p className="flex items-center justify-center gap-1 text-xs font-bold text-teal-300">
              <ShieldCheck size={14} className="text-teal-400" aria-hidden="true" />
              Clean Fleet
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">100% Chilled AC</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
            <p className="flex items-center justify-center gap-1 text-xs font-bold text-sunset-300">
              <Clock size={14} className="text-sunset-400" aria-hidden="true" />
              Zero Waiting
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">Ready on Arrival</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
            <p className="flex items-center justify-center gap-1 text-xs font-bold text-amber-300">
              <MapPin size={14} className="text-amber-400" aria-hidden="true" />
              Fixed Quotes
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">No Hidden Surge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
