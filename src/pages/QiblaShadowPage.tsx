import { useState } from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../lib/animations';
import { Sun } from 'lucide-react';
import { LocationCard } from '../components/LocationCard';
import { MonthSelector } from '../components/MonthSelector';
import { YearSelector } from '../components/YearSelector';
import { QiblaShadowMonthTable } from '../components/QiblaShadowMonthTable';
import { Card } from '../components/ui/Card';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';


export function QiblaShadowPage() {
  const { lang } = useLang();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 sm:space-y-5">
      <motion.section variants={fadeUp} className="space-y-1 px-1">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <Sun className="h-3.5 w-3.5" />
          {t(lang, 'shadow')}
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t(lang, 'qiblaShadow')}
        </h2>
        <p className="text-sm leading-6 text-foreground/50">{t(lang, 'whatIsShadow')}</p>
      </motion.section>

      <motion.div variants={fadeUp}><LocationCard /></motion.div>

      <motion.div variants={fadeUp}>
        <Card title={t(lang, 'whatIsShadow')} subtitle={t(lang, 'shadowStatusNote')}>
          <p className="text-sm leading-6 text-foreground/70">{t(lang, 'shadowExplain')}</p>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 gap-3 rounded-3xl border border-border/50 bg-card/70 p-3 backdrop-blur sm:flex sm:flex-wrap sm:items-end"
      >
        <MonthSelector value={month} onChange={setMonth} />
        <YearSelector value={year} onChange={setYear} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <QiblaShadowMonthTable month={month} year={year} />
      </motion.div>
    </motion.div>
  );
}

