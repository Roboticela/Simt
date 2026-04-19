import { useMemo } from 'react';
import { Select } from './ui/Select';

interface Props {
  value: number;
  onChange: (y: number) => void;
  label?: string;
  /** Range of years to show, inclusive. Defaults to ±10 around current year. */
  range?: { from: number; to: number };
}

export function YearSelector({ value, onChange, label = 'Year', range }: Props) {
  const options = useMemo(() => {
    const now = new Date().getFullYear();
    const from = range?.from ?? now - 10;
    const to = range?.to ?? now + 10;
    const out: { label: string; value: string }[] = [];
    for (let y = from; y <= to; y++) {
      out.push({ label: String(y), value: String(y) });
    }
    return out;
  }, [range]);

  return (
    <div className="max-w-[8rem]">
      <Select
        label={label}
        options={options}
        value={String(value)}
        onValueChange={(v) => onChange(parseInt(v, 10))}
      />
    </div>
  );
}
