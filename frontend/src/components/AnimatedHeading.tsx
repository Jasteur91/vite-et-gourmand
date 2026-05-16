import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  text: string;
  className?: string;
  delay?: number;
};

/**
 * Titre dont chaque mot apparaît en cascade avec rotation 3D.
 * Style éditorial : durée plus longue, easing gourmand.
 */
export function AnimatedHeading({ text, className = '', delay = 0 }: Props) {
  const reduced = useReducedMotion();
  const words = text.split(' ');

  if (reduced) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <motion.h1
      variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 28, rotateX: -45 },
            visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
          }}
          style={{ transformOrigin: '50% 100%', display: 'inline-block' }}
        >
          {word.split('\n').map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </motion.span>
      ))}
    </motion.h1>
  );
}
