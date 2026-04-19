import type { ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (id: T) => void;
  items: TabItem<T>[];
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  size = 'md',
  fullWidth,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={[
        'inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800',
        fullWidth ? 'flex w-full' : '',
      ].join(' ')}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={[
              'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60',
              fullWidth ? 'flex-1' : '',
              size === 'sm' ? 'h-7 px-3 text-xs' : 'h-9 px-4 text-sm',
              active
                ? 'bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
            ].join(' ')}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
