import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stagger, fadeUp } from '../lib/animations';
import { Calendar, GraduationCap, UtensilsCrossed } from 'lucide-react';
import { LocationCard } from '../components/LocationCard';
import { MonthSelector } from '../components/MonthSelector';
import { YearSelector } from '../components/YearSelector';
import { PrayerYearTable } from '../components/PrayerYearTable';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import type { LucideIcon } from 'lucide-react';

type View = 'standard' | 'students' | 'fasting';

interface TabDef {
  view: View;
  icon: LucideIcon;
  labelKey: string;
}

const TABS: TabDef[] = [
  { view: 'standard', icon: Calendar,         labelKey: 'viewStandard' },
  { view: 'students', icon: GraduationCap,    labelKey: 'viewStudents' },
  { view: 'fasting',  icon: UtensilsCrossed,  labelKey: 'viewFasting'  },
];

export function PrayerCalendarPage() {
  const { lang } = useLang();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year,  setYear]  = useState(today.getFullYear());
  const [view,  setView]  = useState<View>('standard');

  const isStudents = view === 'students';
  const isFasting  = view === 'fasting';

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 sm:space-y-5">

      {/* Heading */}
      <motion.section variants={fadeUp} className="space-y-1 px-1">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <Calendar className="h-3.5 w-3.5" />
          {t(lang, 'calendar')}
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t(lang, 'allPrayerTimes')}
        </h2>
        <p className="text-sm leading-6 text-foreground/50">
          {t(lang, 'fastingTimes')} · {t(lang, 'twilight')} · {t(lang, 'suhoorIftar')}
        </p>
      </motion.section>

      {/* View toggle — Standard / For Students / Fasting */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card/70 p-1 backdrop-blur w-fit">
        {TABS.map(({ view: v, icon: Icon, labelKey }) => {
          const active = view === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="cal-tab-pill"
                  className="absolute inset-0 rounded-xl bg-primary/15 ring-1 ring-primary/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`relative h-3.5 w-3.5 ${active ? 'text-primary' : 'text-foreground/40'}`} />
              <span className={`relative ${active ? 'text-primary' : 'text-foreground/50'}`}>
                {t(lang, labelKey)}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Info banner — swaps content per view */}
      <AnimatePresence mode="wait">
        {view === 'standard' && (
          <motion.div
            key="standard-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-accent/30 px-4 py-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-foreground/50" />
              <p className="text-xs leading-5 text-foreground/60">{t(lang, 'studentsNote')}</p>
            </div>
          </motion.div>
        )}
        {view === 'students' && (
          <motion.div
            key="students-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/6 px-4 py-3">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-foreground/70">{t(lang, 'studentsSubtitle')}</p>
            </div>
          </motion.div>
        )}
        {view === 'fasting' && (
          <motion.div
            key="fasting-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/6 px-4 py-3">
              <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-xs leading-5 text-foreground/70">{t(lang, 'fastingNote')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp}><LocationCard /></motion.div>

      {/* Month / Year selectors */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-3 rounded-3xl border border-border/50 bg-card/70 p-3 backdrop-blur sm:flex sm:flex-wrap sm:items-end"
      >
        <MonthSelector value={month} onChange={setMonth} />
        <YearSelector  value={year}  onChange={setYear}  />
      </motion.div>

      {/* Table — mode driven by view */}
      <motion.div variants={fadeUp}>
        <PrayerYearTable
          month={month}
          year={year}
          showAll={isStudents}
          fastingOnly={isFasting}
        />
      </motion.div>

    </motion.div>
  );
}
