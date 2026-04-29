import type { HTMLAttributes, ReactNode } from 'react';

type Tone = 'neutral' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'primary';

const TONE: Record<Tone, string> = {
  neutral: 'bg-accent text-foreground/70',
  emerald: 'bg-emerald-500/15 text-emerald-500 dark:bg-emerald-400/20 dark:text-emerald-300',
  amber:   'bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300',
  rose:    'bg-rose-500/15 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300',
  sky:     'bg-sky-500/15 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300',
  indigo:  'bg-indigo-500/15 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300',
  primary: 'bg-primary/15 text-primary',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        TONE[tone],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  );
}
