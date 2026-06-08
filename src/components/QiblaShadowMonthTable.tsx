import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppSettings } from '../context/SettingsContext';
import { qiblaBearing, saffBearing } from '../lib/qibla';
import { computeQiblaShadowTimes } from '../lib/qiblaShadow';
import { daysInMonth } from '../lib/time';
import { TimeText } from './TimeText';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useLang } from '../contexts/LanguageContext';
import { t, monthLabel } from '../lib/i18n';
import { stickyTableDayCell, stickyTableDayHeader } from '../lib/utils';

interface Props { month: number; year?: number; }

export function QiblaShadowMonthTable({ month, year = new Date().getFullYear() }: Props) {
  const { settings } = useAppSettings();
  const { lang } = useLang();
  const days = daysInMonth(year, month);

  const { rows, qibla, saff } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    const sf = saffBearing(qb);
    const list = [];
    for (let d = 1; d <= days; d++) {
      list.push({
        day: d,
        ...computeQiblaShadowTimes(settings.location, month, d, { qiblaDeg: qb, saffDeg: sf }),
      });
    }
    return { rows: list, qibla: qb, saff: sf };
  }, [days, month, year, settings.location]);

  const today = new Date();
  const todayDay = today.getMonth() + 1 === month && today.getFullYear() === year ? today.getDate() : -1;

  return (
    <Card
      title={`${monthLabel(lang, month - 1)} ${year}`}
      subtitle={`${t(lang, 'qibla')}: ${qibla.toFixed(2)}° · ${t(lang, 'saffRow')}: ${saff.toFixed(2)}°`}
      padded={false}
      delay={0.1}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-accent/30">
              {[
                t(lang, 'day'),
                t(lang, 'qiblaForeNoon'),
                t(lang, 'qiblaAfterNoon'),
                t(lang, 'saffForeNoon'),
                t(lang, 'saffAfterNoon'),
                t(lang, 'status'),
              ].map((h, i) => (
                <th
                  key={i}
                  className={[
                    'px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50 whitespace-nowrap',
                    i === 0 ? stickyTableDayHeader('text-start') : 'text-end',
                  ].join(' ')}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isToday = r.day === todayDay;
              return (
                <motion.tr
                  key={r.day}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: i * 0.008 }}
                  className={[
                    'group border-b border-border/25 transition-colors hover:bg-accent/30',
                    isToday ? 'bg-primary/8' : i % 2 === 1 ? 'bg-accent/15' : '',
                  ].join(' ')}
                >
                  <td className={stickyTableDayCell(isToday, i % 2 === 1, 'px-4 py-2.5')}>
                    <div className="flex items-center gap-2">
                      {isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      <span className={['font-bold tabular-nums', isToday ? 'text-primary' : 'text-foreground'].join(' ')}>
                        {r.day}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-end font-medium tabular-nums text-foreground/80"><TimeText value={r.qiblaForeNoon} /></td>
                  <td className="px-4 py-2.5 text-end font-medium tabular-nums text-foreground/80"><TimeText value={r.qiblaAfterNoon} /></td>
                  <td className="px-4 py-2.5 text-end font-medium tabular-nums text-foreground/80"><TimeText value={r.saffForeNoon} /></td>
                  <td className="px-4 py-2.5 text-end font-medium tabular-nums text-foreground/80"><TimeText value={r.saffAfterNoon} /></td>
                  <td className="px-4 py-2.5 text-end">
                    <Badge tone={r.status === 'QNOS' ? 'emerald' : r.status === 'QSOS' ? 'amber' : 'neutral'}>
                      {r.status}
                    </Badge>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
