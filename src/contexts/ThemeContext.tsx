import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

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
  swatch: string;
  isDark: boolean;
}

export const THEMES: ThemeMeta[] = [
  { name: 'light',    label: 'Light',        labelAr: 'فاتح',        labelUr: 'روشن',       swatch: 'bg-sky-300',    isDark: false },
  { name: 'dark',     label: 'Dark',         labelAr: 'داكن',        labelUr: 'گہرا',       swatch: 'bg-sky-400',    isDark: true  },
  { name: 'navy',     label: 'Navy',         labelAr: 'كحلي',        labelUr: 'نیوی',       swatch: 'bg-blue-900',   isDark: true  },
  { name: 'sunset',   label: 'Sunset',       labelAr: 'غروب',        labelUr: 'غروب',       swatch: 'bg-orange-600', isDark: true  },
  { name: 'ocean',    label: 'Ocean',        labelAr: 'محيطي',       labelUr: 'سمندر',      swatch: 'bg-cyan-600',   isDark: true  },
  { name: 'forest',   label: 'Forest',       labelAr: 'غابة',        labelUr: 'جنگل',       swatch: 'bg-green-800',  isDark: true  },
  { name: 'purple',   label: 'Purple Dream', labelAr: 'حلم أرجواني', labelUr: 'بنفشی خواب', swatch: 'bg-purple-700', isDark: true  },
  { name: 'midnight', label: 'Midnight',     labelAr: 'منتصف الليل', labelUr: 'آدھی رات',   swatch: 'bg-indigo-900', isDark: true  },
];

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
