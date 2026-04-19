import { useMemo } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useAppSettings } from '../context/SettingsContext';
import { compassDirection, distanceToMakkah, qiblaBearing, saffBearing } from '../lib/qibla';

export function QiblaCard() {
  const { settings } = useAppSettings();
  const { qibla, saff, distance } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    return {
      qibla: qb,
      saff: saffBearing(qb),
      distance: distanceToMakkah(settings.location),
    };
  }, [settings.location]);

  return (
    <Card title="Qibla & Saff Bearings" subtitle="Great-circle direction toward Makkah">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CompassDial bearing={qibla} />
        <Field label="Qibla (from N)" value={`${qibla.toFixed(2)}°`} sub={compassDirection(qibla)} />
        <Field label="Saff (row)" value={`${saff.toFixed(2)}°`} sub={compassDirection(saff)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Badge tone="emerald">Makkah</Badge>
        <span>{distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km away</span>
      </div>
    </Card>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

function CompassDial({ bearing }: { bearing: number }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-center">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-2 border-slate-300 dark:border-slate-700" />
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          N
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          S
        </span>
        <span className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          W
        </span>
        <span className="absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          E
        </span>
        <div
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{ transform: `translate(-50%, -100%) rotate(${bearing}deg)` }}
        >
          <div className="w-0 h-14 border-l-2 border-emerald-600 dark:border-emerald-400" />
          <div className="absolute -left-1 -top-2 h-3 w-3 rotate-45 bg-emerald-600 dark:bg-emerald-400" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-200" />
      </div>
    </div>
  );
}
