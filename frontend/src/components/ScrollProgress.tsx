import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Fine ligne dorée en haut de page qui suit la progression du scroll.
 * Détail éditorial sobre, signature de la marque.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-or-500 via-or-400 to-bordeaux-700 z-[60] pointer-events-none"
      aria-hidden
    />
  );
}
