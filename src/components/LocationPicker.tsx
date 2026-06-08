import { lazy, Suspense, useMemo, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import pakRaw from '../data/pakistan_locations.json';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Tabs } from './ui/Tabs';
import { LoadingPanel } from './ui/Loader';
import type { LocationConfig } from '../lib/types';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

const WorldLocationPicker = lazy(() =>
  import('./WorldLocationPicker').then((m) => ({ default: m.WorldLocationPicker })),
);

interface RawCity {
  name: string;
  lat: number;
  lng: number;
  id?: number;
}

const PAK: RawCity[] = (pakRaw as RawCity[]).slice().sort((a, b) => a.name.localeCompare(b.name));

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (loc: LocationConfig) => void;
  current: LocationConfig;
}

type TabId = 'world' | 'pakistan' | 'custom';

export function LocationPicker({ open, onClose, onSelect, current }: Props) {
  const { lang } = useLang();
  const [tab, setTab] = useState<TabId>('pakistan');
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState({
    name: current.name,
    lat: String(current.lat),
    lng: String(current.lng),
    timezone: String(current.timezone),
  });

  const filteredPak = useMemo(() => {
    if (!query.trim()) return PAK.slice(0, 200);
    const q = query.trim().toLowerCase();
    return PAK.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 200);
  }, [query]);

  function pickPakCity(c: RawCity) {
    onSelect({ name: c.name, lat: c.lat, lng: c.lng, timezone: 5 });
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
    <Modal
      open={open}
      onClose={onClose}
      title={t(lang, 'chooseLocation')}
      size={tab === 'world' ? 'xl' : 'md'}
      flushBody={tab === 'world'}
    >
      <div className="space-y-4">
        <Tabs<TabId>
          fullWidth
          value={tab}
          onChange={setTab}
          items={[
            { id: 'world', label: t(lang, 'world') },
            { id: 'pakistan', label: t(lang, 'pakistan') },
            { id: 'custom', label: t(lang, 'custom') },
          ]}
        />

        {tab === 'world' && (
          <Suspense
            fallback={
              <LoadingPanel
                label={t(lang, 'loadingLocations')}
                sublabel={t(lang, 'loading')}
              />
            }
          >
            <WorldLocationPicker key={open ? 'open' : 'closed'} onSelect={onSelect} onClose={onClose} />
          </Suspense>
        )}

        {tab === 'pakistan' && (
          <>
            <Input
              type="search"
              placeholder={t(lang, 'searchCity')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              trailing={<Search className="h-4 w-4" />}
              autoFocus
            />
            <ul className="-mx-5 max-h-[55vh] divide-y divide-border/40 overflow-y-auto custom-scrollbar">
              {filteredPak.length === 0 && (
                <li className="px-5 py-4 text-sm text-foreground/50">{t(lang, 'noMatches')}</li>
              )}
              {filteredPak.map((c) => (
                <li key={`${c.name}-${c.lat}-${c.lng}`}>
                  <button
                    type="button"
                    onClick={() => pickPakCity(c)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3 text-sm transition-colors hover:bg-accent/50"
                  >
                    <span className="flex items-center gap-2.5 font-semibold text-foreground truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {c.name}
                    </span>
                    <span className="shrink-0 text-xs text-foreground/40 tabular-nums">
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
              label={t(lang, 'placeName')}
              value={custom.name}
              onChange={(e) => setCustom({ ...custom, name: e.target.value })}
              placeholder="e.g. My Town"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t(lang, 'latitude')}
                type="number"
                step="0.0001"
                value={custom.lat}
                onChange={(e) => setCustom({ ...custom, lat: e.target.value })}
              />
              <Input
                label={t(lang, 'longitude')}
                type="number"
                step="0.0001"
                value={custom.lng}
                onChange={(e) => setCustom({ ...custom, lng: e.target.value })}
              />
            </div>
            <Input
              label={t(lang, 'timezone')}
              type="number"
              step="0.5"
              value={custom.timezone}
              onChange={(e) => setCustom({ ...custom, timezone: e.target.value })}
              hint={t(lang, 'timezoneHint')}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>
                {t(lang, 'cancel')}
              </Button>
              <Button onClick={applyCustom}>{t(lang, 'apply')}</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
