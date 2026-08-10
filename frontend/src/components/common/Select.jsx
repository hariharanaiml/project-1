import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select component - Reusable dropdown with label, error, helper text, and icon support.
 *
 * @param {Object} props
 * @param {string} [props.label] - Select label
 * @param {string} [props.error] - Error message
 * @param {string} [props.helperText] - Helper text below select
 * @param {boolean} [props.fullWidth=false] - Full width select
 * @param {Array<{value: string, label: string}>} [props.options=[]] - Select options
 * @param {string} [props.placeholder] - Placeholder option text
 * @param {string} [props.className] - Additional CSS classes
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    fullWidth = false,
    options = [],
    placeholder,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText && !error ? `${selectId}-helper` : undefined;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-secondary-700 dark:text-dark-200 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          className={`
            block w-full rounded-lg text-sm appearance-none
            border bg-white dark:bg-dark-800
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50 dark:disabled:bg-dark-800
            px-3 py-2 pr-10
            ${
              error
                ? 'border-danger-300 dark:border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-secondary-300 dark:border-dark-600 focus:border-primary-500 focus:ring-primary-500/20 dark:focus:border-primary-400'
            }
          `.trim()}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown
            size={16}
            className="text-secondary-400 dark:text-dark-400"
            aria-hidden="true"
          />
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-secondary-500 dark:text-dark-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

