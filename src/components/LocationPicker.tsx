import { useMemo, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import worldRaw from '../data/world_cities.json';
import pakRaw from '../data/pakistan_locations.json';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Tabs } from './ui/Tabs';
import type { LocationConfig } from '../lib/types';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

interface RawCity { name: string; lat: number; lng: number; id?: number; }

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
  const { lang } = useLang();
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
    // Pakistan locations are always UTC+5 (PKT).
    // For world cities the data carries no timezone field, so we derive the
    // nearest whole-hour UTC offset from longitude (±15° per hour).
    // This is accurate for most standard-offset zones; users can fine-tune
    // via the Custom tab for half-hour / quarter-hour zones (e.g. India UTC+5:30).
    const timezone = tab === 'pakistan' ? 5 : Math.round(c.lng / 15);
    onSelect({ name: c.name, lat: c.lat, lng: c.lng, timezone });
    onClose();
  }

  function applyCustom() {
    const lat = parseFloat(custom.lat);
    const lng = parseFloat(custom.lng);
    const tz = parseFloat(custom.timezone);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(tz)) return;
    onSelect({
      name: custom.name.trim() || `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      lat, lng, timezone: tz,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t(lang, 'chooseLocation')} size="md">
      <div className="space-y-4">
        <Tabs<TabId>
          fullWidth
          value={tab}
          onChange={setTab}
          items={[
            { id: 'world',    label: t(lang, 'world') },
            { id: 'pakistan', label: t(lang, 'pakistan') },
            { id: 'custom',   label: t(lang, 'custom') },
          ]}
        />

        {tab !== 'custom' && (
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
              {filtered.length === 0 && (
                <li className="px-5 py-4 text-sm text-foreground/50">{t(lang, 'noMatches')}</li>
              )}
              {filtered.map((c) => (
                <li key={`${c.name}-${c.lat}-${c.lng}`}>
                  <button
                    type="button"
                    onClick={() => pickCity(c)}
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
            <Input label={t(lang, 'placeName')} value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="e.g. My Town" />
            <div className="grid grid-cols-2 gap-3">
              <Input label={t(lang, 'latitude')} type="number" step="0.0001" value={custom.lat} onChange={(e) => setCustom({ ...custom, lat: e.target.value })} />
              <Input label={t(lang, 'longitude')} type="number" step="0.0001" value={custom.lng} onChange={(e) => setCustom({ ...custom, lng: e.target.value })} />
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
              <Button variant="ghost" onClick={onClose}>{t(lang, 'cancel')}</Button>
              <Button onClick={applyCustom}>{t(lang, 'apply')}</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
