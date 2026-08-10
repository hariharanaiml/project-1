const sizeMap = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-[3px]',
};

/**
 * Spinner component - Animated loading indicator.
 *
 * @param {Object} props
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Spinner size
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.label='Loading...'] - Accessible label for screen readers
 */
export function Spinner({ size = 'md', className = '', label = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`
        inline-block animate-spin rounded-full
        border-secondary-300 border-t-primary-500
        dark:border-dark-600 dark:border-t-primary-400
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `.trim()}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

