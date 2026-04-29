import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LocationConfig } from '../lib/types';
import { METHODS } from '../lib/types';
import { DEFAULT_LOCATION } from '../lib/constants';

const STORAGE_KEY = 'simt.settings.v1';

export type NotifyPrayer = 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerNotificationRule {
  enabled: boolean;
  minutesBefore: number;
}

export type PrayerNotificationRules = Record<NotifyPrayer, PrayerNotificationRule>;

export interface AppSettings {
  location: LocationConfig;
  methodId: string;
  asrSchool: 1 | 2;
  /** Display language: 'en' | 'ar' | 'ur'. */
  language: 'en' | 'ar' | 'ur';
  /** Time format: '12' | '24'. */
  timeFormat: '12' | '24';
  /** Show seconds in time strings. */
  showSeconds: boolean;
  /** Master switch for browser prayer notifications. */
  notificationsEnabled: boolean;
  /** Notify exactly at prayer time. */
  notifyAtPrayerTime: boolean;
  /** Notify before prayer based on per-prayer lead minutes. */
  notifyBeforePrayer: boolean;
  /** Per-prayer notification controls. */
  prayerNotifications: PrayerNotificationRules;
  /** Delivery mode for prayer alerts. */
  notificationDelivery: 'notification' | 'sound' | 'both';
  /** Force use of bundled public alert sound. */
  useDefaultAlertSound: boolean;
  /** Sound source URL (can be default asset path or uploaded data URL). */
  notificationSoundUrl: string;
}

const DEFAULT_PRAYER_NOTIFICATIONS: PrayerNotificationRules = {
  fajr: { enabled: true, minutesBefore: 25 },
  zuhr: { enabled: true, minutesBefore: 10 },
  asr: { enabled: true, minutesBefore: 10 },
  maghrib: { enabled: true, minutesBefore: 8 },
  isha: { enabled: true, minutesBefore: 12 },
};

const DEFAULTS: AppSettings = {
  location: { ...DEFAULT_LOCATION },
  methodId: 'karachi',
  asrSchool: 2, // Hanafi (workbook default)
  language: 'en',
  timeFormat: '12',
  showSeconds: false,
  notificationsEnabled: false,
  notifyAtPrayerTime: true,
  notifyBeforePrayer: true,
  prayerNotifications: DEFAULT_PRAYER_NOTIFICATIONS,
  notificationDelivery: 'both',
  useDefaultAlertSound: true,
  notificationSoundUrl: '/sounds/allahu-akbar.mp3',
};

function readInitial(): AppSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const parsedRules = parsed.prayerNotifications ?? {};
    return {
      ...DEFAULTS,
      ...parsed,
      location: { ...DEFAULTS.location, ...(parsed.location ?? {}) },
      prayerNotifications: {
        ...DEFAULT_PRAYER_NOTIFICATIONS,
        ...parsedRules,
        fajr: { ...DEFAULT_PRAYER_NOTIFICATIONS.fajr, ...(parsedRules.fajr ?? {}) },
        zuhr: { ...DEFAULT_PRAYER_NOTIFICATIONS.zuhr, ...(parsedRules.zuhr ?? {}) },
        asr: { ...DEFAULT_PRAYER_NOTIFICATIONS.asr, ...(parsedRules.asr ?? {}) },
        maghrib: { ...DEFAULT_PRAYER_NOTIFICATIONS.maghrib, ...(parsedRules.maghrib ?? {}) },
        isha: { ...DEFAULT_PRAYER_NOTIFICATIONS.isha, ...(parsedRules.isha ?? {}) },
      },
    };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => readInitial());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage failures
    }
  }, [settings]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
      location: patch.location ? { ...prev.location, ...patch.location } : prev.location,
      prayerNotifications: patch.prayerNotifications
        ? {
            ...prev.prayerNotifications,
            ...patch.prayerNotifications,
            fajr: { ...prev.prayerNotifications.fajr, ...(patch.prayerNotifications.fajr ?? {}) },
            zuhr: { ...prev.prayerNotifications.zuhr, ...(patch.prayerNotifications.zuhr ?? {}) },
            asr: { ...prev.prayerNotifications.asr, ...(patch.prayerNotifications.asr ?? {}) },
            maghrib: { ...prev.prayerNotifications.maghrib, ...(patch.prayerNotifications.maghrib ?? {}) },
            isha: { ...prev.prayerNotifications.isha, ...(patch.prayerNotifications.isha ?? {}) },
          }
        : prev.prayerNotifications,
    }));
  }, []);

  const setLocation = useCallback((loc: Partial<LocationConfig>) => {
    setSettings((prev) => ({ ...prev, location: { ...prev.location, ...loc } }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  const method = useMemo(() => METHODS[settings.methodId] ?? METHODS.karachi, [settings.methodId]);

  return { settings, update, setLocation, reset, method };
}
