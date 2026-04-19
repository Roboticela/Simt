import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAppSettings } from '../context/SettingsContext';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Today', end: true },
  { to: '/prayer-calendar', label: 'Prayer Calendar' },
  { to: '/qibla-shadow', label: 'Qibla Shadow' },
  { to: '/qibla', label: 'Qibla' },
  { to: '/settings', label: 'Settings' },
];

export function Header() {
  const { settings } = useAppSettings();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white inline-flex items-center justify-center font-bold">
              Q
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
                Qiblatime
              </h1>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {settings.location.name}
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>

        <nav className="-mx-1 flex items-center gap-1 overflow-x-auto pb-2 md:pb-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'inline-flex h-8 items-center rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 md:hidden">
        <div className="mx-auto max-w-6xl px-4 py-2 flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
