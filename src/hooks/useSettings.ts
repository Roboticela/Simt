import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LocationConfig } from '../lib/types';
import { METHODS } from '../lib/types';
import { DEFAULT_LOCATION } from '../lib/constants';

const STORAGE_KEY = 'simt.settings.v1';

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
}

const DEFAULTS: AppSettings = {
  location: { ...DEFAULT_LOCATION },
  methodId: 'karachi',
  asrSchool: 2, // Hanafi (workbook default)
  language: 'en',
  timeFormat: '12',
  showSeconds: false,
};

function readInitial(): AppSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULTS,
      ...parsed,
      location: { ...DEFAULTS.location, ...(parsed.location ?? {}) },
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
    }));
  }, []);

  const setLocation = useCallback((loc: Partial<LocationConfig>) => {
    setSettings((prev) => ({ ...prev, location: { ...prev.location, ...loc } }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  const method = useMemo(() => METHODS[settings.methodId] ?? METHODS.karachi, [settings.methodId]);

  return { settings, update, setLocation, reset, method };
}
