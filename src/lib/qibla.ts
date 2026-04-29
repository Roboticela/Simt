/**
 * Qibla bearing (great-circle to Makkah) and Saff (row) bearing.
 * Formula mirrors the `QD` cell in workbook Sheet `A`:
 *
 *   CQA = ATAN2( sin(LGM - LGR),
 *                cos(LTR) * tan(LT2) - sin(LTR) * cos(LGM - LGR) ) * RD
 *
 * ⚠ Convention note: the reference workbook stores ALL longitudes with an
 * East-as-negative (West-positive) sign, which reflects the azimuth axis and
 * makes its printed CQA ≈ 105.87° for Mardan. The app uses the standard
 * East-positive convention (positive lng = East), yielding CQA ≈ 254° — the
 * correct geographic clockwise-from-North bearing toward Makkah from Pakistan.
 * The two values are related by: workbook_CQA ≈ 360° − app_CQA (mod 360).
 * The app value is the one to use with a real compass.
 */
import { DR, MAKKAH, RD } from './constants';
import type { Coordinates } from './types';

/**
 * Qibla bearing measured clockwise from True North, in [0, 360).
 */
export function qiblaBearing(observer: Coordinates): number {
  const ltr = observer.lat * DR;
  const lgr = observer.lng * DR;
  const lt2 = MAKKAH.lat * DR;
  const lgm = MAKKAH.lng * DR;

  const x = Math.cos(ltr) * Math.tan(lt2) - Math.sin(ltr) * Math.cos(lgm - lgr);
  const y = Math.sin(lgm - lgr);
  const bearing = Math.atan2(y, x) * RD;
  return ((bearing % 360) + 360) % 360;
}

/**
 * Saff (prayer-row) bearing — perpendicular to the Qibla direction.
 * Workbook rule (Sheet A constants):
 *   CSF = CQA − 90  when CQA > 90°   (e.g. Pakistan CQA ≈ 254° → CSF ≈ 164°)
 *   CSF = CQA + 90  when CQA ≤ 90°   (e.g. eastern locations CQA ≈ 45° → CSF ≈ 135°)
 * Both branches always produce a southward-facing row direction for observers
 * north of Makkah.
 */
export function saffBearing(qiblaDeg: number): number {
  const offset = qiblaDeg > 90 ? -90 : 90;
  return ((qiblaDeg + offset) % 360 + 360) % 360;
}

/**
 * Great-circle distance in kilometres between observer and the Kaaba.
 * Useful for displaying "distance to Makkah".
 */
export function distanceToMakkah(observer: Coordinates, earthRadiusKm = 6371): number {
  const lat1 = observer.lat * DR;
  const lat2 = MAKKAH.lat * DR;
  const dLat = lat2 - lat1;
  const dLng = (MAKKAH.lng - observer.lng) * DR;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

/** 16-point compass label from a bearing in degrees. */
export function compassDirection(bearing: number): string {
  const dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const idx = Math.round(bearing / 22.5) % 16;
  return dirs[idx];
}
