import { Select } from './ui/Select';
import { MONTH_NAMES_EN } from '../lib/constants';

interface Props {
  value: number; // 1..12
  onChange: (m: number) => void;
  label?: string;
}

const OPTIONS = MONTH_NAMES_EN.map((label, i) => ({ label, value: String(i + 1) }));

export function MonthSelector({ value, onChange, label = 'Month' }: Props) {
  return (
    <div className="max-w-xs">
      <Select
        label={label}
        options={OPTIONS}
        value={String(value)}
        onValueChange={(v) => onChange(parseInt(v, 10))}
      />
    </div>
  );
}
