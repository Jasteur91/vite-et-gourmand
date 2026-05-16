import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

type Props = {
  target: number;
  suffix?: string;
  format?: (n: number) => string;
};

/**
 * Compteur qui s'anime de 0 → target quand il entre dans le viewport.
 * Respecte prefers-reduced-motion.
 */
export function AnimatedCounter({ target, suffix = '', format }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      setDisplay(format ? format(target) : `${target}${suffix}`);
      return;
    }
    mv.set(target);
  }, [isInView, target, reduced, suffix, format, mv]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      const n = Math.round(v);
      setDisplay(format ? format(n) : `${n}${suffix}`);
    });
    return unsub;
  }, [spring, suffix, format]);

  return <span ref={ref}>{display}</span>;
}
