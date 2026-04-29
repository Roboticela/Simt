/**
 * Solar data lookup. Sources values from the workbook's Sheet `C`
 * ("ltn-decsun" SUN DATA for QIBLATIME.EXL) — 12 months × 31 days.
 *
 * Original workbook uses Feb 28 values for days 29-31 of February.
 * We follow the same convention so that outputs match the source spreadsheet
 * exactly.
 */
import solarRaw from '../data/solar.json';
import type { SolarEntry } from './types';

const SOLAR_TABLE: SolarEntry[] = solarRaw as SolarEntry[];

const INDEX = new Map<string, SolarEntry>();
for (const row of SOLAR_TABLE) {
  INDEX.set(`${row.month}-${row.day}`, row);
}

/** Last real day in each month as stored in the workbook table (1-indexed). */
const MONTH_MAX_DAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/**
 * Return the workbook's solar entry for a given calendar (month, day).
 * Mimics the workbook's behavior of clamping out-of-range days to the last
 * real day stored for that month:
 *   • February 29/30/31 → Feb 28
 *   • April/June/September/November day 31 → that month's day 30
 */
export function getSolarEntry(month: number, day: number): SolarEntry {
  if (month < 1 || month > 12) {
    throw new RangeError(`month out of range: ${month}`);
  }
  const maxDay = MONTH_MAX_DAY[month - 1];
  const lookupDay = day > maxDay ? maxDay : day;
  const entry = INDEX.get(`${month}-${lookupDay}`);
  if (!entry) {
    throw new RangeError(`No solar entry for ${month}/${day}`);
  }
  return entry;
}

export function listSolarTable(): SolarEntry[] {
  return SOLAR_TABLE;
}
