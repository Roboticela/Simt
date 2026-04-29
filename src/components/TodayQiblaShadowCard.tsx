import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useAppSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { qiblaBearing, saffBearing } from '../lib/qibla';
import { computeQiblaShadowTimes } from '../lib/qiblaShadow';
import { TimeText } from './TimeText';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

export function TodayQiblaShadowCard() {
  const { settings } = useAppSettings();
  const { lang } = useLang();
  const now = useNow(60_000);
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const { shadow, status } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    const sf = saffBearing(qb);
    const sh = computeQiblaShadowTimes(settings.location, month, day, { qiblaDeg: qb, saffDeg: sf });
    return { shadow: sh, status: sh.status };
  }, [settings.location, month, day]);

  return (
    <Card
      title={t(lang, 'qiblaShadow')}
      subtitle={t(lang, 'shadowExplain').slice(0, 60) + '…'}
      action={
        <Badge tone={status === 'QNOS' ? 'emerald' : status === 'QSOS' ? 'amber' : 'neutral'}>
          {status}
        </Badge>
      }
      delay={0.15}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ShadowCell label={t(lang, 'qiblaForeNoon')} value={shadow.qiblaForeNoon} />
        <ShadowCell label={t(lang, 'qiblaAfterNoon')} value={shadow.qiblaAfterNoon} />
        <ShadowCell label={t(lang, 'saffForeNoon')} value={shadow.saffForeNoon} />
        <ShadowCell label={t(lang, 'saffAfterNoon')} value={shadow.saffAfterNoon} />
      </div>
    </Card>
  );
}

function ShadowCell({ label, value }: { label: string; value: number | null }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-border/50 bg-accent/30 p-4"
    >
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/45">
        <Sun className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tabular-nums text-foreground">
        <TimeText value={value} />
      </p>
    </motion.div>
  );
}
