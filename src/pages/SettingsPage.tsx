import { useRef, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeUp } from '../lib/animations';
import { Settings, Globe, Palette, Clock, BookOpen, RotateCcw, Scale, Bell, Volume2 } from 'lucide-react';
import { LocationCard } from '../components/LocationCard';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAppSettings } from '../context/SettingsContext';
import { useLang } from '../contexts/LanguageContext';
import type { NotifyPrayer } from '../hooks/useSettings';
import { METHODS } from '../lib/types';
import { t, prayerLabel } from '../lib/i18n';
import { pickAudioFile, requestAppNotificationPermission } from '../lib/tauri';
import type { Lang } from '../lib/i18n';

const LANG_OPTIONS: { id: Lang; code: string; labelKey: string }[] = [
  { id: 'en', code: 'EN', labelKey: 'english' },
  { id: 'ar', code: 'AR', labelKey: 'arabic' },
  { id: 'ur', code: 'UR', labelKey: 'urdu' },
  { id: 'hi', code: 'HI', labelKey: 'hindi' },
];

const NOTIFY_PRAYERS: NotifyPrayer[] = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];
const MINUTE_OPTIONS = [5, 8, 10, 12, 15, 20, 25, 30, 35, 45, 60].map((m) => ({
  value: String(m),
  label: `${m} ${m === 1 ? 'minute' : 'minutes'}`,
}));

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
  const soundInputRef = useRef<HTMLInputElement>(null);

  async function enableBrowserNotifications() {
    const granted = await requestAppNotificationPermission();
    update({ notificationsEnabled: granted });
  }

  async function enableNotificationsByMode() {
    if (settings.notificationDelivery === 'sound') {
      update({ notificationsEnabled: true });
      return;
    }
    await enableBrowserNotifications();
  }

  function onSoundFilePicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl) update({ notificationSoundUrl: dataUrl, useDefaultAlertSound: false });
    };
    reader.readAsDataURL(file);
  }

  async function pickSoundFromDevice() {
    const tauriFileSrc = await pickAudioFile();
    if (tauriFileSrc) {
      update({ notificationSoundUrl: tauriFileSrc, useDefaultAlertSound: false });
      return;
    }
    soundInputRef.current?.click();
  }

  function updatePrayerRule(prayer: NotifyPrayer, patch: { enabled?: boolean; minutesBefore?: number }) {
    update({
      prayerNotifications: {
        ...settings.prayerNotifications,
        [prayer]: {
          ...settings.prayerNotifications[prayer],
          ...patch,
        },
      },
    });
  }

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
                fullWidth
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
              <button
                type="button"
                role="switch"
                aria-checked={settings.showSeconds}
                onClick={() => update({ showSeconds: !settings.showSeconds })}
                className={[
                  'group flex w-full items-center justify-between rounded-2xl border border-border/60 bg-accent/35 px-3 py-2.5 text-sm font-semibold transition-all',
                  'hover:bg-accent/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                ].join(' ')}
              >
                <span className="text-foreground/75">
                  {settings.showSeconds ? t(lang, 'show') : t(lang, 'hide')}
                </span>
                <span
                  className={[
                    'relative h-7 w-12 rounded-full transition-colors',
                    settings.showSeconds ? 'bg-primary/80' : 'bg-foreground/20',
                  ].join(' ')}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    className={[
                      'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md',
                      settings.showSeconds ? 'left-[1.55rem]' : 'left-0.5',
                    ].join(' ')}
                  />
                </span>
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={Bell} label={t(lang, 'notifications')} />}
          subtitle={t(lang, 'notificationsSubtitle')}
          delay={0}
        >
          <div className="space-y-4">
            <button
              type="button"
              role="switch"
              aria-checked={settings.notificationsEnabled}
              onClick={() => {
                if (!settings.notificationsEnabled) {
                  void enableNotificationsByMode();
                  return;
                }
                update({ notificationsEnabled: false });
              }}
              className={[
                'group flex w-full items-center justify-between rounded-2xl border border-border/60 bg-accent/35 px-3 py-2.5 text-sm font-semibold transition-all',
                'hover:bg-accent/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              ].join(' ')}
            >
              <span className="text-foreground/75">{t(lang, 'enableNotifications')}</span>
              <span
                className={[
                  'relative h-7 w-12 rounded-full transition-colors',
                  settings.notificationsEnabled ? 'bg-primary/80' : 'bg-foreground/20',
                ].join(' ')}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  className={[
                    'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md',
                    settings.notificationsEnabled ? 'left-[1.55rem]' : 'left-0.5',
                  ].join(' ')}
                />
              </span>
            </button>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                role="switch"
                aria-checked={settings.notifyAtPrayerTime}
                onClick={() => update({ notifyAtPrayerTime: !settings.notifyAtPrayerTime })}
                disabled={!settings.notificationsEnabled}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-accent/35 px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-all hover:bg-accent/55 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(lang, 'notifyAtPrayerTime')}
                <span
                  className={[
                    'relative h-6 w-11 rounded-full transition-colors',
                    settings.notifyAtPrayerTime ? 'bg-primary/80' : 'bg-foreground/20',
                  ].join(' ')}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    className={[
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md',
                      settings.notifyAtPrayerTime ? 'left-[1.35rem]' : 'left-0.5',
                    ].join(' ')}
                  />
                </span>
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={settings.notifyBeforePrayer}
                onClick={() => update({ notifyBeforePrayer: !settings.notifyBeforePrayer })}
                disabled={!settings.notificationsEnabled}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-accent/35 px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-all hover:bg-accent/55 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(lang, 'notifyBeforePrayer')}
                <span
                  className={[
                    'relative h-6 w-11 rounded-full transition-colors',
                    settings.notifyBeforePrayer ? 'bg-primary/80' : 'bg-foreground/20',
                  ].join(' ')}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    className={[
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md',
                      settings.notifyBeforePrayer ? 'left-[1.35rem]' : 'left-0.5',
                    ].join(' ')}
                  />
                </span>
              </button>
            </div>

            <div className="space-y-2">
              {NOTIFY_PRAYERS.map((prayer) => {
                const key = prayer === 'asr' ? (settings.asrSchool === 2 ? 'asrHanafi' : 'asrShafi') : prayer;
                const rule = settings.prayerNotifications[prayer];
                return (
                  <div key={prayer} className="rounded-2xl border border-border/50 bg-card/40 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground/85">{prayerLabel(lang, key)}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={rule.enabled}
                        onClick={() => updatePrayerRule(prayer, { enabled: !rule.enabled })}
                        disabled={!settings.notificationsEnabled}
                        className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-xs font-semibold text-foreground/70 hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rule.enabled ? t(lang, 'on') : t(lang, 'off')}
                        <span
                          className={[
                            'relative h-6 w-11 rounded-full transition-colors',
                            rule.enabled ? 'bg-primary/80' : 'bg-foreground/20',
                          ].join(' ')}
                        >
                          <motion.span
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                            className={[
                              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md',
                              rule.enabled ? 'left-[1.35rem]' : 'left-0.5',
                            ].join(' ')}
                          />
                        </span>
                      </button>
                    </div>
                    <div className="mt-2">
                      <Select
                        options={MINUTE_OPTIONS}
                        value={String(rule.minutesBefore)}
                        onValueChange={(v) => updatePrayerRule(prayer, { minutesBefore: Number(v) })}
                        disabled={!settings.notificationsEnabled || !settings.notifyBeforePrayer || !rule.enabled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notification Sound */}
      <motion.div variants={fadeUp}>
        <Card
          title={<CardTitle icon={Volume2} label={t(lang, 'notificationSound')} />}
          subtitle={t(lang, 'defaultAllahuAkbar')}
          delay={0}
        >
          <div className="space-y-3">
            <button
              type="button"
              role="switch"
              aria-checked={settings.useDefaultAlertSound}
              onClick={() => update({ useDefaultAlertSound: !settings.useDefaultAlertSound })}
              disabled={!settings.notificationsEnabled}
              className={[
                'group flex w-full items-center justify-between rounded-2xl border border-border/60 bg-accent/35 px-3 py-2.5 text-sm font-semibold transition-all',
                'hover:bg-accent/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
              ].join(' ')}
            >
              <span className="text-foreground/75">{t(lang, 'defaultAlertMode')}</span>
              <span
                className={[
                  'relative h-7 w-12 rounded-full transition-colors',
                  settings.useDefaultAlertSound ? 'bg-primary/80' : 'bg-foreground/20',
                ].join(' ')}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  className={[
                    'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md',
                    settings.useDefaultAlertSound ? 'left-[1.55rem]' : 'left-0.5',
                  ].join(' ')}
                />
              </span>
            </button>

            <p className="text-[11px] text-foreground/50">{t(lang, 'soundAssetHint')}</p>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void pickSoundFromDevice()}
                disabled={!settings.notificationsEnabled || settings.useDefaultAlertSound}
              >
                {t(lang, 'uploadSound')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update({ useDefaultAlertSound: true, notificationSoundUrl: '/sounds/allahu-akbar.mp3' })}
                disabled={!settings.notificationsEnabled}
              >
                {t(lang, 'useDefaultSound')}
              </Button>
            </div>
            <input
              ref={soundInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
              onChange={onSoundFilePicked}
              className="hidden"
            />
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
