import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Moon, Sunrise, Sun, Sunset, CloudMoon } from 'lucide-react';
import { useAppSettings } from '../context/SettingsContext';
import { computePrayerTimes } from '../lib/prayerTimes';
import { daysInMonth } from '../lib/time';
import { TimeText } from './TimeText';
import { Card } from './ui/Card';
import { useLang } from '../contexts/LanguageContext';
import { prayerLabel, monthLabel, t } from '../lib/i18n';
import type { PrayerKey } from '../lib/constants';
import type { LucideIcon } from 'lucide-react';

interface Props {
  month: number;
  year?: number;
  /** When true every column is visible (برائے طلباء mode) */
  showAll?: boolean;
  /** When true only Suhoor End & Iftar are shown (Fasting tab) */
  fastingOnly?: boolean;
}

interface ColGroup {
  groupKey: string;
  icon: LucideIcon;
  accent: string;
  cols: PrayerKey[];
}

const COL_GROUPS: ColGroup[] = [
  {
    groupKey: 'groupFasting',
    icon: Moon,
    accent: 'text-indigo-400',
    cols: ['suhoorEnd', 'fajr'],
  },
  {
    groupKey: 'groupMorning',
    icon: Sunrise,
    accent: 'text-amber-400',
    cols: ['sunrise', 'ishraq'],
  },
  {
    groupKey: 'groupMidday',
    icon: Sun,
    accent: 'text-yellow-400',
    cols: ['legalNoon', 'zuhr', 'customaryNoon'],
  },
  {
    groupKey: 'groupAfternoon',
    icon: Sun,
    accent: 'text-orange-400',
    cols: ['asrShafi', 'asrHanafi'],
  },
  {
    groupKey: 'groupEvening',
    icon: Sunset,
    accent: 'text-rose-400',
    cols: ['maghrib', 'iftar'],
  },
  {
    groupKey: 'groupNight',
    icon: CloudMoon,
    accent: 'text-purple-400',
    cols: ['shafaqAhmar', 'shafaqAbyaz', 'isha'],
  },
];

const ALL_COLS: PrayerKey[] = COL_GROUPS.flatMap((g) => g.cols);

// Sensible default: one prayer per group
const DEFAULT_VISIBLE: Set<PrayerKey> = new Set([
  'fajr', 'sunrise', 'ishraq', 'zuhr', 'asrHanafi', 'maghrib', 'isha',
]);

const FASTING_COLS: Set<PrayerKey> = new Set(['suhoorEnd', 'iftar']);

export function PrayerYearTable({ month, year = new Date().getFullYear(), showAll = false, fastingOnly = false }: Props) {
  const { settings, method } = useAppSettings();
  const { lang } = useLang();
  const days = daysInMonth(year, month);

  function initialVisible() {
    if (fastingOnly) return FASTING_COLS;
    if (showAll) return new Set(ALL_COLS);
    return DEFAULT_VISIBLE;
  }

  const [visible, setVisible] = useState<Set<PrayerKey>>(initialVisible);

  // Sync columns when view mode props change
  useEffect(() => {
    if (fastingOnly) setVisible(FASTING_COLS);
    else if (showAll) setVisible(new Set(ALL_COLS));
    else setVisible(DEFAULT_VISIBLE);
  }, [showAll, fastingOnly]);
  const [showPicker, setShowPicker] = useState(false);

  const shownCols = ALL_COLS.filter((c) => visible.has(c));

  const rows = useMemo(() => {
    const list: Array<{ day: number; values: Record<string, number | null> }> = [];
    for (let d = 1; d <= days; d++) {
      const times = computePrayerTimes(settings.location, month, d, { method, asrSchool: settings.asrSchool });
      const values: Record<string, number | null> = {};
      for (const c of ALL_COLS) values[c] = times[c as PrayerKey] ?? null;
      list.push({ day: d, values });
    }
    return list;
  }, [days, month, year, settings.location, settings.asrSchool, method]);

  const today = new Date();
  const todayDay = today.getMonth() + 1 === month && today.getFullYear() === year ? today.getDate() : -1;

  function toggleCol(c: PrayerKey) {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function selectGroup(cols: PrayerKey[]) {
    setVisible((prev) => {
      const next = new Set(prev);
      const allOn = cols.every((c) => next.has(c));
      cols.forEach((c) => (allOn ? next.delete(c) : next.add(c)));
      return next;
    });
  }

  return (
    <Card
      title={`${monthLabel(lang, month - 1)} ${year}`}
      subtitle={`${shownCols.length} ${t(lang, 'columns')}`}
      padded={false}
      delay={0.1}
      action={
        /* Column picker is hidden in For Students and Fasting modes */
        !showAll && !fastingOnly ? (
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className={[
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
              showPicker
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border/50 bg-accent/40 text-foreground/60 hover:bg-accent',
            ].join(' ')}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t(lang, 'columns')}
          </button>
        ) : undefined
      }
    >
      {/* Column picker — hidden in For Students and Fasting modes */}
      <AnimatePresence>
        {showPicker && !showAll && !fastingOnly && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border/40 bg-accent/10"
          >
            <div className="space-y-3 p-4">
              {COL_GROUPS.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.groupKey}>
                    <button
                      type="button"
                      onClick={() => selectGroup(group.cols)}
                      className="mb-1.5 flex items-center gap-1.5"
                    >
                      <GroupIcon className={`h-3.5 w-3.5 ${group.accent}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${group.accent}`}>
                        {t(lang, group.groupKey)}
                      </span>
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      {group.cols.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCol(c)}
                          className={[
                            'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                            visible.has(c)
                              ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                              : 'bg-accent/50 text-foreground/50 hover:bg-accent',
                          ].join(' ')}
                        >
                          {prayerLabel(lang, c)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-accent/30">
              <th className="sticky start-0 z-10 bg-accent/95 px-4 py-3 text-start text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50">
                {t(lang, 'day')}
              </th>
              {shownCols.map((c) => (
                <th key={c} className="px-4 py-3 text-end text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50 whitespace-nowrap">
                  {prayerLabel(lang, c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isToday = row.day === todayDay;
              return (
                <motion.tr
                  key={row.day}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: i * 0.008 }}
                  className={[
                    'border-b border-border/25 transition-colors hover:bg-accent/30',
                    isToday ? 'bg-primary/8' : i % 2 === 1 ? 'bg-accent/15' : '',
                  ].join(' ')}
                >
                  <td className="sticky start-0 z-10 bg-inherit px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      <span className={['font-bold tabular-nums', isToday ? 'text-primary' : 'text-foreground'].join(' ')}>
                        {row.day}
                      </span>
                    </div>
                  </td>
                  {shownCols.map((c) => (
                    <td key={c} className="px-4 py-2.5 text-end font-medium tabular-nums text-foreground/80">
                      <TimeText value={row.values[c]} />
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
