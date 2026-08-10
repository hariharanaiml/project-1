import { useCallback, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { useTheme } from '../../../context/ThemeProvider';

/** Map theme option value to an icon. */
const THEME_ICONS = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

/**
 * ThemeSettings - Dark / Light / System appearance selection.
 * Wire into the active ThemeProvider so the selection actually toggles the theme.
 *
 * @param {Object} props
 * @param {Array<{value: string, label: string, description: string}>} props.options - Theme options
 */
export default function ThemeSettings({ options }) {
  const { theme, toggleTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleSelect = useCallback(
    (value) => {
      setSelectedTheme(value);
      if (value === 'system') {
        const prefersDark =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const desired = prefersDark ? 'dark' : 'light';
        if (desired !== theme) toggleTheme();
      } else if (value !== theme) {
        toggleTheme();
      }
    },
    [theme, toggleTheme]
  );

  return (
    <Card bordered className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
            Theme
          </h3>
          <Badge variant="primary" size="xs" pill>
            {theme === 'dark' ? 'Dark mode active' : 'Light mode active'}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
          Choose how RoadSense AI appears on your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((option) => {
          const Icon = THEME_ICONS[option.value] || Monitor;
          const selected = selectedTheme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              aria-pressed={selected}
              aria-label={`Set theme to ${option.label}`}
              className={`group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                selected
                  ? 'border-primary-400 dark:border-primary-500 bg-primary-50/60 dark:bg-primary-950/30 ring-1 ring-primary-400 dark:ring-primary-500/60'
                  : 'border-secondary-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-800 hover:bg-secondary-50 dark:hover:bg-dark-800/50'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-200 ${
                  selected
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300'
                    : 'bg-secondary-100 dark:bg-dark-800 text-secondary-500 dark:text-dark-300 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/30 group-hover:text-primary-600 dark:group-hover:text-primary-300'
                }`}
                aria-hidden="true"
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

