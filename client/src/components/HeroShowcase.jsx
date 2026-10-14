import { Star, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

export default function HeroShowcase({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer Glow & Spatial Gradient Frame */}
      <div className="spatial-glass relative mx-auto max-w-lg overflow-hidden rounded-3xl p-2.5 sm:p-3.5">
        {/* Main Professional Showcase Image */}
        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy-900 sm:aspect-[16/11]">
          <img
            src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
            alt="Ajay Tour & Travels professional sedan cab travelling on scenic Himachal mountain highway"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="eager"
            decoding="async"
            width={800}
            height={550}
          />
          {/* Subtle lighting overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-950/60 via-transparent to-transparent" />

          {/* Top-Left Live Status Badge */}
          <div className="spatial-pill absolute left-3 top-3 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:left-4 sm:top-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span>24/7 Available at Station</span>
          </div>

          {/* Top-Right Rating Badge */}
          <div className="spatial-pill absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white sm:right-4 sm:top-4">
            <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            <span>4.9 / 5.0 (500+ Trips)</span>
          </div>

          {/* Bottom Overlay Card with Spatial Glass Effect */}
          <div className="spatial-glass absolute inset-x-3 bottom-3 rounded-2xl p-3.5 sm:inset-x-4 sm:bottom-4 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-300 sm:text-xs">
                  <Sparkles size={12} className="text-teal-300" aria-hidden="true" />
                  Amb Andaura &amp; Una Station Cabs
                </p>
                <p className="mt-1 text-sm font-bold text-white sm:text-base">
                  Vande Bharat Timed Pickups &amp; Highway Drops
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/80">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={12} className="text-teal-400" aria-hidden="true" />
                    Clean AC Fleet
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} className="text-sunset-400" aria-hidden="true" />
                    Zero Waiting Time
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} className="text-amber-400" aria-hidden="true" />
                    Upfront Transparent Quotes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Spatial Accent Trust Pill (Left) */}
      <div className="spatial-pill spatial-float pointer-events-none absolute -bottom-5 -left-4 hidden rounded-2xl p-3.5 shadow-float lg:block">
        <p className="flex items-center gap-2 text-xs font-bold text-white">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-500/20 text-teal-300">
            🚕
          </span>
          Doorstep &amp; Station Pickups
        </p>
        <p className="mt-1 text-[11px] text-white/75">Amb Andaura · Una · Ludhiana · Chandigarh</p>
      </div>

      {/* Floating Spatial Accent Trust Pill (Right) */}
      <div className="spatial-pill spatial-float-slow pointer-events-none absolute -right-4 -top-3 hidden rounded-2xl p-3.5 shadow-float lg:block">
        <p className="flex items-center gap-2 text-xs font-bold text-white">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-sunset-500/20 text-sunset-300">
            <ShieldCheck size={14} className="text-sunset-300" aria-hidden="true" />
          </span>
          Transparent Upfront Quotes
        </p>
        <p className="mt-1 text-[11px] text-white/75">Fuel &amp; driver allowance included. No surge.</p>
      </div>
    </div>
  );
}
