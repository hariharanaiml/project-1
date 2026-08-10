/**
 * SectionHeading - Shared heading block used by all AI Analysis dashboard cards.
 * Keeps titles, descriptions, icons, and action badges consistent.
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.description] - Optional description
 * @param {React.ReactNode} [props.action] - Optional action node (e.g., badge)
 * @param {React.ElementType} [props.icon] - Optional lucide icon component
 */
export default function SectionHeading({ title, description, action, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5">
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && (
          <span
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shrink-0"
            aria-hidden="true"
          >
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs sm:text-sm text-secondary-500 dark:text-dark-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

