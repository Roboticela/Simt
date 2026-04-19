import type { ReactNode } from 'react';
import { Header } from './Header';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-500 dark:text-slate-400">
        Built from Qiblatime workbook · accuracy ±50–60 km from city centre
      </footer>
    </div>
  );
}
