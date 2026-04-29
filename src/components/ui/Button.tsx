import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  animated?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80',
  secondary:
    'bg-accent text-foreground hover:bg-border active:opacity-80',
  ghost:
    'bg-transparent text-foreground/70 hover:bg-accent hover:text-foreground',
  outline:
    'border border-border/70 bg-card/60 text-foreground/70 hover:bg-accent hover:text-foreground',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    block,
    leading,
    trailing,
    animated = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const base = (
    <button
      ref={ref}
      type="button"
      {...rest}
      className={[
        'inline-flex items-center justify-center rounded-2xl font-semibold transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        block ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );

  if (!animated) return base;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={block ? 'w-full' : 'inline-flex'}
    >
      {base}
    </motion.div>
  );
});
