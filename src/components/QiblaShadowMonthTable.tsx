import { useMemo } from 'react';
import { useAppSettings } from '../context/SettingsContext';
import { qiblaBearing, saffBearing } from '../lib/qibla';
import { computeQiblaShadowTimes } from '../lib/qiblaShadow';
import { daysInMonth } from '../lib/time';
import { MONTH_NAMES_EN } from '../lib/constants';
import { TimeText } from './TimeText';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  month: number;
  year?: number;
}

export function QiblaShadowMonthTable({ month, year = new Date().getFullYear() }: Props) {
  const { settings } = useAppSettings();
  const days = daysInMonth(year, month);

  const { rows, qibla, saff } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    const sf = saffBearing(qb);
    const list = [];
    for (let d = 1; d <= days; d++) {
      list.push({
        day: d,
        ...computeQiblaShadowTimes(settings.location, month, d, {
          qiblaDeg: qb,
          saffDeg: sf,
        }),
      });
    }
    return { rows: list, qibla: qb, saff: sf };
  }, [days, month, settings.location]);

  return (
    <Card
      title={`${MONTH_NAMES_EN[month - 1]} ${year}`}
      subtitle={`Qibla ${qibla.toFixed(2)}° · Saff ${saff.toFixed(2)}°`}
      padded={false}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Day
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Qibla — Fore
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Qibla — After
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Saff — Fore
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Saff — After
              </th>
              <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.day} className="even:bg-slate-50/40 dark:even:bg-slate-900/30">
                <td className="sticky left-0 z-10 bg-inherit px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50">
                  {r.day}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50">
                  <TimeText value={r.qiblaForeNoon} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50">
                  <TimeText value={r.qiblaAfterNoon} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50">
                  <TimeText value={r.saffForeNoon} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50">
                  <TimeText value={r.saffAfterNoon} />
                </td>
                <td className="px-3 py-1.5 text-right border-b border-slate-100 dark:border-slate-800/50">
                  <Badge tone={r.status === 'QNOS' ? 'emerald' : r.status === 'QSOS' ? 'amber' : 'neutral'}>
                    {r.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
