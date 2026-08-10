import { useState, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';

/**
 * PrivacySettings - Toggle list for privacy & data controls.
 *
 * @param {Object} props
 * @param {Array<{key: string, title: string, description: string, enabled: boolean}>} props.settings - Privacy items
 */
export default function PrivacySettings({ settings }) {
  const [items, setItems] = useState(() => settings.map((item) => ({ ...item })));

  const handleToggle = useCallback((key) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, enabled: !item.enabled } : item
      )
    );
  }, []);

  return (
    <Card bordered className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-success-500" aria-hidden="true" />
          <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
            Privacy Settings
          </h3>
        </div>
        <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
          Control how your data is shared and used.
        </p>
      </div>

      <ul role="list" aria-label="Privacy settings" className="divide-y divide-secondary-100 dark:divide-dark-800">
        {items.map((item) => (
          <li key={item.key} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-secondary-900 dark:text-dark-100">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.enabled}
                aria-label={`Toggle ${item.title}`}
                onClick={() => handleToggle(item.key)}
                className={`relative inline-flex shrink-0 items-center h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-900 ${
                  item.enabled ? 'bg-success-500' : 'bg-secondary-300 dark:bg-dark-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    item.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-end">
        <Button type="button" variant="primary" aria-label="Save privacy settings">
          Save Privacy
        </Button>
      </div>
    </Card>
  );
}

