import type { PrayerKey } from './constants';

export interface Coordinates {
  lat: number; // decimal degrees, positive North
  lng: number; // decimal degrees, positive East
}

export interface LocationConfig extends Coordinates {
  name: string;
  /** Standard time-zone offset in hours from UTC (e.g. Pakistan = 5). */
  timezone: number;
  /** Optional horizon depression for elevated observers (degrees). */
  horizonDepression?: number;
}

export interface SolarEntry {
  month: number;
  day: number;
  /** Local Transit Noon (decimal hours, equation-of-time bearing). */
  ltn: number;
  /** Solar declination in degrees. */
  dsun: number;
}

/**
 * Calculation method controls the depression angles for Fajr / Isha
 * and shafaq twilights. The workbook uses 18°/18° (Karachi method).
 */
export interface CalculationMethod {
  id: string;
  name: string;
  fajrAngle: number; // degrees below horizon
  ishaAngle: number;
  shafaqAhmarAngle: number; // red twilight  (~4° below horizon)
  shafaqAbyazAngle: number; // white twilight (~12° below horizon, distinct from Isha at 18°)
  ishraqAngle: number;      // approx +4° above horizon
}

export const METHODS: Record<string, CalculationMethod> = {
  karachi: {
    id: 'karachi',
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18,
    ishaAngle: 18,
    shafaqAhmarAngle: 4,
    shafaqAbyazAngle: 12,
    ishraqAngle: 4,
  },
  isna: {
    id: 'isna',
    name: 'Islamic Society of North America',
    fajrAngle: 15,
    ishaAngle: 15,
    shafaqAhmarAngle: 4,
    shafaqAbyazAngle: 12,
    ishraqAngle: 4,
  },
  mwl: {
    id: 'mwl',
    name: 'Muslim World League',
    fajrAngle: 18,
    ishaAngle: 17,
    shafaqAhmarAngle: 4,
    shafaqAbyazAngle: 12,
    ishraqAngle: 4,
  },
  egypt: {
    id: 'egypt',
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    shafaqAhmarAngle: 4,
    shafaqAbyazAngle: 12,
    ishraqAngle: 4,
  },
  makkah: {
    id: 'makkah',
    name: 'Umm Al-Qura, Makkah',
    fajrAngle: 18.5,
    ishaAngle: 18.5,
    shafaqAhmarAngle: 4,
    shafaqAbyazAngle: 12,
    ishraqAngle: 4,
  },
};

/** A computed prayer-times block for a single date. */
export type PrayerTimes = Partial<Record<PrayerKey, number | null>>;

/** Qibla shadow times for a single date (decimal hours, local clock). */
export interface QiblaShadowTimes {
  qiblaForeNoon: number | null;
  qiblaAfterNoon: number | null;
  saffForeNoon: number | null;
  saffAfterNoon: number | null;
  status: 'QNOS' | 'QSOS' | 'N/A';
}
