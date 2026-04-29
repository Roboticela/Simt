import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../lib/animations';
import { Settings, Globe, Palette, Clock, BookOpen, RotateCcw, Scale } from 'lucide-react';
import { LocationCard } from '../components/LocationCard';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAppSettings } from '../context/SettingsContext';
import { useLang } from '../contexts/LanguageContext';
import { METHODS } from '../lib/types';
import { t } from '../lib/i18n';
import type { Lang } from '../lib/i18n';

const LANG_OPTIONS: { id: Lang; code: string; labelKey: string }[] = [
  { id: 'en', code: 'EN', labelKey: 'english' },
  { id: 'ar', code: 'AR', labelKey: 'arabic' },
  { id: 'ur', code: 'UR', labelKey: 'urdu' },
];

/** Renders an icon + label for use directly as a Card title */
function CardTitle({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </span>
  );
}

export function SettingsPage() {
  const { settings, update, reset } = useAppSettings();
  const { lang, setLang } = useLang();

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 sm:space-y-5">

      {/* Hero */}
      <motion.section variants={fadeUp} className="space-y-1 px-1">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <Settings className="h-3.5 w-3.5" />
          {t(lang, 'settings')}
        </p>
        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {t(lang, 'display')} &amp; {t(lang, 'method')}
        </h2>
      </motion.section>

      {/* Location */}
      <motion.div variants={fadeUp}><LocationCard /></motion.div>

      {/* Language */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={Globe} label={t(lang, 'language')} />}
          subtitle={t(lang, 'langSubtitle')}
          delay={0}
        >
          <div className="grid grid-cols-3 gap-2">
            {LANG_OPTIONS.map((opt) => (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => setLang(opt.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={[
                  'flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition-all',
                  lang === opt.id
                    ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                    : 'bg-accent/40 text-foreground/60 hover:bg-accent',
                ].join(' ')}
              >
                <span className="inline-flex h-6 w-8 items-center justify-center rounded-md bg-foreground/10 text-[10px] font-black tracking-wider">
                  {opt.code}
                </span>
                <span>{t(lang, opt.labelKey)}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={Palette} label={t(lang, 'theme')} />}
          subtitle={t(lang, 'themeSubtitle')}
          delay={0}
        >
          <ThemeToggle />
        </Card>
      </motion.div>

      {/* Calculation method */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={BookOpen} label={t(lang, 'method')} />}
          subtitle={t(lang, 'calcMethodSubtitle')}
          delay={0}
        >
          <Select
            options={Object.values(METHODS).map((m) => ({ label: m.name, value: m.id }))}
            value={settings.methodId}
            onValueChange={(v) => update({ methodId: v })}
          />
          <p className="mt-3 text-xs leading-5 text-foreground/45">
            {t(lang, 'karachiConvention')}
          </p>
        </Card>
      </motion.div>

      {/* Asr school */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={Scale} label={t(lang, 'asrSchool')} />}
          subtitle={t(lang, 'asrSubtitle')}
          delay={0}
        >
          <Tabs<'1' | '2'>
            fullWidth
            value={String(settings.asrSchool) as '1' | '2'}
            onChange={(v) => update({ asrSchool: v === '2' ? 2 : 1 })}
            items={[
              { id: '1', label: t(lang, 'shafi') },
              { id: '2', label: t(lang, 'hanafi') },
            ]}
          />
        </Card>
      </motion.div>

      {/* Display */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={Clock} label={t(lang, 'display')} />}
          subtitle={t(lang, 'displaySubtitle')}
          delay={0}
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-foreground/60">{t(lang, 'timeFormat')}</p>
              <Tabs<'12' | '24'>
                value={settings.timeFormat}
                onChange={(v) => update({ timeFormat: v })}
                items={[
                  { id: '12', label: t(lang, 'h12') },
                  { id: '24', label: t(lang, 'h24') },
                ]}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-foreground/60">{t(lang, 'showSeconds')}</p>
              <Tabs<'on' | 'off'>
                value={settings.showSeconds ? 'on' : 'off'}
                onChange={(v) => update({ showSeconds: v === 'on' })}
                items={[
                  { id: 'off', label: t(lang, 'hide') },
                  { id: 'on',  label: t(lang, 'show') },
                ]}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Reset */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={RotateCcw} label={t(lang, 'resetSettings')} />}
          subtitle={t(lang, 'resetConfirm')}
          delay={0}
        >
          <Button
            variant="danger"
            leading={<RotateCcw className="h-4 w-4" />}
            onClick={reset}
          >
            {t(lang, 'resetSettings')}
          </Button>
        </Card>
      </motion.div>

    </motion.div>
  );
}
