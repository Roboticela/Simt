import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

interface Props {
  value: number;
  onChange: (y: number) => void;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export function YearSelector({ value, onChange }: Props) {
  const { lang } = useLang();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(String(value));
    setEditing(true);
    // focus after state update
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= MIN_YEAR && n <= MAX_YEAR) {
      onChange(n);
    }
    setEditing(false);
  }

  function step(delta: number) {
    const next = value + delta;
    if (next >= MIN_YEAR && next <= MAX_YEAR) onChange(next);
  }

  return (
    <div className="w-full sm:w-auto">
      <p className="mb-1.5 block text-xs font-semibold text-foreground/60">Year</p>

      <div className="flex h-11 items-center gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card/80">
        {/* Prev year */}
        <motion.button
          type="button"
          onClick={() => step(-1)}
          whileHover={{ backgroundColor: 'var(--color-accent)' }}
          whileTap={{ scale: 0.92 }}
          disabled={value <= MIN_YEAR}
          className="flex h-full w-10 shrink-0 items-center justify-center text-foreground/50 transition-colors hover:text-primary disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        {/* Divider */}
        <div className="h-5 w-px bg-border/50" />

        {/* Year display / input */}
        <div className="relative flex flex-1 items-center justify-center">
          {editing ? (
            <input
              ref={inputRef}
              type="number"
              value={draft}
              min={MIN_YEAR}
              max={MAX_YEAR}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={(e) => commit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(draft);
                if (e.key === 'Escape') setEditing(false);
              }}
              className="w-full bg-transparent text-center text-sm font-black tabular-nums text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          ) : (
            <motion.button
              type="button"
              onClick={startEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={t(lang, 'clickToTypeYear')}
              className="group flex items-center gap-1.5 px-2 text-sm font-black tabular-nums text-foreground hover:text-primary transition-colors"
            >
              {value}
              <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.button>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border/50" />

        {/* Next year */}
        <motion.button
          type="button"
          onClick={() => step(1)}
          whileHover={{ backgroundColor: 'var(--color-accent)' }}
          whileTap={{ scale: 0.92 }}
          disabled={value >= MAX_YEAR}
          className="flex h-full w-10 shrink-0 items-center justify-center text-foreground/50 transition-colors hover:text-primary disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
