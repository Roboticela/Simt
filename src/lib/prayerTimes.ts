/**
 * Prayer-time calculator. Implements the formulas documented in the workbook
 * analysis (Step 3.5 — solar altitude → hour angle → clock time).
 *
 *     cos(H) = (sin(α) - sin(LT) * sin(DSUN)) / (cos(LT) * cos(DSUN))
 *     T      = LTN ± H/15
 *
 * Prayer altitudes (α):
 *   Fajr / Suhoor end / Isha   : depression angles per method
 *   Sunrise / Sunset / Iftar   : -0.833° (refraction)
 *   Ishraq                     : +4° (sun "established")
 *   Asr Hanafi                 : cot(α) = 2 + tan(|LT - DSUN|)
 *   Asr Shafi                  : cot(α) = 1 + tan(|LT - DSUN|)
 *   Zuhr                       : LTN itself (transit)
 */
import { DR, HORIZON_REFRACTION_DEG, RD } from './constants';
import { getSolarEntry } from './solar';
import type { CalculationMethod, LocationConfig, PrayerTimes, SolarEntry } from './types';
import { METHODS } from './types';

/**
 * Local Hour Angle (degrees) for a target solar altitude.
 * Returns null when the sun never reaches that altitude (polar regions).
 */
export function hourAngleForAltitude(
  altitudeDeg: number,
  latDeg: number,
  declinationDeg: number,
): number | null {
  const cosH =
    (Math.sin(altitudeDeg * DR) - Math.sin(latDeg * DR) * Math.sin(declinationDeg * DR)) /
    (Math.cos(latDeg * DR) * Math.cos(declinationDeg * DR));
  if (cosH > 1 || cosH < -1) return null;
  return Math.acos(cosH) * RD;
}

/** Asr altitude in degrees for a given shadow factor (1 = Shafi, 2 = Hanafi). */
export function asrAltitude(latDeg: number, declinationDeg: number, factor: 1 | 2): number {
  const cot = factor + Math.tan(Math.abs(latDeg - declinationDeg) * DR);
  return Math.atan(1 / cot) * RD;
}

/**
 * Convert the workbook LTN (apparent solar transit, see SUN DATA sheet)
 * into a local clock-time noon for the observer, applying timezone offset
 * and longitudinal correction:
 *
 *     noon_local = LTN + (TZ * 15 - LNG) / 15      (lng east-positive)
 *
 * For the workbook's default setup (Mardan, TZ=5, LNG=72°11'E ≈ 72.183),
 * this evaluates to LTN + (75 - 72.183) / 15 ≈ LTN + 0.188h.
 */
export function localApparentNoon(ltn: number, location: LocationConfig): number {
  return ltn + (location.timezone * 15 - location.lng) / 15;
}

export interface PrayerTimesOptions {
  method: CalculationMethod;
  /** Asr school: 1 = Shafi (default), 2 = Hanafi. */
  asrSchool?: 1 | 2;
  /** Override solar entry (otherwise looked up from Sheet C by month/day). */
  solar?: SolarEntry;
}

/**
 * Compute every prayer / sun-position time (decimal local clock hours)
 * for a single calendar date.
 */
export function computePrayerTimes(
  location: LocationConfig,
  month: number,
  day: number,
  options: PrayerTimesOptions = { method: METHODS.karachi },
): PrayerTimes {
  const solar = options.solar ?? getSolarEntry(month, day);
  const noon = localApparentNoon(solar.ltn, location);
  const lat = location.lat;
  const dsun = solar.dsun;
  const horizon = HORIZON_REFRACTION_DEG - (location.horizonDepression ?? 0);

  const hRise = hourAngleForAltitude(horizon, lat, dsun);
  const hFajr = hourAngleForAltitude(-options.method.fajrAngle, lat, dsun);
  const hIsha = hourAngleForAltitude(-options.method.ishaAngle, lat, dsun);
  const hShafaqAhmar = hourAngleForAltitude(-options.method.shafaqAhmarAngle, lat, dsun);
  const hShafaqAbyaz = hourAngleForAltitude(-options.method.shafaqAbyazAngle, lat, dsun);
  const hIshraq = hourAngleForAltitude(options.method.ishraqAngle, lat, dsun);

  const asrShafiAlt = asrAltitude(lat, dsun, 1);
  const asrHanafiAlt = asrAltitude(lat, dsun, 2);
  const hAsrShafi = hourAngleForAltitude(asrShafiAlt, lat, dsun);
  const hAsrHanafi = hourAngleForAltitude(asrHanafiAlt, lat, dsun);

  const sunrise = hRise == null ? null : noon - hRise / 15;
  const sunset  = hRise == null ? null : noon + hRise / 15;
  const fajr    = hFajr == null ? null : noon - hFajr / 15;

  // Customary noon (نصف النہار عرفی) = midpoint of astronomical sunrise & sunset
  // = (sunrise + sunset) / 2 = noon.  Stored separately for display completeness.
  const customaryNoon = sunrise != null && sunset != null ? (sunrise + sunset) / 2 : null;

  // Legal noon (نصف النہار شرعی) = midpoint of true dawn (Fajr) and sunset.
  // This is earlier than solar noon because Fajr precedes astronomical sunrise.
  const legalNoon = fajr != null && sunset != null ? (fajr + sunset) / 2 : noon;

  return {
    fajr,
    suhoorEnd: fajr,
    sunrise,
    ishraq: hIshraq == null ? null : noon - hIshraq / 15,
    legalNoon,
    customaryNoon,
    zuhr: noon,
    asrShafi: hAsrShafi == null ? null : noon + hAsrShafi / 15,
    asrHanafi: hAsrHanafi == null ? null : noon + hAsrHanafi / 15,
    maghrib: sunset,
    iftar: sunset,
    shafaqAhmar: hShafaqAhmar == null ? null : noon + hShafaqAhmar / 15,
    shafaqAbyaz: hShafaqAbyaz == null ? null : noon + hShafaqAbyaz / 15,
    isha: hIsha == null ? null : noon + hIsha / 15,
  };
}

/**
 * Sun azimuth (°, from true North) at a given Local Hour Angle.
 * LHA < 0 → morning (sun in East), LHA > 0 → afternoon (sun in West).
 */
export function sunAzimuthAtLha(lhaDeg: number, latDeg: number, declinationDeg: number): number {
  const lha = lhaDeg * DR;
  const lat = latDeg * DR;
  const dec = declinationDeg * DR;
  const altitude = Math.asin(
    Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(lha),
  );
  const cosAlt = Math.cos(altitude);
  if (cosAlt === 0) return 0;
  const sinAz = -Math.cos(dec) * Math.sin(lha) / cosAlt;
  const clamped = Math.max(-1, Math.min(1, sinAz));
  const azRaw = Math.asin(clamped) * RD;
  const azimuth = lhaDeg < 0 ? 180 - azRaw : 180 + azRaw;
  return ((azimuth % 360) + 360) % 360;
}
