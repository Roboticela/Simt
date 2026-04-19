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

/**
 * Return the workbook's solar entry for a given calendar (month, day).
 * Mimics the workbook's behavior of repeating Feb 28 for Feb 29/30/31.
 */
export function getSolarEntry(month: number, day: number): SolarEntry {
  if (month < 1 || month > 12) {
    throw new RangeError(`month out of range: ${month}`);
  }
  // Workbook only stores Feb 1..28
  let lookupDay = day;
  if (month === 2 && day > 28) lookupDay = 28;
  const entry = INDEX.get(`${month}-${lookupDay}`);
  if (!entry) {
    throw new RangeError(`No solar entry for ${month}/${day}`);
  }
  return entry;
}

export function listSolarTable(): SolarEntry[] {
  return SOLAR_TABLE;
}
