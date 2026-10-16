import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/** Spatial UI Card with smooth 3D perspective tilt and performant GPU spotlight */
export default function TiltCard({ children, className = '', max = 5, spotlight = true }) {
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 280, damping: 25 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 280, damping: 25 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    x.set(px);
    y.set(py);
    e.currentTarget.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`group card-3d relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Dynamic Spatial Spotlight Glow via CSS Variables (Zero re-renders!) */}
      {spotlight && !reduce && (
        <div
          className="pointer-events-none absolute -inset-px z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: 'radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(26, 166, 160, 0.14), rgba(242, 138, 75, 0.06) 40%, transparent 80%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle Specular Border Highlight */}
      {spotlight && !reduce && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), 0 0 20px -3px rgba(26, 166, 160, 0.2)',
          }}
          aria-hidden="true"
        />
      )}

      {children}
    </motion.div>
  );
}
