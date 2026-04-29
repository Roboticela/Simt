import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Globe2 } from 'lucide-react';
import { Button } from './ui/Button';
import { LocationPicker } from './LocationPicker';
import { useAppSettings } from '../context/SettingsContext';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

export function LocationCard() {
  const { settings, setLocation } = useAppSettings();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const { location } = settings;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="relative overflow-hidden rounded-3xl bg-primary p-5">
          {/* Decorative blob */}
          <div
            aria-hidden
            className="absolute -end-10 -top-10 h-48 w-48 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="absolute -bottom-8 start-20 h-32 w-32 rounded-full bg-white/5"
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Globe2 className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {t(lang, 'currentLocation')}
                </p>
                <p className="mt-0.5 truncate text-2xl font-black tracking-tight text-white">
                  {location.name}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/65">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {location.lat.toFixed(4)}° N · {location.lng.toFixed(4)}° E · UTC
                  {location.timezone >= 0 ? '+' : ''}{location.timezone}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-white/25 bg-white/15 text-white hover:bg-white/25 shrink-0"
              trailing={<ChevronRight className="h-4 w-4 opacity-70" />}
              onClick={() => setOpen(true)}
            >
              {t(lang, 'changeLocation')}
            </Button>
          </div>
        </div>
      </motion.div>

      <LocationPicker
        open={open}
        onClose={() => setOpen(false)}
        current={location}
        onSelect={(loc) => setLocation(loc)}
      />
    </>
  );
}
