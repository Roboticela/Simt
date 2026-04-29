import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../lib/animations';
import { Compass } from 'lucide-react';
import { LocationCard } from '../components/LocationCard';
import { QiblaCard } from '../components/QiblaCard';
import { TodayPrayerCard } from '../components/TodayPrayerCard';
import { TodayFastingCard } from '../components/TodayFastingCard';
import { TodayQiblaShadowCard } from '../components/TodayQiblaShadowCard';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';


export function HomePage() {
  const { lang } = useLang();

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-4 sm:space-y-5"
    >
      {/* Page hero */}
      <motion.section variants={fadeUp} className="space-y-1 px-1">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <Compass className="h-3.5 w-3.5" />
          {t(lang, 'today')}
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t(lang, 'prayerTimes')}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-foreground/50">
          {t(lang, 'appTagline')}
        </p>
      </motion.section>

      <motion.div variants={fadeUp}>
        <LocationCard />
      </motion.div>

      {/* Main grid: full schedule + side cards */}
      <motion.div
        variants={fadeUp}
        className="grid gap-4 sm:gap-5 xl:grid-cols-[1.2fr_0.8fr]"
      >
        {/* Left: full daily schedule */}
        <TodayPrayerCard />

        {/* Right: quick-glance cards */}
        <div className="space-y-4 sm:space-y-5">
          <TodayFastingCard />
          <QiblaCard />
          <TodayQiblaShadowCard />
        </div>
      </motion.div>
    </motion.div>
  );
}
