import { useState, useCallback } from 'react';
import { Languages } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';

/**
 * LanguageSettings - Language selection dropdown.
 *
 * @param {Object} props
 * @param {Array<{value: string, label: string}>} props.options - Language options
 */
export default function LanguageSettings({ options }) {
  const [language, setLanguage] = useState('en');

  const handleChange = useCallback((event) => {
    setLanguage(event.target.value);
  }, []);

  return (
    <Card bordered className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Languages size={16} className="text-primary-500" aria-hidden="true" />
          <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
            Language
          </h3>
        </div>
        <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
          Choose your preferred language for the platform.
        </p>
      </div>

      <Select
        label="Interface Language"
        options={options}
        value={language}
        onChange={handleChange}
        fullWidth
        aria-label="Select interface language"
      />

      <div className="mt-5 flex justify-end">
        <Button type="button" variant="primary" aria-label="Save language preference">
          Save Language
        </Button>
      </div>
    </Card>
  );
}

