import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { LocationPicker } from './LocationPicker';
import { useAppSettings } from '../context/SettingsContext';

export function LocationCard() {
  const { settings, setLocation } = useAppSettings();
  const [open, setOpen] = useState(false);
  const { location } = settings;

  return (
    <Card padded={false}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Location
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {location.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {location.lat.toFixed(4)}° N · {location.lng.toFixed(4)}° E · UTC
            {location.timezone >= 0 ? '+' : ''}
            {location.timezone}
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Change Location
        </Button>
      </div>
      <LocationPicker
        open={open}
        onClose={() => setOpen(false)}
        current={location}
        onSelect={(loc) => setLocation(loc)}
      />
    </Card>
  );
}
