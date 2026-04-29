/**
 * Thin compatibility shim — the real theme logic lives in contexts/ThemeContext.tsx.
 * Kept so any remaining imports of useTheme don't break during migration.
 */
export type { ThemeName as Theme } from '../contexts/ThemeContext';
export { useThemeCtx as useTheme } from '../contexts/ThemeContext';
