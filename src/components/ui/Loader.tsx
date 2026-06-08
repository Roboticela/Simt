import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const SIZES = {
  sm: 'h-7 w-7',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
} as const;

type LoaderSize = keyof typeof SIZES;

interface LoaderProps {
  size?: LoaderSize;
  className?: string;
  label?: string;
}

/** Gradient ring + pulsing core — matches Simt primary / tertiary theme */
export function Loader({ size = 'md', className = '', label }: LoaderProps) {
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${SIZES[size]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label ?? 'Loading'}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-primary/15"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-tertiary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      />
      <motion.span
        className="absolute inset-[28%] rounded-full bg-gradient-to-br from-primary to-tertiary shadow-[0_0_12px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
        animate={{ scale: [0.88, 1, 0.88], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function LoaderDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function LoaderSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full space-y-2 px-1" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="loader-shimmer h-11 rounded-2xl"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

interface LoadingPanelProps {
  label?: ReactNode;
  sublabel?: ReactNode;
  size?: LoaderSize;
  skeleton?: boolean;
  className?: string;
}

/** Centered loader for Suspense fallbacks and empty panels */
export function LoadingPanel({
  label,
  sublabel,
  size = 'lg',
  skeleton = true,
  className = '',
}: LoadingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center gap-5 py-10 ${className}`}
    >
      <Loader size={size} />
      {(label || sublabel) && (
        <div className="flex flex-col items-center gap-1.5 text-center">
          {label && (
            <p className="text-sm font-semibold text-foreground/75">{label}</p>
          )}
          {sublabel && (
            <p className="flex items-center gap-2 text-xs text-foreground/45">
              {sublabel}
              <LoaderDots />
            </p>
          )}
        </div>
      )}
      {skeleton && (
        <div className="w-full max-w-sm">
          <LoaderSkeleton rows={4} />
        </div>
      )}
    </motion.div>
  );
}

interface LoadingOverlayProps {
  label?: ReactNode;
  className?: string;
}

/** In-place overlay while a section updates (e.g. step change) */
export function LoadingOverlay({ label, className = '' }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={[
        'absolute inset-0 z-10 flex flex-col items-center justify-center gap-3',
        'rounded-2xl bg-background/70 backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      <Loader size="md" />
      {label && (
        <p className="flex items-center gap-2 px-4 text-center text-xs font-semibold text-foreground/60">
          {label}
          <LoaderDots />
        </p>
      )}
    </motion.div>
  );
}
