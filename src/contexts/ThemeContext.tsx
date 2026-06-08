import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '../lib/i18n';

export type ThemeName =
  | 'light'
  | 'dark'
  | 'navy'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'purple'
  | 'midnight';

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  labelAr: string;
  labelUr: string;
  labelHi: string;
  swatch: string;
  isDark: boolean;
}

export const THEMES: ThemeMeta[] = [
  { name: 'light',    label: 'Light',        labelAr: 'فاتح',        labelUr: 'روشن',       labelHi: 'हल्का',         swatch: 'bg-white',      isDark: false },
  { name: 'dark',     label: 'Dark',         labelAr: 'داكن',        labelUr: 'گہرا',       labelHi: 'गहरा',          swatch: 'bg-black',      isDark: true  },
  { name: 'navy',     label: 'Navy',         labelAr: 'كحلي',        labelUr: 'نیوی',       labelHi: 'नेवी',          swatch: 'bg-blue-900',   isDark: true  },
  { name: 'sunset',   label: 'Sunset',       labelAr: 'غروب',        labelUr: 'غروب',       labelHi: 'सूर्यास्त',     swatch: 'bg-orange-600', isDark: true  },
  { name: 'ocean',    label: 'Ocean',        labelAr: 'محيطي',       labelUr: 'سمندر',      labelHi: 'समुद्र',        swatch: 'bg-cyan-600',   isDark: true  },
  { name: 'forest',   label: 'Forest',       labelAr: 'غابة',        labelUr: 'جنگل',       labelHi: 'वन',            swatch: 'bg-green-800',  isDark: true  },
  { name: 'purple',   label: 'Purple Dream', labelAr: 'حلم أرجواني', labelUr: 'بنفشی خواب', labelHi: 'बैंगनी सपना',   swatch: 'bg-purple-700', isDark: true  },
  { name: 'midnight', label: 'Midnight',     labelAr: 'منتصف الليل', labelUr: 'آدھی رات',   labelHi: 'आधी रात',       swatch: 'bg-indigo-900', isDark: true  },
];

export function themeLabel(lang: Lang, th: ThemeMeta): string {
  if (lang === 'ar') return th.labelAr;
  if (lang === 'ur') return th.labelUr;
  if (lang === 'hi') return th.labelHi;
  return th.label;
}

const STORAGE_KEY = 'simt.theme.v2';

function readSaved(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  const v = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return THEMES.find((t) => t.name === v) ? (v as ThemeName) : 'light';
}

function applyTheme(name: ThemeName) {
  const root = document.documentElement;
  root.dataset.theme = name;
  const meta = THEMES.find((t) => t.name === name)!;
  root.classList.toggle('dark', meta.isDark);
}

interface ThemeCtxValue {
  theme: ThemeName;
  meta: ThemeMeta;
  setTheme: (t: ThemeName) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeCtxValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => readSaved());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  };

  const meta = THEMES.find((t) => t.name === theme)!;

  return (
    <ThemeContext.Provider value={{ theme, meta, setTheme, isDark: meta.isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeCtx(): ThemeCtxValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeCtx must be inside <ThemeProvider>');
  return ctx;
}
