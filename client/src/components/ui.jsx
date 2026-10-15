import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../lib/api.js';

/** Scroll-reveal driven by IntersectionObserver + CSS; content is always visible without JS or with reduced motion. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>{children}</Tag>;
}

const MEDIA = /^\/api\/media\/[a-f0-9]{24}$/i;
const WIDTHS = [480, 960, 1600];

/** Responsive image. Uploaded media gets a WebP srcset; fixed width/height or ratio prevents layout shift. */
export function Img({ src, alt = '', width, height, priority = false, sizes = '(min-width:1024px) 33vw, 100vw', className = '', ratio = '' }) {
  if (!src) return null;
  const media = MEDIA.test(src);
  const props = media
    ? { src: `${API_BASE}${src}/960`, srcSet: WIDTHS.map((w) => `${API_BASE}${src}/${w} ${w}w`).join(', '), sizes }
    : { src };
  return (
    <img {...props} alt={alt} width={width} height={height} decoding="async" loading={priority ? 'eager' : 'lazy'}
      {...(priority ? { fetchpriority: 'high' } : {})} className={`${ratio} ${className}`} />
  );
}

export function Cta({ to, href, variant = 'primary', className = '', children, external, ...rest }) {
  const cls = `btn-${variant} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  return <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{children}</a>;
}

export function SectionHeading({ eyebrow, title, intro, center = false, light = false, as: H = 'h2' }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {eyebrow && <p className={`eyebrow ${light ? '!text-teal-300' : ''}`}>{eyebrow}</p>}
      <H className={`h-section mt-2 ${light ? '!text-white' : ''}`}>{title}</H>
      {intro && <p className={`lead mt-4 ${light ? '!text-white/75' : ''}`}>{intro}</p>}
    </div>
  );
}

export function Breadcrumbs({ items, light = false }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className={`flex flex-wrap items-center gap-1 ${light ? 'text-white/70' : 'text-navy-700/80'}`}>
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
            {i === items.length - 1
              ? <span aria-current="page" className={light ? 'text-white' : 'font-medium text-navy-900'}>{it.name}</span>
              : <Link to={it.path} className="underline-offset-2 hover:underline">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const Spinner = ({ label = 'Loading' }) => (
  <span role="status" className="inline-flex items-center gap-2 text-sm"><Loader2 className="animate-spin" size={18} aria-hidden="true" />{label}</span>
);

export const Skeleton = ({ className = 'h-40' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function CardGridSkeleton({ n = 3 }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{Array.from({ length: n }, (_, i) => <Skeleton key={i} className="h-64" />)}</div>;
}

export function ErrorState({ message = 'We could not load this content.', onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
      <AlertTriangle className="mx-auto mb-2" aria-hidden="true" />
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-ghost mt-4">Try again</button>}
    </div>
  );
}

export const EmptyState = ({ title, children }) => (
  <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-navy-900/20 bg-white/60 p-8 text-center">
    <p className="font-display text-xl">{title}</p>
    {children && <div className="mt-2 text-navy-700">{children}</div>}
  </div>
);

export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
  bgImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
}) {
  return (
    <header className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-36 text-white sm:pb-24 sm:pt-40">
      {/* Immersive Scenic Travel Background Photo */}
      {bgImage && (
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover object-center filter brightness-[0.28] contrast-[1.12] saturate-[1.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/65 to-navy-950" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_80%_20%,rgba(26,166,160,.28),transparent_70%)]" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(26,166,160,.3),transparent),radial-gradient(40%_60%_at_0%_100%,rgba(242,138,75,.15),transparent)]" aria-hidden="true" />
      <div className="container-x relative">
        {crumbs && <div className="mb-5"><Breadcrumbs items={crumbs} light /></div>}
        {eyebrow && <p className="eyebrow !text-teal-300">{eyebrow}</p>}
        <h1 className="h-display mt-2 max-w-4xl !text-white">{title}</h1>
        {intro && <p className="lead mt-5 max-w-2xl !text-white/80">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/** Decorative mountain/gradient art used where an admin has not uploaded a photo yet. */
export function Art({ seed = 0, className = '' }) {
  const hues = [['#12294A', '#0F8C88'], ['#1B3A63', '#F28A4B'], ['#0B1B33', '#1AA6A0'], ['#2A4E7E', '#F99C62']];
  const [a, b] = hues[Math.abs(seed) % hues.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden="true">
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-3/4 w-full">
        <path d="M0 200V120l60-50 50 40 70-80 80 90 50-40 90 60v60z" fill="rgba(7,18,42,.45)" />
        <path d="M0 200V150l70-30 60 30 80-50 70 40 120-30v90z" fill="rgba(7,18,42,.6)" />
      </svg>
      <div className="absolute right-6 top-5 h-10 w-10 rounded-full bg-white/25 blur-[1px]" />
    </div>
  );
}
