import { Select } from './ui/Select';
import { useLang } from '../contexts/LanguageContext';
import { monthLabel, t } from '../lib/i18n';

interface Props { value: number; onChange: (m: number) => void; }

export function MonthSelector({ value, onChange }: Props) {
  const { lang } = useLang();
  const options = Array.from({ length: 12 }, (_, i) => ({
    label: monthLabel(lang, i),
    value: String(i + 1),
  }));

  return (
    <div className="w-full sm:w-44">
      <Select
        label={t(lang, 'calendar')}
        options={options}
        value={String(value)}
        onValueChange={(v) => onChange(parseInt(v, 10))}
      />
    </div>
  );
}
