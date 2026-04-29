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

/**
 * Bisect within [a, b] on f(x) = normalised azimuth delta.
 * Returns null when:
 *   • no sign change (sun arc doesn't cross target), OR
 *   • sign change is caused by the ±180 wrap-around, not a real crossing.
 *
 * Wrap-around detection: a genuine zero-crossing keeps |fa − fb| ≤ 180.
 * When the normalised diff jumps across the ±180 boundary (e.g. +124 → −164,
 * |Δ| = 288) there is no real crossing — the sun never reaches that azimuth.
 */
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
  if (fa * fb > 0) return null;                   // same sign  — no crossing
  if (Math.abs(fa - fb) > 180) return null;       // wrap-around — false sign change
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
  const sunsetLha = hRise;   // positive (afternoon)

  /**
   * Split a compass bearing into the correct search targets for fore-noon and
   * after-noon bisection.
   *
   * The sun's azimuth arc is symmetric about solar noon: if the sun is at
   * azimuth A in the afternoon (LHA > 0) it was at (360° − A) in the
   * symmetric morning slot (LHA < 0). Therefore:
   *   • bearings < 180° are crossed before noon → fore target = bearing itself
   *   • bearings > 180° are crossed after  noon → after target = bearing itself
   * The opposite half uses the complement (360° − bearing).
   */
  function splitTargets(bearing: number): [fore: number, after: number] {
    const comp = ((360 - bearing) % 360 + 360) % 360;
    return bearing < 180 ? [bearing, comp] : [comp, bearing];
  }

  function findLha(foreTarget: number, afterTarget: number): { fore: number | null; after: number | null } {
    // Guard: just-after-sunrise & just-before-sunset to avoid divide-by-zero at horizon.
    const eps = 0.05;
    const makeFn = (tgt: number) => (lha: number) =>
      normalizeAzimuthDelta(sunAzimuthAtLha(lha, lat, dsun), tgt);
    return {
      fore: bisect(makeFn(foreTarget),  sunriseLha + eps, -eps),
      after: bisect(makeFn(afterTarget), eps, sunsetLha - eps),
    };
  }

  const [qiblaFore, qiblaAfter] = splitTargets(options.qiblaDeg);
  const [saffFore,  saffAfter]  = splitTargets(options.saffDeg);

  const qibla = findLha(qiblaFore, qiblaAfter);
  const saff  = findLha(saffFore,  saffAfter);

  /**
   * Status: QNOS (Qibla North Of Sun) when the fore-noon shadow points roughly
   * toward Qibla. This occurs when Qibla is in the western half of the compass
   * (bearing ≥ 180°). For eastern Qibla the fore-noon shadow points away → QSOS.
   */
  const status: QiblaShadowTimes['status'] =
    qibla.fore == null && qibla.after == null
      ? 'N/A'
      : options.qiblaDeg >= 180
        ? 'QNOS'
        : 'QSOS';

  return {
    qiblaForeNoon:  qibla.fore  == null ? null : noon + qibla.fore  / 15,
    qiblaAfterNoon: qibla.after == null ? null : noon + qibla.after / 15,
    saffForeNoon:   saff.fore   == null ? null : noon + saff.fore   / 15,
    saffAfterNoon:  saff.after  == null ? null : noon + saff.after  / 15,
    status,
  };
}
