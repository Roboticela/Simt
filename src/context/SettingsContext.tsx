import { createContext, useContext, type ReactNode } from 'react';
import { useSettings } from '../hooks/useSettings';

type SettingsContextValue = ReturnType<typeof useSettings>;

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const value = useSettings();
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAppSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used inside <SettingsProvider>');
  return ctx;
}
