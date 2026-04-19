import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  trailing?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  trailing,
  className,
  id,
  ...rest
}: InputProps) {
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className="block">
      {label && (
        <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          {label}
        </span>
      )}
      <span className="relative block">
        <input
          id={fieldId}
          {...rest}
          className={[
            'w-full h-10 rounded-md border bg-white px-3 text-sm text-slate-900',
            'border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
            'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:border-emerald-400',
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : '',
            trailing ? 'pr-10' : '',
            className ?? '',
          ].join(' ')}
        />
        {trailing && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400">
            {trailing}
          </span>
        )}
      </span>
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{error}</span>
      )}
    </label>
  );
}
