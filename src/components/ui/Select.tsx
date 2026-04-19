import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: ReactNode;
  hint?: ReactNode;
  options: SelectOption[];
  onValueChange?: (v: string) => void;
}

export function Select({
  label,
  hint,
  options,
  onValueChange,
  id,
  className,
  ...rest
}: SelectProps) {
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className="block">
      {label && (
        <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          {label}
        </span>
      )}
      <select
        id={fieldId}
        {...rest}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={[
          'w-full h-10 rounded-md border bg-white px-3 text-sm text-slate-900',
          'border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
          'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:focus:border-emerald-400',
          className ?? '',
        ].join(' ')}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      )}
    </label>
  );
}
