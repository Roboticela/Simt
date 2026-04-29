import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  animate?: boolean;
  delay?: number;
}

export function Card({
  title,
  subtitle,
  action,
  padded = true,
  animate = true,
  delay = 0,
  className,
  children,
  ...rest
}: CardProps) {
  const content = (
    <section
      {...rest}
      className={[
        'overflow-hidden rounded-3xl border border-border/60 bg-card',
        className ?? '',
      ].join(' ')}
    >
      {(title || subtitle || action) && (
        <header className="flex flex-col gap-2 border-b border-border/50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs leading-5 text-foreground/50">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0 self-start">{action}</div>}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}
