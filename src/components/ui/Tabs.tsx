import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

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
        'relative inline-flex rounded-2xl p-1 ring-1 ring-border/60',
        'bg-accent/50',
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
              'relative inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-colors z-10',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              fullWidth ? 'flex-1' : '',
              size === 'sm' ? 'h-7 px-3 text-xs' : 'h-9 px-4 text-sm',
              active ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80',
            ].join(' ')}
          >
            {active && (
              <motion.span
                layoutId="tabHighlight"
                className="absolute inset-0 rounded-xl bg-card shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
