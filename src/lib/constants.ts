/**
 * Mathematical & physical constants used across the Qiblatime engine.
 * Mirror of the constants embedded in the original "Fasting Map Maker" workbook.
 */

export const PI = Math.PI;
export const DR = PI / 180; // degrees -> radians
export const RD = 180 / PI; // radians -> degrees

/** Standard atmospheric refraction at the horizon used for sunrise / sunset / iftar / maghrib. */
export const HORIZON_REFRACTION_DEG = -0.833;

/** Holy Kaaba (Makkah) coordinates as used in the workbook. */
export const MAKKAH = {
  lat: 21.42253,
  lng: 39.82621,
} as const;

/** Default location stored in the workbook (Mardan, Pakistan). */
export const DEFAULT_LOCATION = {
  name: 'Mardan',
  lat: 34 + 19 / 60, // 34°19' N
  lng: 72 + 11 / 60, // 72°11' E (positive east)
  timezone: 5, // PKT
  horizonDepression: 0,
} as const;

export const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_NAMES_UR = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
] as const;

export const PRAYER_LABELS_EN = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  ishraq: 'Ishraq',
  zuhr: 'Zuhr',
  asrShafi: 'Asr (Shafi)',
  asrHanafi: 'Asr (Hanafi)',
  maghrib: 'Maghrib',
  iftar: 'Iftar',
  isha: 'Isha',
  shafaqAhmar: 'Shafaq Ahmar',
  shafaqAbyaz: 'Shafaq Abyaz',
  suhoorEnd: 'End of Suhoor',
  customaryNoon: 'Customary Noon',
  legalNoon: 'Legal Noon',
} as const;

export const PRAYER_LABELS_UR = {
  fajr: 'صبح صادق',
  sunrise: 'طلوع آفتاب',
  ishraq: 'اشراق',
  zuhr: 'ظہر',
  asrShafi: 'مثل اول (عصر شافعی)',
  asrHanafi: 'مثل ثانی (عصر حنفی)',
  maghrib: 'غروب',
  iftar: 'افطار',
  isha: 'عشاء',
  shafaqAhmar: 'شفق احمر',
  shafaqAbyaz: 'شفق ابیض',
  suhoorEnd: 'ختم سحر',
  customaryNoon: 'نصف النھار عرفی',
  legalNoon: 'نصف النھار شرعی',
} as const;

export type PrayerKey = keyof typeof PRAYER_LABELS_EN;
