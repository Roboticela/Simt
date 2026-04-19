import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'neutral' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';

const TONE: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        TONE[tone],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
