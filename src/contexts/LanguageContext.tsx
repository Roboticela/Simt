import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '../lib/i18n';

const STORAGE_KEY = 'simt.lang';
const RTL_LANGS: Lang[] = ['ar', 'ur'];

function readSaved(): Lang {
  if (typeof window === 'undefined') return 'en';
  const v = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (v === 'en' || v === 'ar' || v === 'ur') return v;
  return 'en';
}

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  isRtl: boolean;
}

const LangContext = createContext<LangCtxValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readSaved());

  useEffect(() => {
    const isRtl = RTL_LANGS.includes(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  };

  return (
    <LangContext.Provider value={{ lang, setLang, isRtl: RTL_LANGS.includes(lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangCtxValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be inside <LanguageProvider>');
  return ctx;
}
