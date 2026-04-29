import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, Sun, Navigation2, Settings,
  MapPin, ChevronDown, Check, Globe, Palette,
} from 'lucide-react';
import { AppIcon } from './AppIcon';
import { useThemeCtx, THEMES } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import { useAppSettings } from '../context/SettingsContext';
import { t } from '../lib/i18n';
import type { Lang } from '../lib/i18n';

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/',                labelKey: 'today',    icon: Home,        end: true },
  { to: '/prayer-calendar', labelKey: 'calendar', icon: Calendar },
  { to: '/qibla-shadow',    labelKey: 'shadow',   icon: Sun },
  { to: '/qibla',           labelKey: 'qibla',    icon: Navigation2 },
  { to: '/settings',        labelKey: 'settings', icon: Settings },
];

const LANG_OPTIONS: { id: Lang; code: string; labelKey: string }[] = [
  { id: 'en', code: 'EN', labelKey: 'english' },
  { id: 'ar', code: 'AR', labelKey: 'arabic'  },
  { id: 'ur', code: 'UR', labelKey: 'urdu'    },
];

export function Header() {
  const { settings } = useAppSettings();
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useThemeCtx();
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen]   = useState(false);

  const currentThemeMeta = THEMES.find((th) => th.name === theme)!;

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-2 px-4 sm:px-6">
          <Brand compact lang={lang} />

          <div className="flex items-center gap-1.5">
            <DropButton
              open={langOpen}
              onToggle={() => { setLangOpen((v) => !v); setThemeOpen(false); }}
              onClose={() => setLangOpen(false)}
              icon={<Globe className="h-4 w-4" />}
              label={lang.toUpperCase()}
            >
              <LangMenu lang={lang} setLang={(l) => { setLang(l as Lang); setLangOpen(false); }} />
            </DropButton>

            <DropButton
              open={themeOpen}
              onToggle={() => { setThemeOpen((v) => !v); setLangOpen(false); }}
              onClose={() => setThemeOpen(false)}
              icon={<Palette className="h-4 w-4" />}
              label={currentThemeMeta.label.split(' ')[0]}
            >
              <ThemeMenu lang={lang} current={theme} setTheme={(th) => { setTheme(th as import('../contexts/ThemeContext').ThemeName); setThemeOpen(false); }} />
            </DropButton>
          </div>
        </div>
      </motion.header>

      {/* ── Desktop side nav ────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -240, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 32, delay: 0.05 }}
        className="fixed inset-y-0 start-0 z-40 hidden w-60 flex-col border-e border-border/60 bg-card/90 backdrop-blur-xl lg:flex"
      >
        {/* Brand */}
        <div className="px-4 py-5">
          <Brand lang={lang} />
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
          {NAV.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.08 + i * 0.04 }}
            >
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'group relative flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/60 hover:bg-accent/60 hover:text-foreground',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sideActiveBar"
                        className="absolute start-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-e-full bg-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span
                      className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isActive ? 'bg-primary/15 text-primary' : 'bg-accent/50 text-foreground/50 group-hover:bg-accent group-hover:text-foreground',
                      ].join(' ')}
                    >
                      <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    <span className="truncate">{t(lang, item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Footer controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.35 }}
          className="space-y-3 border-t border-border/60 p-4"
        >
          {/* Location pill */}
          <div className="flex items-center gap-2 rounded-xl bg-accent/50 px-3 py-2 text-xs text-foreground/60">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{settings.location.name}</span>
          </div>

          {/* Language */}
          <SidebarDropRow
            open={langOpen}
            onToggle={() => { setLangOpen((v) => !v); setThemeOpen(false); }}
            onClose={() => setLangOpen(false)}
            icon={<Globe className="h-3.5 w-3.5 text-primary" />}
            label={t(lang, 'language')}
            badge={
              <span className="inline-flex h-5 w-7 items-center justify-center rounded-md bg-primary/15 text-[9px] font-black text-primary">
                {lang.toUpperCase()}
              </span>
            }
          >
            <LangMenu lang={lang} setLang={(l) => { setLang(l); setLangOpen(false); }} />
          </SidebarDropRow>

          {/* Theme picker */}
          <SidebarDropRow
            open={themeOpen}
            onToggle={() => { setThemeOpen((v) => !v); setLangOpen(false); }}
            onClose={() => setThemeOpen(false)}
            icon={<Palette className="h-3.5 w-3.5 text-primary" />}
            label={t(lang, 'theme')}
            badge={
              <span className={['h-4 w-4 shrink-0 rounded-full ring-1 ring-border/40', currentThemeMeta.swatch].join(' ')} />
            }
          >
            <ThemeMenu lang={lang} current={theme} setTheme={(th) => { setTheme(th as import('../contexts/ThemeContext').ThemeName); setThemeOpen(false); }} />
          </SidebarDropRow>
        </motion.div>
      </motion.aside>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32, delay: 0.1 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/80 backdrop-blur-xl lg:hidden"
      >
        <div className="safe-area-bottom mx-auto grid h-16 max-w-2xl grid-cols-5 px-1 sm:px-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-primary' : 'text-foreground/40 hover:text-foreground/70',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottomActiveBar"
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <motion.span
                    animate={{ scale: isActive ? 1.12 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-xl',
                      isActive ? 'bg-primary/15' : '',
                    ].join(' ')}
                  >
                    <item.icon
                      className="h-5 w-5"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.span>
                  <span className="truncate leading-none">{t(lang, item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.nav>
    </>
  );
}

/* ─── Brand ─────────────────────────────────────────────────── */
function Brand({ compact = false, lang }: { compact?: boolean; lang: Lang }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <AppIcon className={compact ? 'h-9 w-9 shrink-0' : 'h-10 w-10 shrink-0'} />
      <h1 className={['font-extrabold tracking-tight text-foreground', compact ? 'text-base' : 'text-xl'].join(' ')}>
        {t(lang, 'appName')}
      </h1>
    </div>
  );
}

/* ─── Sidebar collapsible row (desktop only) ─────────────────── */
function SidebarDropRow({
  open, onToggle, onClose, icon, label, badge, children,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ReactNode;
  label: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ x: 1 }}
        className={[
          'flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-xs font-bold transition-colors',
          open
            ? 'border-primary/40 bg-primary/8 text-primary'
            : 'border-border/50 bg-accent/30 text-foreground/65 hover:border-primary/20 hover:bg-accent hover:text-foreground',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {badge}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex"
          >
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </motion.span>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-drop"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-2 start-0 end-0 z-50 overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl"
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-primary to-tertiary" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Dropdown button wrapper ────────────────────────────────── */
function DropButton({
  open, onToggle, onClose, icon, label, children,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        onClick={onToggle}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={[
          'flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors',
          open
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border/60 bg-accent/40 text-foreground/70 hover:border-primary/30 hover:bg-accent hover:text-foreground',
        ].join(' ')}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute end-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl"
          >
            {/* top accent line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-primary to-tertiary" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Language menu ──────────────────────────────────────────── */
function LangMenu({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="p-1.5 space-y-0.5">
      {LANG_OPTIONS.map((opt, i) => {
        const active = lang === opt.id;
        return (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => setLang(opt.id)}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.14, delay: i * 0.04 }}
            className={[
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-primary/12 text-primary'
                : 'text-foreground/70 hover:bg-accent/70 hover:text-foreground',
            ].join(' ')}
          >
            <span className={[
              'inline-flex h-6 w-8 items-center justify-center rounded-lg text-[10px] font-black tracking-wider',
              active ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground/60',
            ].join(' ')}>
              {opt.code}
            </span>
            <span className="flex-1 text-start">{t(lang, opt.labelKey)}</span>
            {active && (
              <motion.span layoutId="langCheck" transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <Check className="h-3.5 w-3.5 text-primary" />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Theme menu ─────────────────────────────────────────────── */
function ThemeMenu({
  lang, current, setTheme,
}: {
  lang: Lang;
  current: string;
  setTheme: (t: string) => void;
}) {
  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-1">
        {THEMES.map((th, i) => {
          const active = current === th.name;
          return (
            <motion.button
              key={th.name}
              type="button"
              onClick={() => setTheme(th.name)}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.13, delay: i * 0.02 }}
              className={[
                'relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-all',
                active
                  ? 'bg-primary/15 text-primary ring-1 ring-primary/40'
                  : 'text-foreground/65 hover:bg-accent/70 hover:text-foreground',
              ].join(' ')}
            >
              <span className={['h-4 w-4 shrink-0 rounded-full ring-1 ring-border/30', th.swatch].join(' ')} />
              <span className="truncate text-start leading-none">
                {lang === 'ar' ? th.labelAr : lang === 'ur' ? th.labelUr : th.label}
              </span>
              {active && <Check className="ms-auto h-3 w-3 shrink-0 text-primary" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
