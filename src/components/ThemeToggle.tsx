/**
 * Thin shim kept for backward-compat in SettingsPage.
 * The real theme picker lives in Header.tsx via ThemeContext.
 */
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useThemeCtx, THEMES, themeLabel } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeCtx();
  const { lang } = useLang();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {THEMES.map((th, i) => (
        <motion.button
          key={th.name}
          type="button"
          onClick={() => setTheme(th.name)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15, delay: i * 0.03 }}
          className={[
            'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all',
            theme === th.name
              ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
              : 'bg-accent/40 text-foreground/60 hover:bg-accent hover:text-foreground',
          ].join(' ')}
        >
          <span className={['h-4 w-4 shrink-0 rounded-full', th.swatch].join(' ')} />
          <span className="truncate">
            {themeLabel(lang, th)}
          </span>
          {theme === th.name && <Check className="ms-auto h-3 w-3 shrink-0 text-primary" />}
        </motion.button>
      ))}
    </div>
  );
}
