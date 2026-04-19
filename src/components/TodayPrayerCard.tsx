import { useMemo } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useAppSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { computePrayerTimes } from '../lib/prayerTimes';
import { MONTH_NAMES_EN, PRAYER_LABELS_EN, PRAYER_LABELS_UR, type PrayerKey } from '../lib/constants';
import { TimeText } from './TimeText';
import { wrapHours } from '../lib/time';

const MAIN_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'zuhr', 'asrHanafi', 'asrShafi', 'maghrib', 'isha'];

export function TodayPrayerCard() {
  const { settings, method } = useAppSettings();
  const now = useNow(15_000);
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();

  const times = useMemo(
    () => computePrayerTimes(settings.location, month, day, { method, asrSchool: settings.asrSchool }),
    [settings.location, settings.asrSchool, method, month, day],
  );

  const nowH = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  // Find next prayer (from MAIN_KEYS minus sunrise)
  const orderForNext: PrayerKey[] = ['fajr', 'sunrise', 'zuhr', settings.asrSchool === 2 ? 'asrHanafi' : 'asrShafi', 'maghrib', 'isha'];
  const sortedTimes = orderForNext
    .map((k) => ({ key: k, value: times[k] ?? null }))
    .filter((t): t is { key: PrayerKey; value: number } => t.value != null);

  const nextEntry =
    sortedTimes.find((t) => t.value > nowH) ?? sortedTimes[0]; // wraps to fajr next day

  return (
    <Card
      title={`${MONTH_NAMES_EN[month - 1]} ${day}, ${year}`}
      subtitle="Today's prayer times"
      action={nextEntry && (
        <Badge tone="emerald">
          Next: {PRAYER_LABELS_EN[nextEntry.key]} · <TimeText value={nextEntry.value} />
        </Badge>
      )}
      padded={false}
    >
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {MAIN_KEYS.map((key) => {
          const isNext = nextEntry?.key === key;
          const value = times[key] ?? null;
          const passed = value != null && wrapHours(value) <= nowH && !isNext;
          return (
            <li
              key={key}
              className={[
                'flex items-center justify-between gap-4 px-4 py-3 transition-colors',
                isNext ? 'bg-emerald-50 dark:bg-emerald-900/20' : '',
              ].join(' ')}
            >
              <div className="min-w-0">
                <p className={['text-sm font-medium', passed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'].join(' ')}>
                  {PRAYER_LABELS_EN[key]}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400" dir="rtl">
                  {PRAYER_LABELS_UR[key]}
                </p>
              </div>
              <TimeText
                value={value}
                className={[
                  'text-base font-semibold',
                  passed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100',
                ].join(' ')}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
