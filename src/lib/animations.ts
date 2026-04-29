import type { Variants } from 'framer-motion';

export const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};
