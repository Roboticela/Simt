import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sunset, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { useAppSettings } from '../context/SettingsContext';
import { useNow } from '../hooks/useNow';
import { computePrayerTimes } from '../lib/prayerTimes';
import { TimeText } from './TimeText';
import { useLang } from '../contexts/LanguageContext';
import { t, prayerLabel } from '../lib/i18n';

function msUntil(targetH: number, nowH: number): number {
  let diff = targetH - nowH;
  if (diff < 0) diff += 24;
  return diff * 3600 * 1000;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function TodayFastingCard() {
  const { settings, method } = useAppSettings();
  const { lang } = useLang();
  const now = useNow(30_000);
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const times = useMemo(
    () => computePrayerTimes(settings.location, month, day, { method, asrSchool: settings.asrSchool }),
    [settings.location, settings.asrSchool, method, month, day],
  );

  const nowH = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const suhoorH = times.suhoorEnd;
  const iftarH = times.iftar;

  const iftarMs = iftarH != null ? msUntil(iftarH, nowH) : null;
  const suhoorMs = suhoorH != null ? msUntil(suhoorH, nowH) : null;

  const isFasting = suhoorH != null && iftarH != null && nowH >= suhoorH && nowH < iftarH;
  const beforeSuhoor = suhoorH != null && nowH < suhoorH;
  const afterIftar = iftarH != null && nowH >= iftarH;

  const countdown =
    isFasting && iftarMs != null
      ? `${t(lang, 'iftar')} ${t(lang, 'in')} ${formatCountdown(iftarMs)}`
      : beforeSuhoor && suhoorMs != null
      ? `${prayerLabel(lang, 'suhoorEnd')} ${t(lang, 'in')} ${formatCountdown(suhoorMs)}`
      : afterIftar
      ? t(lang, 'fastingComplete')
      : null;

  return (
    <Card title={t(lang, 'fastingTimes')} subtitle={t(lang, 'suhoorIftar')} padded={false} delay={0.1}>
      <div className="grid grid-cols-2 divide-x divide-border/40 rtl:divide-x-reverse">
        {/* Suhoor */}
        <motion.div
          whileHover={{ backgroundColor: 'var(--color-accent, rgba(0,0,0,0.04))' }}
          className="flex flex-col items-center gap-2 px-4 py-5 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Moon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {prayerLabel(lang, 'suhoorEnd')}
            </p>
            <TimeText
              value={suhoorH ?? null}
              className="mt-1 text-2xl font-black tabular-nums text-foreground"
            />
            <p className="mt-1 text-[11px] text-foreground/45">{prayerLabel(lang, 'fajr')}</p>
          </div>
        </motion.div>

        {/* Iftar */}
        <motion.div
          whileHover={{ backgroundColor: 'var(--color-accent, rgba(0,0,0,0.04))' }}
          className="flex flex-col items-center gap-2 px-4 py-5 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10">
            <Sunset className="h-5 w-5 text-rose-400" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
              {prayerLabel(lang, 'iftar')}
            </p>
            <TimeText
              value={iftarH ?? null}
              className="mt-1 text-2xl font-black tabular-nums text-foreground"
            />
            <p className="mt-1 text-[11px] text-foreground/45">{prayerLabel(lang, 'maghrib')}</p>
          </div>
        </motion.div>
      </div>

      {/* Countdown strip */}
      {countdown && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 border-t border-border/40 bg-primary/5 px-4 py-2.5"
        >
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">{countdown}</span>
        </motion.div>
      )}
    </Card>
  );
}
