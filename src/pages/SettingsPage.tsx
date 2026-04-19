import { LocationCard } from '../components/LocationCard';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { useAppSettings } from '../context/SettingsContext';
import { METHODS } from '../lib/types';
import { ThemeToggle } from '../components/ThemeToggle';

export function SettingsPage() {
  const { settings, update, reset } = useAppSettings();

  return (
    <div className="space-y-6">
      <LocationCard />

      <Card title="Calculation Method" subtitle="Astronomical depression angles for Fajr / Isha">
        <Select
          options={Object.values(METHODS).map((m) => ({ label: m.name, value: m.id }))}
          value={settings.methodId}
          onValueChange={(v) => update({ methodId: v })}
        />
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Source workbook uses the <strong>Karachi</strong> convention (Fajr 18°, Isha 18°).
        </p>
      </Card>

      <Card title="Asr School" subtitle="Hanafi uses 2× shadow rule; Shafi/Maliki/Hanbali use 1×">
        <Tabs<'1' | '2'>
          fullWidth
          value={String(settings.asrSchool) as '1' | '2'}
          onChange={(v) => update({ asrSchool: v === '2' ? 2 : 1 })}
          items={[
            { id: '1', label: 'Shafi (1×)' },
            { id: '2', label: 'Hanafi (2×)' },
          ]}
        />
      </Card>

      <Card title="Display" subtitle="Time format & seconds visibility">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Time format</p>
            <Tabs<'12' | '24'>
              value={settings.timeFormat}
              onChange={(v) => update({ timeFormat: v })}
              items={[
                { id: '12', label: '12h' },
                { id: '24', label: '24h' },
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Seconds</p>
            <Tabs<'on' | 'off'>
              value={settings.showSeconds ? 'on' : 'off'}
              onChange={(v) => update({ showSeconds: v === 'on' })}
              items={[
                { id: 'off', label: 'Hide' },
                { id: 'on', label: 'Show' },
              ]}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Theme</p>
            <ThemeToggle size="md" />
          </div>
        </div>
      </Card>

      <Card title="Reset" subtitle="Restore all settings to defaults (Mardan, Karachi, Hanafi)">
        <Button variant="danger" onClick={reset}>
          Reset to defaults
        </Button>
      </Card>
    </div>
  );
}
