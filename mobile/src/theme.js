/**
 * Light & dark theme palettes — clean, high-contrast smart-city style.
 * Consumed via useTheme() from context/ThemeContext.
 */

export const lightTheme = {
    mode: 'light',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#cbd5e1',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    placeholder: '#94a3b8',
    primary: '#2563eb',
    primaryContrast: '#ffffff',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
    shadow: 'rgba(15, 23, 42, 0.08)',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    tabBar: '#ffffff',
    tabBarBorder: '#e2e8f0',
};

export const darkTheme = {
    mode: 'dark',
    background: '#0b1120',
    surface: '#131d31',
    surfaceAlt: '#1e293b',
    border: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    placeholder: '#94a3b8',
    primary: '#3b82f6',
    primaryContrast: '#ffffff',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#38bdf8',
    shadow: 'rgba(0, 0, 0, 0.5)',
    inputBg: '#172239',
    inputBorder: '#3b4b68',
    tabBar: '#0f172a',
    tabBarBorder: '#1e293b',
};