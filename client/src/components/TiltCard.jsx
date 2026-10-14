import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/** Spatial UI Card with interactive 3D perspective tilt and dynamic cursor-following spotlight reflection. */
export default function TiltCard({ children, className = '', max = 6, spotlight = true }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 220, damping: 20 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    x.set(px);
    y.set(py);
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const onEnter = () => setHovered(true);
  const onLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`card-3d relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Dynamic Spatial Spotlight Glow */}
      {spotlight && !reduce && (
        <div
          className="pointer-events-none absolute -inset-px z-10 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgba(26, 166, 160, 0.15), rgba(242, 138, 75, 0.08) 40%, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle Specular Border Highlight */}
      {spotlight && !reduce && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: hovered ? 0.7 : 0,
            boxShadow: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 0 20px -3px rgba(26, 166, 160, 0.25)`,
          }}
          aria-hidden="true"
        />
      )}

      {children}
    </motion.div>
  );
}
