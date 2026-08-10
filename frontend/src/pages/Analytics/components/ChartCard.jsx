import { Card } from '../../../components/common/Card';

/**
 * ChartCard - Shared card wrapper for analytics chart panels.
 * Provides consistent title + subtitle + content layout with no double padding.
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {React.ReactNode} props.children - Chart/content area
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props['aria-label']] - Accessibility label
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  className = '',
  'aria-label': ariaLabel,
}) {
  return (
    <Card
      bordered
      padding="none"
      className={`h-full ${className}`}
      aria-label={ariaLabel}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </Card>
  );
}

