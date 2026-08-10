/**
 * Divider component - Horizontal or vertical divider with optional label.
 *
 * @param {Object} props
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal'] - Divider orientation
 * @param {string} [props.label] - Text label to display in the middle of the divider
 * @param {string} [props.className] - Additional CSS classes
 */
export function Divider({ orientation = 'horizontal', label, className = '' }) {
  if (orientation === 'vertical') {
    return (
      <div
        className={`inline-block w-px h-full min-h-[1em] bg-secondary-200 dark:bg-dark-700 ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={`flex items-center gap-3 ${className}`}
        role="separator"
        aria-orientation="horizontal"
      >
        <div className="flex-1 h-px bg-secondary-200 dark:bg-dark-700" />
        <span className="text-xs font-medium text-secondary-400 dark:text-dark-400 uppercase tracking-wider whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-secondary-200 dark:bg-dark-700" />
      </div>
    );
  }

  return (
    <div
      className={`h-px w-full bg-secondary-200 dark:bg-dark-700 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}

