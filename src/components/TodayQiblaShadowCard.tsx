import { useMemo } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useAppSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { qiblaBearing, saffBearing } from '../lib/qibla';
import { computeQiblaShadowTimes } from '../lib/qiblaShadow';
import { TimeText } from './TimeText';

export function TodayQiblaShadowCard() {
  const { settings } = useAppSettings();
  const now = useNow(60_000);
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const { shadow, status } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    const sf = saffBearing(qb);
    const sh = computeQiblaShadowTimes(settings.location, month, day, {
      qiblaDeg: qb,
      saffDeg: sf,
    });
    return { shadow: sh, status: sh.status };
  }, [settings.location, month, day]);

  return (
    <Card
      title="Qibla Shadow Times Today"
      subtitle="Times when a vertical shadow falls along Qibla / Saff direction"
      action={<Badge tone={status === 'QNOS' ? 'emerald' : status === 'QSOS' ? 'amber' : 'neutral'}>{status}</Badge>}
    >
      <div className="grid grid-cols-2 gap-3">
        <Cell title="Qibla — Fore-noon" value={shadow.qiblaForeNoon} />
        <Cell title="Qibla — After-noon" value={shadow.qiblaAfterNoon} />
        <Cell title="Saff — Fore-noon" value={shadow.saffForeNoon} />
        <Cell title="Saff — After-noon" value={shadow.saffAfterNoon} />
      </div>
    </Card>
  );
}

function Cell({ title, value }: { title: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
        <TimeText value={value} />
      </p>
    </div>
  );
}
