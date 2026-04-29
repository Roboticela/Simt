import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sunrise, Sun, Sunset, CloudMoon } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useAppSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { computePrayerTimes } from '../lib/prayerTimes';
import type { PrayerKey } from '../lib/constants';
import { TimeText } from './TimeText';
import { wrapHours } from '../lib/time';
import { useLang } from '../contexts/LanguageContext';
import { t, prayerLabel, monthLabel } from '../lib/i18n';
import type { LucideIcon } from 'lucide-react';

interface ScheduleItem {
  key: PrayerKey;
  /** second label shown below (e.g. "Suhoor Ends") */
  tagKey?: string;
}

interface ScheduleGroup {
  groupKey: string;
  icon: LucideIcon;
  accent: string;
  items: ScheduleItem[];
}

const GROUPS: ScheduleGroup[] = [
  {
    groupKey: 'groupFasting',
    icon: Moon,
    accent: 'text-indigo-400',
    items: [{ key: 'fajr', tagKey: 'suhoorEnd' }],
  },
  {
    groupKey: 'groupMorning',
    icon: Sunrise,
    accent: 'text-amber-400',
    items: [{ key: 'sunrise' }, { key: 'ishraq' }],
  },
  {
    groupKey: 'groupMidday',
    icon: Sun,
    accent: 'text-yellow-400',
    items: [{ key: 'zuhr' }],
  },
  {
    groupKey: 'groupAfternoon',
    icon: Sun,
    accent: 'text-orange-400',
    items: [{ key: 'asrShafi' }, { key: 'asrHanafi' }],
  },
  {
    groupKey: 'groupEvening',
    icon: Sunset,
    accent: 'text-rose-400',
    items: [{ key: 'maghrib', tagKey: 'iftar' }],
  },
  {
    groupKey: 'groupNight',
    icon: CloudMoon,
    accent: 'text-purple-400',
    items: [{ key: 'shafaqAhmar' }, { key: 'shafaqAbyaz' }, { key: 'isha' }],
  },
];

const NEXT_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'zuhr', 'asrShafi', 'asrHanafi', 'maghrib', 'isha'];

export function TodayPrayerCard() {
  const { settings, method } = useAppSettings();
  const { lang } = useLang();
  const now = useNow(15_000);
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();

  const times = useMemo(
    () => computePrayerTimes(settings.location, month, day, { method, asrSchool: settings.asrSchool }),
    [settings.location, settings.asrSchool, method, month, day],
  );

  const nowH = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  const nextEntry = useMemo(() => {
    const order = settings.asrSchool === 2
      ? NEXT_ORDER
      : NEXT_ORDER.filter((k) => k !== 'asrHanafi');
    const candidates = order
      .map((k) => ({ key: k, value: times[k] ?? null }))
      .filter((e): e is { key: PrayerKey; value: number } => e.value != null);
    return candidates.find((e) => e.value > nowH) ?? candidates[0];
  }, [times, nowH, settings.asrSchool]);

  const dateStr = `${monthLabel(lang, month - 1)} ${day}, ${year}`;

  let rowIndex = 0;

  return (
    <Card
      title={dateStr}
      subtitle={t(lang, 'prayerTimes')}
      action={
        nextEntry && (
          <Badge tone="primary">
            <Clock className="me-1 inline h-2.5 w-2.5" />
            {t(lang, 'nextPrayer')}: {prayerLabel(lang, nextEntry.key)}
          </Badge>
        )
      }
      padded={false}
      delay={0.05}
    >
      <div className="divide-y divide-border/30">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.groupKey}>
              {/* Group header */}
              <div className="flex items-center gap-2 bg-accent/20 px-5 py-2">
                <GroupIcon className={`h-3.5 w-3.5 shrink-0 ${group.accent}`} />
                <span className={`text-[11px] font-bold uppercase tracking-[0.15em] ${group.accent}`}>
                  {t(lang, group.groupKey)}
                </span>
              </div>

              {/* Items */}
              <ul className="divide-y divide-border/25">
                {group.items.map((item) => {
                  const i = rowIndex++;
                  const isNext = nextEntry?.key === item.key;
                  const value = times[item.key] ?? null;
                  const passed = value != null && wrapHours(value) <= nowH && !isNext;
                  const tagValue = item.tagKey ? times[item.tagKey as PrayerKey] ?? null : null;
                  const sameTimes = tagValue != null && value != null && Math.abs(tagValue - value) < 0.001;

                  return (
                    <motion.li
                      key={item.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: 0.04 + i * 0.035 }}
                      className={[
                        'flex items-center justify-between gap-4 px-5 py-3 transition-colors',
                        isNext ? 'bg-primary/8' : '',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {isNext ? (
                          <motion.span
                            layoutId="prayerIndicator"
                            className="h-2 w-2 shrink-0 rounded-full bg-primary"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        ) : (
                          <span className={['h-2 w-2 shrink-0 rounded-full', passed ? 'bg-foreground/15' : 'bg-foreground/25'].join(' ')} />
                        )}
                        <div className="min-w-0">
                          <p className={['text-sm font-semibold leading-tight', passed ? 'text-foreground/35' : isNext ? 'text-primary' : 'text-foreground'].join(' ')}>
                            {prayerLabel(lang, item.key)}
                          </p>
                          {item.tagKey && !sameTimes && (
                            <p className="text-[10px] font-medium text-foreground/45 leading-tight">
                              {prayerLabel(lang, item.tagKey as PrayerKey)}
                            </p>
                          )}
                          {item.tagKey && sameTimes && (
                            <p className="text-[10px] font-medium text-foreground/45 leading-tight">
                              {prayerLabel(lang, item.tagKey as PrayerKey)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <TimeText
                          value={value}
                          className={[
                            'text-base font-black tabular-nums',
                            passed ? 'text-foreground/30' : isNext ? 'text-primary' : 'text-foreground',
                          ].join(' ')}
                        />
                        {item.tagKey && !sameTimes && tagValue != null && (
                          <TimeText
                            value={tagValue}
                            className="text-[11px] font-semibold tabular-nums text-foreground/45"
                          />
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
