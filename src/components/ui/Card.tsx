import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  subtitle,
  action,
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <section
      {...rest}
      className={[
        'rounded-xl border border-slate-200 bg-white',
        'dark:border-slate-800 dark:bg-slate-900',
        'overflow-hidden',
        className ?? '',
      ].join(' ')}
    >
      {(title || subtitle || action) && (
        <header className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>
  );
}
