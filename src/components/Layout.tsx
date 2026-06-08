import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  duration: 0.18,
  ease: 'easeInOut' as const,
};

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      {/* Subtle ambient gradient – adapts per theme */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 10%, color-mix(in srgb, var(--primary) 20%, transparent), transparent)',
            'radial-gradient(ellipse 70% 50% at 80% 90%, color-mix(in srgb, var(--primary) 12%, transparent), transparent)',
          ].join(', '),
        }}
      />

      <Header />

      {/* Desktop push-over for side nav */}
      <div className="lg:ps-60">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="mx-auto w-full max-w-2xl px-4 pt-20 pb-24 sm:px-6 sm:pt-22 md:max-w-4xl lg:max-w-5xl lg:px-8 lg:pb-10 lg:pt-20"
          >
            {children}
          </motion.main>
        </AnimatePresence>

      </div>
    </div>
  );
}
