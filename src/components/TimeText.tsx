import { format12h, format24h } from '../lib/time';
import { useAppSettings } from '../context/SettingsContext';

interface Props {
  value: number | null | undefined;
  withSeconds?: boolean;
  className?: string;
}

/**
 * Formatted clock-time output that respects the user's preferred format
 * (12h / 24h) and seconds visibility from settings.
 */
export function TimeText({ value, withSeconds, className }: Props) {
  const { settings } = useAppSettings();
  const useSeconds = withSeconds ?? settings.showSeconds;
  const text =
    settings.timeFormat === '24'
      ? format24h(value, useSeconds)
      : format12h(value, useSeconds);
  return <span className={['tabular-nums', className ?? ''].join(' ')}>{text}</span>;
}
