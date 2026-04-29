import {
  useState, useRef, useEffect, useId,
  useCallback, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: ReactNode;
  hint?: ReactNode;
  options: SelectOption[];
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

interface PanelPos {
  /** viewport-relative coords — used with position:fixed, no scrollY needed */
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  openUp: boolean;
}

export function Select({
  label,
  hint,
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  className,
  id,
  name,
  disabled,
}: SelectProps) {
  const uid = useId();
  const fieldId = id ?? name ?? uid;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);

  /* calculate portal position from trigger rect.
   * All values are viewport-relative (position:fixed).
   * No scrollY / scrollX offsets needed. */
  const calcPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r    = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const PANEL_H    = 260;
    // Prefer opening down; flip up only when below is tight and above has more room.
    const openUp = spaceBelow < PANEL_H && spaceAbove > spaceBelow;
    setPos({
      top:    openUp ? undefined : r.bottom + 6,
      bottom: openUp ? window.innerHeight - r.top + 6 : undefined,
      left:   r.left,
      width:  r.width,
      openUp,
    });
  }, []);

  function toggle() {
    if (disabled) return;
    if (!open) calcPos();
    setOpen((v) => !v);
  }

  /* recalc on scroll / resize while open */
  useEffect(() => {
    if (!open) return;
    const handler = () => calcPos();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, calcPos]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      const panel = document.getElementById(`select-panel-${fieldId}`);
      const trigger = triggerRef.current;
      if (
        panel && !panel.contains(e.target as Node) &&
        trigger && !trigger.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, fieldId]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  function pick(v: string) {
    onValueChange?.(v);
    setOpen(false);
  }

  const panel = pos && (
    <motion.div
      id={`select-panel-${fieldId}`}
      initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top:    pos.openUp ? undefined : pos.top,
        bottom: pos.openUp ? pos.bottom : undefined,
        left:   pos.left,
        width:  pos.width,
        zIndex: 9999,
        maxHeight: '16rem',
        overflowY: 'auto',
      }}
      className="overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl"
    >
      {/* gradient accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary to-tertiary" />
      <div className="p-1.5 space-y-0.5">
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1, delay: Math.min(i * 0.015, 0.2) }}
              whileHover={{ x: 2 }}
              className={[
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors text-start',
                active
                  ? 'bg-primary/12 text-primary'
                  : 'text-foreground/70 hover:bg-accent/70 hover:text-foreground',
              ].join(' ')}
            >
              <span className="truncate">{opt.label}</span>
              {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className={['relative', className ?? ''].join(' ')}>
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-xs font-semibold text-foreground/60"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <motion.button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        onClick={toggle}
        whileHover={disabled ? {} : { scale: 1.01 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        className={[
          'flex h-11 w-full items-center justify-between gap-2 rounded-2xl border px-4 text-sm font-semibold transition-colors',
          open
            ? 'border-primary/50 bg-primary/8 text-foreground'
            : 'border-border/60 bg-card/80 text-foreground hover:border-primary/30 hover:bg-accent/60',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={selected ? 'text-foreground' : 'text-foreground/40'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex shrink-0 text-foreground/50"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      {/* Portal panel — renders at body level, never clipped by overflow:hidden parents */}
      {createPortal(
        <AnimatePresence>{open && panel}</AnimatePresence>,
        document.body,
      )}

      {hint && (
        <span className="mt-1.5 block text-xs text-foreground/40">{hint}</span>
      )}
    </div>
  );
}
