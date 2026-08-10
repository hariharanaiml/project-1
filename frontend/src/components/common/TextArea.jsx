import { forwardRef, useId } from 'react';

/**
 * TextArea component - Reusable multi-line text input with label, error, and helper text.
 *
 * @param {Object} props
 * @param {string} [props.label] - Textarea label
 * @param {string} [props.error] - Error message
 * @param {string} [props.helperText] - Helper text below textarea
 * @param {boolean} [props.fullWidth=false] - Full width textarea
 * @param {number} [props.rows=3] - Number of visible rows
 * @param {string} [props.className] - Additional CSS classes
 */
export const TextArea = forwardRef(function TextArea(
  {
    label,
    error,
    helperText,
    fullWidth = false,
    rows = 3,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText && !error ? `${textareaId}-helper` : undefined;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-secondary-700 dark:text-dark-200 mb-1.5"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={errorId || helperId}
        className={`
          block w-full rounded-lg text-sm resize-y
          border bg-white dark:bg-dark-800
          placeholder:text-secondary-400 dark:placeholder:text-dark-500
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50 dark:disabled:bg-dark-800
          px-3 py-2
          ${
            error
              ? 'border-danger-300 dark:border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-secondary-300 dark:border-dark-600 focus:border-primary-500 focus:ring-primary-500/20 dark:focus:border-primary-400'
          }
        `.trim()}
        {...rest}
      />

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

