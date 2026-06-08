import { useState, useRef, useCallback } from 'react';
import { useDismissOnOutsideClick } from '../hooks/useDismissOnOutsideClick';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Calendar, Sun, Navigation2, Settings,
  ChevronDown, Check, Globe, Palette,
} from 'lucide-react';
import { AppIcon } from './AppIcon';
import { useThemeCtx, THEMES } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import type { Lang } from '../lib/i18n';
import { themeLabel } from '../contexts/ThemeContext';
import { MoreMenu } from './MoreMenu';

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
  { id: 'hi', code: 'HI', labelKey: 'hindi'   },
];

export function Header() {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useThemeCtx();
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen]   = useState(false);

  const closeLang = useCallback(() => setLangOpen(false), []);
  const closeTheme = useCallback(() => setThemeOpen(false), []);

  const currentThemeMeta = THEMES.find((th) => th.name === theme)!;
  const currentLangOption = LANG_OPTIONS.find((o) => o.id === lang)!;

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

          <HeaderToolbar
            lang={lang}
            theme={theme}
            langOpen={langOpen}
            themeOpen={themeOpen}
            langLabel={t(lang, currentLangOption.labelKey)}
            themeLabelText={themeLabel(lang, currentThemeMeta)}
            onLangToggle={() => { setLangOpen((v) => !v); setThemeOpen(false); }}
            onThemeToggle={() => { setThemeOpen((v) => !v); setLangOpen(false); }}
            onLangClose={closeLang}
            onThemeClose={closeTheme}
            onSetLang={(l) => { setLang(l); closeLang(); }}
            onSetTheme={(th) => { setTheme(th); closeTheme(); }}
          />
        </div>
      </motion.header>

      {/* ── Desktop side nav ────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -240, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 32, delay: 0.05 }}
        className="fixed inset-y-0 start-0 z-40 hidden w-60 flex-col border-e border-border/60 bg-card/90 backdrop-blur-xl lg:flex"
      >
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
      </motion.aside>

      {/* ── Desktop top bar (lang / theme / menu) ───────────────────── */}
      <motion.header
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.08 }}
        className="fixed top-0 end-0 z-30 hidden h-16 border-b border-border/60 bg-card/80 backdrop-blur-xl lg:start-60 lg:flex"
      >
        <div className="flex h-full w-full items-center justify-end px-4 xl:px-6">
          <HeaderToolbar
            lang={lang}
            theme={theme}
            langOpen={langOpen}
            themeOpen={themeOpen}
            langLabel={t(lang, currentLangOption.labelKey)}
            themeLabelText={themeLabel(lang, currentThemeMeta)}
            onLangToggle={() => { setLangOpen((v) => !v); setThemeOpen(false); }}
            onThemeToggle={() => { setThemeOpen((v) => !v); setLangOpen(false); }}
            onLangClose={closeLang}
            onThemeClose={closeTheme}
            onSetLang={(l) => { setLang(l); closeLang(); }}
            onSetTheme={(th) => { setTheme(th); closeTheme(); }}
          />
        </div>
      </motion.header>

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

/* ─── Lang / theme / menu toolbar (mobile top + desktop top nav) ─ */
function HeaderToolbar({
  lang,
  theme,
  langOpen,
  themeOpen,
  langLabel,
  themeLabelText,
  onLangToggle,
  onThemeToggle,
  onLangClose,
  onThemeClose,
  onSetLang,
  onSetTheme,
  showDivider = false,
}: {
  lang: Lang;
  theme: string;
  langOpen: boolean;
  themeOpen: boolean;
  langLabel: string;
  themeLabelText: string;
  onLangToggle: () => void;
  onThemeToggle: () => void;
  onLangClose: () => void;
  onThemeClose: () => void;
  onSetLang: (l: Lang) => void;
  onSetTheme: (th: import('../contexts/ThemeContext').ThemeName) => void;
  showDivider?: boolean;
}) {
  return (
    <div
      className={[
        'flex shrink-0 items-center gap-1.5',
        showDivider ? 'border-s border-border/40 ps-3' : '',
      ].join(' ')}
    >
      <DropButton
        open={langOpen}
        onToggle={onLangToggle}
        onClose={onLangClose}
        icon={<Globe className="h-4 w-4" />}
        label={langLabel}
        showLabel
      >
        <LangMenu lang={lang} setLang={onSetLang} />
      </DropButton>

      <DropButton
        open={themeOpen}
        onToggle={onThemeToggle}
        onClose={onThemeClose}
        icon={<Palette className="h-4 w-4" />}
        label={themeLabelText}
        showLabel
      >
        <ThemeMenu lang={lang} current={theme} setTheme={(th) => onSetTheme(th as import('../contexts/ThemeContext').ThemeName)} />
      </DropButton>

      <MoreMenu showLabel />
    </div>
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

/* ─── Dropdown button wrapper ────────────────────────────────── */
function DropButton({
  open, onToggle, onClose, icon, label, children, showLabel = false,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  showLabel?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useDismissOnOutsideClick(rootRef, open, onClose);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
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
        <span className={showLabel ? 'inline truncate' : 'hidden sm:inline'}>{label}</span>
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
          <div className="absolute end-0 top-full z-50 min-w-[11rem] pt-2">
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-2xl border border-primary/20 bg-card/95 shadow-lg backdrop-blur-xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="h-0.5 w-full bg-gradient-to-r from-primary to-tertiary" />
              {children}
            </motion.div>
          </div>
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
            onMouseDown={(e) => {
              e.preventDefault();
              setLang(opt.id);
            }}
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
    <div className="p-1.5">
      <div className="flex flex-col gap-0.5">
        {THEMES.map((th, i) => {
          const active = current === th.name;
          return (
            <motion.button
              key={th.name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setTheme(th.name);
              }}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.14, delay: i * 0.03 }}
              className={[
                'relative flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-primary/12 text-primary'
                  : 'text-foreground/70 hover:bg-accent/70 hover:text-foreground',
              ].join(' ')}
            >
              <span className={['h-4 w-4 shrink-0 rounded-full ring-1 ring-border/30', th.swatch].join(' ')} />
              <span className="truncate text-start leading-none">
                {themeLabel(lang, th)}
              </span>
              {active && <Check className="ms-auto h-3 w-3 shrink-0 text-primary" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
