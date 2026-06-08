import { useEffect, useMemo, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, MapPin, Search } from 'lucide-react';
import { City, Country, State } from 'country-state-city';
import type { ICity, ICountry, IState } from 'country-state-city';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { LoadingOverlay } from './ui/Loader';
import { WorldLocationMap, type MapFocus } from './WorldLocationMap';
import type { LocationConfig } from '../lib/types';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import { searchPlaces, type GeocodeResult } from '../lib/geocode';

const MAX_ITEMS = 200;

const ALL_COUNTRIES = Country.getAllCountries().sort((a, b) =>
  a.name.localeCompare(b.name),
);

const WORLD_FOCUS: MapFocus = { lng: 20, lat: 24, zoom: 1.4 };

type Step = 'country' | 'state' | 'city' | 'place';

interface Props {
  onSelect: (loc: LocationConfig) => void;
  onClose: () => void;
}

function filterByName<T extends { name: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  const list = q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items;
  return list.slice(0, MAX_ITEMS);
}

function parseCoord(value: string | null | undefined, fallback: number): number {
  const n = parseFloat(value ?? '');
  return Number.isFinite(n) ? n : fallback;
}

function resolveTimezone(country: ICountry, lng: number): number {
  const offsetSec = country.timezones?.[0]?.gmtOffset;
  if (offsetSec != null) return offsetSec / 3600;
  return Math.round(lng / 15);
}

function cityCenterCoords(
  city: ICity,
  state: IState | null,
  country: ICountry,
): { lat: number; lng: number } {
  return {
    lat: parseCoord(city.latitude, parseCoord(state?.latitude, parseCoord(country.latitude, 0))),
    lng: parseCoord(city.longitude, parseCoord(state?.longitude, parseCoord(country.longitude, 0))),
  };
}

function regionFocus(
  lat: string | null | undefined,
  lng: string | null | undefined,
  fallback: MapFocus,
  zoom: number,
): MapFocus {
  const la = parseCoord(lat, fallback.lat);
  const ln = parseCoord(lng, fallback.lng);
  return { lat: la, lng: ln, zoom };
}

const STEPS: Step[] = ['country', 'state', 'city', 'place'];

export function WorldLocationPicker({ onSelect, onClose }: Props) {
  const { lang } = useLang();
  const [step, setStep] = useState<Step>('country');
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<ICountry | null>(null);
  const [state, setState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [cityCenter, setCityCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState(false);
  const [selectedPlaceLabel, setSelectedPlaceLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (step !== 'place') return;

    const q = query.trim();
    if (q.length < 2) {
      setPlaceResults([]);
      setPlaceSearching(false);
      setPlaceSearchError(false);
      return;
    }

    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      setPlaceSearching(true);
      setPlaceSearchError(false);
      searchPlaces(q, ac.signal)
        .then((results) => {
          if (!ac.signal.aborted) setPlaceResults(results);
        })
        .catch(() => {
          if (!ac.signal.aborted) {
            setPlaceResults([]);
            setPlaceSearchError(true);
          }
        })
        .finally(() => {
          if (!ac.signal.aborted) setPlaceSearching(false);
        });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [step, query]);

  const states = useMemo(() => {
    if (!country) return [];
    return State.getStatesOfCountry(country.isoCode).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [country]);

  const hasStates = states.length > 0;

  const cities = useMemo(() => {
    if (!country) return [];
    if (hasStates) {
      if (!state) return [];
      return City.getCitiesOfState(country.isoCode, state.isoCode);
    }
    return City.getCitiesOfCountry(country.isoCode) ?? [];
  }, [country, state, hasStates]);

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
    [cities],
  );

  const countryFocus = useMemo((): MapFocus => {
    if (!country) return WORLD_FOCUS;
    return regionFocus(country.latitude, country.longitude, WORLD_FOCUS, 4.5);
  }, [country]);

  const stateFocus = useMemo((): MapFocus => {
    if (state) {
      return regionFocus(state.latitude, state.longitude, countryFocus, 6.5);
    }
    return countryFocus;
  }, [state, countryFocus]);

  const mapFocus = useMemo((): MapFocus => {
    if (step === 'place' && pin) return { lat: pin.lat, lng: pin.lng, zoom: 14 };
    if ((step === 'place' || selectedCity) && cityCenter) {
      return { lat: cityCenter.lat, lng: cityCenter.lng, zoom: step === 'place' ? 12.5 : 10 };
    }
    if (step === 'city' || step === 'place') return stateFocus;
    if (step === 'state') return stateFocus;
    if (country) return countryFocus;
    return WORLD_FOCUS;
  }, [step, pin, cityCenter, selectedCity, stateFocus, countryFocus]);

  const visibleSteps = useMemo(() => {
    const s: Step[] = ['country'];
    if (country && hasStates) s.push('state');
    if (country) s.push('city');
    if (selectedCity) s.push('place');
    return s;
  }, [country, hasStates, selectedCity]);

  const stepTitle =
    step === 'country'
      ? t(lang, 'selectCountry')
      : step === 'state'
        ? t(lang, 'selectProvince')
        : step === 'city'
          ? t(lang, 'selectCity')
          : t(lang, 'selectLocation');

  function applyLocation(lat: number, lng: number, placeName: string) {
    if (!country || !selectedCity) return;
    const timezone = resolveTimezone(country, lng);
    const parts = [placeName, selectedCity.name, state?.name, country.name].filter(Boolean);
    onSelect({ name: parts.join(', '), lat, lng, timezone });
    onClose();
  }

  function confirmPin() {
    if (!pin || !selectedCity) return;
    const label =
      selectedPlaceLabel ?? `${pin.lat.toFixed(4)}°, ${pin.lng.toFixed(4)}°`;
    applyLocation(pin.lat, pin.lng, label);
  }

  function selectPlaceResult(result: GeocodeResult) {
    setPin({ lat: result.lat, lng: result.lng });
    setSelectedPlaceLabel(result.displayName);
  }

  function handlePinChange(lat: number, lng: number) {
    setPin({ lat, lng });
    setSelectedPlaceLabel(null);
  }

  function useCityCenter() {
    if (!cityCenter || !selectedCity) return;
    applyLocation(cityCenter.lat, cityCenter.lng, selectedCity.name);
  }

  function selectCountry(c: ICountry) {
    setQuery('');
    startTransition(() => {
      setCountry(c);
      setState(null);
      setSelectedCity(null);
      setCityCenter(null);
      setPin(null);
      const nextStates = State.getStatesOfCountry(c.isoCode);
      setStep(nextStates.length > 0 ? 'state' : 'city');
    });
  }

  function selectState(s: IState) {
    setQuery('');
    startTransition(() => {
      setState(s);
      setSelectedCity(null);
      setCityCenter(null);
      setPin(null);
      setStep('city');
    });
  }

  function selectCity(city: ICity) {
    if (!country) return;
    const center = cityCenterCoords(city, state, country);
    setQuery('');
    setSelectedCity(city);
    setCityCenter(center);
    setPin(center);
    setSelectedPlaceLabel(null);
    setPlaceResults([]);
    setPlaceSearchError(false);
    startTransition(() => setStep('place'));
  }

  function goBack() {
    setQuery('');
    startTransition(() => {
      if (step === 'place') {
        setPin(null);
        setSelectedCity(null);
        setCityCenter(null);
        setSelectedPlaceLabel(null);
        setPlaceResults([]);
        setPlaceSearchError(false);
        setStep('city');
      } else if (step === 'city') {
        if (hasStates) {
          setState(null);
          setStep('state');
        } else {
          setCountry(null);
          setStep('country');
        }
      } else if (step === 'state') {
        setCountry(null);
        setState(null);
        setStep('country');
      }
    });
  }

  const list =
    step === 'country'
      ? filterByName(ALL_COUNTRIES, query)
      : step === 'state'
        ? filterByName(states, query)
        : filterByName(sortedCities, query);

  return (
    <div className="flex flex-col">
      <div className="relative h-48 shrink-0 border-b border-border/50 sm:h-56">
        <WorldLocationMap
          focus={mapFocus}
          pin={pin}
          pickOnMap={step === 'place'}
          onPinChange={handlePinChange}
          pickHint={t(lang, 'mapPickHint')}
        />
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-1">
          {STEPS.map((s) => {
            const idx = visibleSteps.indexOf(s);
            if (idx === -1) return null;
            const active = step === s;
            const done = visibleSteps.indexOf(step) > idx;
            return (
              <div
                key={s}
                className={[
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  active ? 'bg-primary' : done ? 'bg-primary/40' : 'bg-border/60',
                ].join(' ')}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {step !== 'country' && (
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-accent/40 text-foreground/70 transition-colors hover:bg-accent/70"
              aria-label={t(lang, 'back')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              {stepTitle}
            </p>
            <p className="truncate text-sm font-medium text-foreground/80">
              {[country?.name, state?.name, selectedCity?.name].filter(Boolean).join(' · ') ||
                t(lang, 'world')}
            </p>
          </div>
        </div>

        <Input
          type="search"
          placeholder={
            step === 'place' ? t(lang, 'searchPlace') : t(lang, 'searchLocation')
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          trailing={<Search className="h-4 w-4" />}
          autoFocus
        />

        {step === 'place' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="relative min-h-[8rem]">
              <AnimatePresence>
                {placeSearching && (
                  <LoadingOverlay key="place-search" label={t(lang, 'searchingPlaces')} />
                )}
              </AnimatePresence>
              {query.trim().length < 2 ? (
                <p className="px-1 py-2 text-sm text-foreground/50">
                  {t(lang, 'searchPlaceHint')}
                </p>
              ) : placeSearchError ? (
                <p className="px-1 py-2 text-sm text-destructive/80">{t(lang, 'searchFailed')}</p>
              ) : (
                <ul
                  className={[
                    'max-h-[22vh] divide-y divide-border/40 overflow-y-auto custom-scrollbar rounded-2xl border border-border/40',
                    placeSearching ? 'pointer-events-none opacity-40' : '',
                  ].join(' ')}
                >
                  {placeResults.length === 0 && !placeSearching ? (
                    <li className="px-4 py-4 text-sm text-foreground/50">{t(lang, 'noMatches')}</li>
                  ) : (
                    placeResults.map((result) => (
                      <li key={result.placeId}>
                        <button
                          type="button"
                          onClick={() => selectPlaceResult(result)}
                          className={[
                            'flex w-full flex-col gap-0.5 px-4 py-3 text-start transition-colors hover:bg-accent/50',
                            selectedPlaceLabel === result.displayName ? 'bg-primary/10' : '',
                          ].join(' ')}
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">{result.name}</span>
                          </span>
                          <span className="ps-6 line-clamp-2 text-xs text-foreground/50">
                            {result.displayName}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-border/50 bg-accent/25 p-4">
              <p className="text-sm text-foreground/70">{t(lang, 'pickOnMap')}</p>
              {selectedPlaceLabel ? (
                <p className="line-clamp-2 text-xs text-foreground/60">{selectedPlaceLabel}</p>
              ) : pin ? (
                <p className="font-mono text-xs tabular-nums text-foreground/50">
                  {pin.lat.toFixed(5)}°N · {pin.lng.toFixed(5)}°E
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" block onClick={useCityCenter}>
                  {t(lang, 'useCityCenter')}
                </Button>
                <Button
                  block
                  onClick={confirmPin}
                  disabled={!pin}
                  leading={<Check className="h-4 w-4" />}
                >
                  {t(lang, 'confirmPlace')}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="relative min-h-[10rem]">
            <AnimatePresence>
              {isPending && (
                <LoadingOverlay key="step-loading" label={t(lang, 'loading')} />
              )}
            </AnimatePresence>
            <ul
              className={[
                'max-h-[28vh] divide-y divide-border/40 overflow-y-auto custom-scrollbar rounded-2xl border border-border/40',
                isPending ? 'pointer-events-none opacity-40' : '',
              ].join(' ')}
            >
              {list.length === 0 ? (
                <li className="px-4 py-4 text-sm text-foreground/50">{t(lang, 'noMatches')}</li>
              ) : (
                list.map((entry) => {
                  const key =
                    step === 'country'
                      ? (entry as ICountry).isoCode
                      : step === 'state'
                        ? `${(entry as IState).countryCode}-${(entry as IState).isoCode}`
                        : `${(entry as ICity).countryCode}-${(entry as ICity).stateCode}-${entry.name}`;

                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => {
                          if (step === 'country') selectCountry(entry as ICountry);
                          else if (step === 'state') selectState(entry as IState);
                          else selectCity(entry as ICity);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/50"
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="flex-1 truncate text-start font-semibold">
                          {entry.name}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
