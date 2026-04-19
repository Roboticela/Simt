import { useTheme, type Theme } from '../hooks/useTheme';
import { Tabs } from './ui/Tabs';

export function ThemeToggle({ size = 'sm' as 'sm' | 'md' }) {
  const { theme, setTheme } = useTheme();
  return (
    <Tabs<Theme>
      size={size}
      value={theme}
      onChange={setTheme}
      items={[
        { id: 'light', label: 'Light' },
        { id: 'dark', label: 'Dark' },
        { id: 'system', label: 'Auto' },
      ]}
    />
  );
}
