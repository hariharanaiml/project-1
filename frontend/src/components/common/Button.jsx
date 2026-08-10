import { forwardRef } from 'react';
import { Spinner } from './Spinner';

const variantStyles = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500 disabled:bg-primary-300 dark:disabled:bg-primary-800',
  secondary:
    'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-500 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700 dark:active:bg-dark-600',
  ghost:
    'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-secondary-500 dark:text-dark-200 dark:hover:bg-dark-800 dark:active:bg-dark-700',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 focus-visible:ring-danger-500 disabled:bg-danger-300 dark:disabled:bg-danger-800',
  outline:
    'border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-secondary-500 dark:border-dark-600 dark:text-dark-200 dark:hover:bg-dark-800 dark:active:bg-dark-700',
  link:
    'bg-transparent text-primary-500 hover:text-primary-600 active:text-primary-700 underline-offset-2 hover:underline focus-visible:ring-primary-500 dark:text-primary-400 dark:hover:text-primary-300',
};

const sizeStyles = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
  xl: 'px-6 py-3 text-base gap-2.5',
};

const iconSizeMap = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 22,
};

/**
 * Button component - Reusable button with variants, sizes, loading state, and icon support.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'|'link'} [props.variant='primary'] - Button variant
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Button size
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.fullWidth=false] - Full width button
 * @param {React.ElementType} [props.leftIcon] - Icon component to render on the left
 * @param {React.ElementType} [props.rightIcon] - Icon component to render on the right
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Button type
 * @param {string} [props.className] - Additional CSS classes
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    type = 'button',
    children,
    className = '',
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-dark-900
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading ? (
        <Spinner
          size="sm"
          aria-label="Loading"
          className={
            variant === 'primary' || variant === 'danger'
              ? 'border-white/30 border-t-white'
              : 'border-secondary-300 border-t-secondary-700 dark:border-dark-500 dark:border-t-dark-200'
          }
        />
      ) : LeftIcon ? (
        <LeftIcon size={iconSizeMap[size]} aria-hidden="true" />
      ) : null}
      {children && <span>{children}</span>}
      {!loading && RightIcon && (
        <RightIcon size={iconSizeMap[size]} aria-hidden="true" />
      )}
    </button>
  );
});

