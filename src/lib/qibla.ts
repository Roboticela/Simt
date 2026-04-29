/**
 * Qibla bearing (great-circle to Makkah) and Saff (row) bearing.
 * Direct port of the formula `QD` cell in workbook Sheet `A`:
 *
 *   CQA = ATAN2( sin(LGM - LGR),
 *                cos(LTR) * tan(LT2) - sin(LTR) * cos(LGM - LGR) ) * RD
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
 * Workbook rule (Sheet A constants): CSF = CQA − 90 when CQA > 90°,
 * CSF = CQA + 90 when CQA < 90°.  For Pakistan locations (CQA ≈ 254°)
 * this gives CSF ≈ 164° (SSE), not 344° (NNW).
 */
export function saffBearing(qiblaDeg: number): number {
  return ((qiblaDeg - 90) % 360 + 360) % 360;
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
