const variantStyles = {
  default: 'bg-secondary-100 text-secondary-700 dark:bg-dark-800 dark:text-dark-200',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300',
  info: 'bg-info-50 text-info-700 dark:bg-info-950 dark:text-info-300',
};

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-2xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Badge component - Small label for status, categorization, or counts.
 *
 * @param {Object} props
 * @param {'default'|'primary'|'success'|'warning'|'danger'|'info'} [props.variant='default'] - Badge color variant
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm'] - Badge size
 * @param {boolean} [props.dot=false] - Show a dot indicator before text
 * @param {boolean} [props.pill=false] - Fully rounded pill shape
 * @param {string} [props.className] - Additional CSS classes
 */
export function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  pill = false,
  children,
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.sm}
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${className}
      `.trim()}
    >
      {dot && (
        <span
          className={`
            inline-block w-1.5 h-1.5 rounded-full
            ${variant === 'default' ? 'bg-secondary-400 dark:bg-dark-400' : ''}
            ${variant === 'primary' ? 'bg-primary-500' : ''}
            ${variant === 'success' ? 'bg-success-500' : ''}
            ${variant === 'warning' ? 'bg-warning-500' : ''}
            ${variant === 'danger' ? 'bg-danger-500' : ''}
            ${variant === 'info' ? 'bg-info-500' : ''}
          `.trim()}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

