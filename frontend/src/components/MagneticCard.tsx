import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion, useTransform } from 'framer-motion';

type Props = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

/**
 * Carte avec effet "magnetic tilt" sur hover : la carte s'incline subtilement
 * vers la position du curseur (effet 3D parallax). Désactivé sur reduced motion.
 */
export function MagneticCard({ children, className = '', intensity = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 220, damping: 22 });

  function onMouseMove(e: React.MouseEvent) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
