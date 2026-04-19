import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'qiblatime.theme';

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'system';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
}

export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
} {
  const [theme, setThemeState] = useState<Theme>(() => readInitial());
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(document.documentElement.classList.contains('dark'));
    const handler = () => {
      if (theme === 'system') {
        applyTheme('system');
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore localStorage errors (private mode etc.)
    }
  };

  return { theme, setTheme, isDark };
}
