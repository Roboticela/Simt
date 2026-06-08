import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Opaque sticky day column for horizontally scrolling tables. */
export function stickyTableDayHeader(extra?: string) {
  return cn(
    'sticky start-0 z-20 bg-[color-mix(in_srgb,var(--accent)_30%,var(--card))]',
    'border-e border-border/40 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.25)]',
    extra,
  );
}

export function stickyTableDayCell(isToday: boolean, isOdd: boolean, extra?: string) {
  return cn(
    'sticky start-0 z-10 border-e border-border/40 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.2)]',
    'transition-colors group-hover:bg-[color-mix(in_srgb,var(--accent)_30%,var(--card))]',
    isToday
      ? 'bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))]'
      : isOdd
        ? 'bg-[color-mix(in_srgb,var(--accent)_15%,var(--card))]'
        : 'bg-card',
    extra,
  );
}
