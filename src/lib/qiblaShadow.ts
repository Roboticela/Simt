/**
 * Qibla shadow time finder.
 *
 * Given a target azimuth (Qibla bearing or Saff bearing measured from true North),
 * we solve for the local hour angle LHA at which the sun's azimuth equals that
 * target. The shadow at that instant points either *toward* the Qibla (QNOS:
 * Qibla North Of Sun → shadow points toward Qibla) or *away* (QSOS).
 *
 * We use a robust bisection-based numerical solver across the [sunrise, sunset]
 * window for each side of solar noon. The continuous function
 *   f(LHA) = sun_azimuth(LHA) - target_azimuth
 * is monotone within each half-day window, so bisection is reliable.
 */
import { hourAngleForAltitude, localApparentNoon, sunAzimuthAtLha } from './prayerTimes';
import { getSolarEntry } from './solar';
import { HORIZON_REFRACTION_DEG } from './constants';
import type { LocationConfig, QiblaShadowTimes, SolarEntry } from './types';

function normalizeAzimuthDelta(value: number, target: number): number {
  let diff = value - target;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

/** Bisect within [a, b] on f(x) = sun_az(x) - target. Returns null if no sign change. */
function bisect(
  fn: (lha: number) => number,
  a: number,
  b: number,
  iterations = 60,
): number | null {
  let fa = fn(a);
  let fb = fn(b);
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return null;
  let lo = a;
  let hi = b;
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    const fm = fn(mid);
    if (fm === 0 || (hi - lo) < 1e-7) return mid;
    if (fa * fm < 0) {
      hi = mid;
      fb = fm;
    } else {
      lo = mid;
      fa = fm;
    }
  }
  return (lo + hi) / 2;
}

export interface ComputeShadowOptions {
  qiblaDeg: number;
  saffDeg: number;
  /** Override solar entry (otherwise looked up from Sheet C by month/day). */
  solar?: SolarEntry;
}

/**
 * Compute the four shadow times for a given date / location.
 * Each value is null when the sun never reaches that azimuth on that day
 * at the given latitude (e.g. polar latitudes or when target lies outside the
 * sun's diurnal arc).
 */
export function computeQiblaShadowTimes(
  location: LocationConfig,
  month: number,
  day: number,
  options: ComputeShadowOptions,
): QiblaShadowTimes {
  const solar = options.solar ?? getSolarEntry(month, day);
  const lat = location.lat;
  const dsun = solar.dsun;
  const noon = localApparentNoon(solar.ltn, location);
  const horizon = HORIZON_REFRACTION_DEG - (location.horizonDepression ?? 0);
  const hRise = hourAngleForAltitude(horizon, lat, dsun);

  if (hRise == null) {
    return {
      qiblaForeNoon: null,
      qiblaAfterNoon: null,
      saffForeNoon: null,
      saffAfterNoon: null,
      status: 'N/A',
    };
  }

  const sunriseLha = -hRise; // negative (morning)
  const sunsetLha = hRise; // positive (afternoon)

  function findLha(target: number): { fore: number | null; after: number | null } {
    const f = (lha: number) => normalizeAzimuthDelta(sunAzimuthAtLha(lha, lat, dsun), target);
    // Guard: just-after-sunrise & just-before-sunset to avoid divide-by-zero at horizon.
    const eps = 0.05;
    const fore = bisect(f, sunriseLha + eps, -eps);
    const after = bisect(f, eps, sunsetLha - eps);
    return { fore, after };
  }

  const qibla = findLha(options.qiblaDeg);
  const saff = findLha(options.saffDeg);

  const sunAzAtSunrise = sunAzimuthAtLha(sunriseLha + 0.05, lat, dsun);
  const status: QiblaShadowTimes['status'] =
    qibla.fore == null && qibla.after == null
      ? 'N/A'
      : options.qiblaDeg > sunAzAtSunrise
        ? 'QNOS'
        : 'QSOS';

  return {
    qiblaForeNoon: qibla.fore == null ? null : noon + qibla.fore / 15,
    qiblaAfterNoon: qibla.after == null ? null : noon + qibla.after / 15,
    saffForeNoon: saff.fore == null ? null : noon + saff.fore / 15,
    saffAfterNoon: saff.after == null ? null : noon + saff.after / 15,
    status,
  };
}
