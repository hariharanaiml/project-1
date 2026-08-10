import { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

/**
 * Checkbox component - Reusable checkbox with label and error support.
 *
 * @param {Object} props
 * @param {string} [props.label] - Checkbox label text
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.checked] - Controlled checked state
 * @param {function} [props.onChange] - Change handler
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className] - Additional CSS classes
 */
export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    error,
    checked,
    onChange,
    disabled = false,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <div className={`${className}`}>
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className="peer sr-only"
            {...rest}
          />
          <label
            htmlFor={checkboxId}
            className={`
              flex items-center justify-center w-4 h-4 rounded
              border-2 transition-all duration-150 cursor-pointer
              ${
                error
                  ? 'border-danger-400'
                  : 'border-secondary-300 dark:border-dark-600'
              }
              peer-checked:bg-primary-500 peer-checked:border-primary-500
              peer-checked:dark:bg-primary-400 peer-checked:dark:border-primary-400
              peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-1
              dark:peer-focus-visible:ring-offset-dark-900
              peer-disabled:cursor-not-allowed peer-disabled:opacity-50
              hover:border-primary-400 dark:hover:border-primary-500
            `.trim()}
          >
            <Check
              size={12}
              strokeWidth={3}
              className="text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
              aria-hidden="true"
            />
          </label>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={`
              ml-2.5 text-sm cursor-pointer select-none
              ${disabled ? 'text-secondary-400 dark:text-dark-500' : 'text-secondary-700 dark:text-dark-200'}
            `.trim()}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

