import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../lib/animations';
import { Navigation2, Compass, Map, Clock4, CheckCircle2 } from 'lucide-react';
import { LocationCard } from '../components/LocationCard';
import { QiblaCard } from '../components/QiblaCard';
import { Card } from '../components/ui/Card';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import { useAppSettings } from '../context/SettingsContext';
import { compassDirection, qiblaBearing, saffBearing, distanceToMakkah } from '../lib/qibla';


const TIPS = [
  { icon: Compass,   key: 'qiblaTip1' },
  { icon: Clock4,    key: 'qiblaTip2' },
  { icon: Map,       key: 'qiblaTip3' },
];

export function QiblaPage() {
  const { lang } = useLang();
  const { settings } = useAppSettings();

  const { qibla, saff, distance } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    return { qibla: qb, saff: saffBearing(qb), distance: distanceToMakkah(settings.location) };
  }, [settings.location]);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 sm:space-y-5">
      <motion.section variants={fadeUp} className="space-y-1 px-1">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <Navigation2 className="h-3.5 w-3.5" />
          {t(lang, 'qibla')}
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t(lang, 'qiblaDirection')}
        </h2>
        <p className="text-sm leading-6 text-foreground/50">{t(lang, 'distanceExplain')}</p>
      </motion.section>

      <motion.div variants={fadeUp}><LocationCard /></motion.div>
      <motion.div variants={fadeUp}><QiblaCard /></motion.div>

      {/* Saff explanation */}
      <motion.div variants={fadeUp}>
        <Card
          title={t(lang, 'saffDirection')}
          subtitle={t(lang, 'saffRow')}
          delay={0.15}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-accent/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/45">{t(lang, 'qiblaFromN')}</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{qibla.toFixed(1)}°</p>
              <p className="mt-1 text-sm font-semibold text-primary">{compassDirection(qibla)}</p>
              <p className="mt-2 text-xs text-foreground/50">{t(lang, 'distanceExplain')}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-accent/30 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/45">{t(lang, 'saffRow')}</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{saff.toFixed(1)}°</p>
              <p className="mt-1 text-sm font-semibold text-primary">{compassDirection(saff)}</p>
              <p className="mt-2 text-xs text-foreground/50">{t(lang, 'qiblaSaffExplain')}</p>
            </div>
          </div>

          {/* Distance chip */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/8 px-4 py-3">
            <Map className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-black text-foreground">
                {distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km
              </p>
              <p className="text-xs text-foreground/50">{t(lang, 'fromMakkah')} · {t(lang, 'accuracyNote')}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* How to face Qibla - 3 user-friendly tips */}
      <motion.div variants={fadeUp}>
        <Card
          title={t(lang, 'howToUseQibla')}
          subtitle={t(lang, 'qiblaTipHeading')}
          delay={0.2}
        >
          <ul className="space-y-3">
            {TIPS.map(({ icon: Icon, key }, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-4 rounded-2xl border border-border/40 bg-accent/20 px-4 py-3.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary/60">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-6 text-foreground/75">{t(lang, key)}</p>
                </div>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/40" />
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
}
