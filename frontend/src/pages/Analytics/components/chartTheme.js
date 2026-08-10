/**
 * Shared Recharts theme — centralized colors and axis styling so all analytics
 * charts stay consistent (dark-mode aware via CSS variables where possible).
 */

export const CHART_COLORS = {
  primary: '#2970ff',
  primaryLight: '#528bff',
  success: '#12b76a',
  warning: '#f79009',
  danger: '#f04438',
  info: '#0ea5e9',
  secondary: '#98a2b3',
};

/** Damage type pie palette. */
export const DAMAGE_TYPE_PALETTE = [
  '#2970ff',
  '#12b76a',
  '#f79009',
  '#f04438',
  '#7a5af8',
];

/** Severity bar palette (Low → Critical). */
export const SEVERITY_PALETTE = [
  '#12b76a',
  '#f79009',
  '#f97066',
  '#d92d20',
];

/** Tooltip content style. */
export const TOOLTIP_STYLE = {
  borderRadius: '0.625rem',
  border: '1px solid #e4e7ec',
  background: '#ffffff',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  fontSize: '0.75rem',
  padding: '0.5rem 0.75rem',
};

/** Common cartesian axis stroke. */
export const AXIS_STROKE = '#d0d5dd';

/** Common grid stroke. */
export const GRID_STROKE = '#e4e7ec';

