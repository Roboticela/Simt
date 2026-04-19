/**
 * Time utilities. All "decimal hours" values are local clock-time floats
 * in the [0, 24) range produced by the Qiblatime engine.
 */

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month - 1];
}

/** Wrap a decimal-hours value into [0, 24). */
export function wrapHours(h: number): number {
  let v = h % 24;
  if (v < 0) v += 24;
  return v;
}

export function decimalToHMS(decimalHours: number | null | undefined): {
  h: number;
  m: number;
  s: number;
} | null {
  if (decimalHours == null || !Number.isFinite(decimalHours)) return null;
  const v = wrapHours(decimalHours);
  let totalSec = Math.round(v * 3600);
  const h = Math.floor(totalSec / 3600);
  totalSec -= h * 3600;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return { h, m, s };
}

export function format12h(decimalHours: number | null | undefined, withSeconds = false): string {
  const t = decimalToHMS(decimalHours);
  if (!t) return '—';
  const period = t.h >= 12 ? 'PM' : 'AM';
  let hour12 = t.h % 12;
  if (hour12 === 0) hour12 = 12;
  const mm = String(t.m).padStart(2, '0');
  if (withSeconds) {
    const ss = String(t.s).padStart(2, '0');
    return `${hour12}:${mm}:${ss} ${period}`;
  }
  return `${hour12}:${mm} ${period}`;
}

export function format24h(decimalHours: number | null | undefined, withSeconds = false): string {
  const t = decimalToHMS(decimalHours);
  if (!t) return '—';
  const hh = String(t.h).padStart(2, '0');
  const mm = String(t.m).padStart(2, '0');
  if (withSeconds) {
    const ss = String(t.s).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${hh}:${mm}`;
}

export function dayOfYear(year: number, month: number, day: number): number {
  let n = day;
  for (let m = 1; m < month; m++) {
    n += daysInMonth(year, m);
  }
  return n;
}
