import { useMemo } from 'react';
import { useAppSettings } from '../context/SettingsContext';
import { computePrayerTimes } from '../lib/prayerTimes';
import { daysInMonth } from '../lib/time';
import { MONTH_NAMES_EN, PRAYER_LABELS_EN } from '../lib/constants';
import type { PrayerKey } from '../lib/constants';
import { TimeText } from './TimeText';
import { Card } from './ui/Card';

interface Props {
  month: number; // 1..12
  year?: number;
  columns?: PrayerKey[];
}

const DEFAULT_COLS: PrayerKey[] = [
  'fajr',
  'sunrise',
  'ishraq',
  'zuhr',
  'asrShafi',
  'asrHanafi',
  'maghrib',
  'isha',
];

export function PrayerYearTable({ month, year = new Date().getFullYear(), columns = DEFAULT_COLS }: Props) {
  const { settings, method } = useAppSettings();
  const days = daysInMonth(year, month);
  const rows = useMemo(() => {
    const list: Array<{ day: number; values: Record<string, number | null> }> = [];
    for (let d = 1; d <= days; d++) {
      const t = computePrayerTimes(settings.location, month, d, {
        method,
        asrSchool: settings.asrSchool,
      });
      const values: Record<string, number | null> = {};
      for (const c of columns) values[c] = t[c] ?? null;
      list.push({ day: d, values });
    }
    return list;
  }, [days, month, settings.location, settings.asrSchool, method, columns]);

  return (
    <Card title={`${MONTH_NAMES_EN[month - 1]} ${year}`} padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Day
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800"
                >
                  {PRAYER_LABELS_EN[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.day} className="even:bg-slate-50/40 dark:even:bg-slate-900/30">
                <td className="sticky left-0 z-10 bg-inherit px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50">
                  {row.day}
                </td>
                {columns.map((c) => (
                  <td
                    key={c}
                    className="px-3 py-1.5 text-right tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50"
                  >
                    <TimeText value={row.values[c]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
