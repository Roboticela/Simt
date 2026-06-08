import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import { INFO_PAGES, type InfoPageId } from '../lib/infoPages';
import { fadeUp, stagger } from '../lib/animations';
import { LicenseDocument } from '../components/LicenseDocument';

interface Props {
  page: InfoPageId;
}

export function InfoPage({ page }: Props) {
  const { lang } = useLang();
  const config = INFO_PAGES[page];

  return (
    <motion.article variants={stagger} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={fadeUp}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold text-foreground/55 transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t(lang, 'back')}
        </Link>
      </motion.div>

      <motion.header variants={fadeUp} className="space-y-2 px-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t(lang, config.titleKey)}
        </h1>
      </motion.header>

      <motion.div
        variants={fadeUp}
        className="space-y-4 rounded-3xl border border-border/60 bg-card p-5 sm:p-6"
      >
        {page === 'license' ? (
          <LicenseDocument />
        ) : (
          config.bodyKeys.map((key) => (
            <p key={key} className="text-sm leading-7 text-foreground/75">
              {t(lang, key)}
            </p>
          ))
        )}
      </motion.div>
    </motion.article>
  );
}
