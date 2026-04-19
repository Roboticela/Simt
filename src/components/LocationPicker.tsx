import { useMemo, useState } from 'react';
import worldRaw from '../data/world_cities.json';
import pakRaw from '../data/pakistan_locations.json';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Tabs } from './ui/Tabs';
import type { LocationConfig } from '../lib/types';

interface RawCity {
  name: string;
  lat: number;
  lng: number;
  id?: number;
}

const WORLD: RawCity[] = (worldRaw as RawCity[]).slice().sort((a, b) => a.name.localeCompare(b.name));
const PAK: RawCity[] = (pakRaw as RawCity[]).slice().sort((a, b) => a.name.localeCompare(b.name));

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (loc: LocationConfig) => void;
  current: LocationConfig;
}

type TabId = 'world' | 'pakistan' | 'custom';

export function LocationPicker({ open, onClose, onSelect, current }: Props) {
  const [tab, setTab] = useState<TabId>('world');
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState({
    name: current.name,
    lat: String(current.lat),
    lng: String(current.lng),
    timezone: String(current.timezone),
  });

  const list = tab === 'world' ? WORLD : PAK;

  const filtered = useMemo(() => {
    if (!query.trim()) return list.slice(0, 200);
    const q = query.trim().toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 200);
  }, [list, query]);

  function pickCity(c: RawCity) {
    onSelect({
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      timezone: current.timezone,
    });
    onClose();
  }

  function applyCustom() {
    const lat = parseFloat(custom.lat);
    const lng = parseFloat(custom.lng);
    const tz = parseFloat(custom.timezone);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(tz)) return;
    onSelect({
      name: custom.name.trim() || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      lat,
      lng,
      timezone: tz,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Choose Location" size="md">
      <div className="space-y-4">
        <Tabs<TabId>
          fullWidth
          value={tab}
          onChange={setTab}
          items={[
            { id: 'world', label: 'World' },
            { id: 'pakistan', label: 'Pakistan' },
            { id: 'custom', label: 'Custom' },
          ]}
        />

        {tab !== 'custom' && (
          <>
            <Input
              type="search"
              placeholder="Search city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <ul className="max-h-[55vh] overflow-y-auto -mx-4 divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-slate-500">No matches.</li>
              )}
              {filtered.map((c) => (
                <li key={`${c.name}-${c.lat}-${c.lng}`}>
                  <button
                    type="button"
                    onClick={() => pickCity(c)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-3"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {c.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {c.lat.toFixed(2)}°, {c.lng.toFixed(2)}°
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'custom' && (
          <div className="space-y-3">
            <Input
              label="Place name"
              value={custom.name}
              onChange={(e) => setCustom({ ...custom, name: e.target.value })}
              placeholder="e.g. My Town"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitude (°N)"
                type="number"
                step="0.0001"
                value={custom.lat}
                onChange={(e) => setCustom({ ...custom, lat: e.target.value })}
              />
              <Input
                label="Longitude (°E)"
                type="number"
                step="0.0001"
                value={custom.lng}
                onChange={(e) => setCustom({ ...custom, lng: e.target.value })}
              />
            </div>
            <Input
              label="Timezone offset from UTC (hours)"
              type="number"
              step="0.5"
              value={custom.timezone}
              onChange={(e) => setCustom({ ...custom, timezone: e.target.value })}
              hint="e.g. Pakistan = 5, India = 5.5, GMT = 0"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={applyCustom}>Apply</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
