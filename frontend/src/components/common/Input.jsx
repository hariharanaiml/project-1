import { forwardRef, useId } from 'react';

/**
 * Input component - Reusable text input with label, error, icon, and helper text support.
 *
 * @param {Object} props
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message
 * @param {string} [props.helperText] - Helper text below input
 * @param {React.ElementType} [props.leftIcon] - Icon inside input on the left
 * @param {React.ElementType} [props.rightIcon] - Icon inside input on the right
 * @param {function} [props.onRightIconClick] - Click handler for the right icon (renders it as a button)
 * @param {string} [props.rightIconAriaLabel] - Accessible label for the right icon button
 * @param {boolean} [props.fullWidth=false] - Full width input
 * @param {string} [props.className] - Additional CSS classes
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onRightIconClick,
    rightIconAriaLabel,
    fullWidth = false,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary-700 dark:text-dark-200 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon
              size={16}
              className="text-secondary-400 dark:text-dark-400"
              aria-hidden="true"
            />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId || helperId}
          className={`
            block w-full rounded-lg text-sm
            border bg-gray-800 dark:bg-gray-900
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50 dark:disabled:bg-dark-800
            ${LeftIcon ? 'pl-10' : 'pl-3'}
            ${RightIcon || error ? 'pr-10' : 'pr-3'}
            py-2
            ${
              error
                ? 'border-danger-300 dark:border-danger-400 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-gray-600 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 dark:focus:border-primary-400'
            }
          `.trim()}
          {...rest}
        />

        {RightIcon && !error && (onRightIconClick ? (
          <button
            type="button"
            aria-label={rightIconAriaLabel || 'Toggle visibility'}
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 dark:text-dark-400 hover:text-secondary-600 dark:hover:text-dark-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <RightIcon size={16} aria-hidden="true" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon
              size={16}
              className="text-secondary-400 dark:text-dark-400"
              aria-hidden="true"
            />
          </div>
        ))}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="text-danger-500"
            >
              <circle cx="8" cy="8" r="8" fill="currentColor" />
              <path
                d="M8 4.5V9M8 11V11.01"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
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

