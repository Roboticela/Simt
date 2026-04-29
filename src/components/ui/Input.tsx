import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  trailing?: ReactNode;
}

export function Input({ label, hint, error, trailing, className, id, ...rest }: InputProps) {
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-foreground/60">
          {label}
        </span>
      )}
      <span className="relative block">
        <input
          id={fieldId}
          {...rest}
          className={[
            'h-11 w-full rounded-2xl border bg-card/80 px-4 text-sm font-medium text-foreground shadow-sm',
            'border-border/60 placeholder:text-foreground/30',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            error ? 'border-red-500 focus:ring-red-500/20' : '',
            trailing ? 'pr-10' : '',
            className ?? '',
          ].join(' ')}
        />
        {trailing && (
          <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-foreground/40">
            {trailing}
          </span>
        )}
      </span>
      {hint && !error && (
        <span className="mt-1.5 block text-xs text-foreground/40">{hint}</span>
      )}
      {error && (
        <span className="mt-1.5 block text-xs text-red-500">{error}</span>
      )}
    </label>
  );
}
