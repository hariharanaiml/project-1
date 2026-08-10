import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const variantStyles = {
  info: {
    container: 'bg-info-50 border-info-200 dark:bg-info-950/30 dark:border-info-800',
    icon: 'text-info-500',
    text: 'text-info-700 dark:text-info-300',
    Icon: Info,
  },
  success: {
    container: 'bg-success-50 border-success-200 dark:bg-success-950/30 dark:border-success-800',
    icon: 'text-success-500',
    text: 'text-success-700 dark:text-success-300',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-warning-50 border-warning-200 dark:bg-warning-950/30 dark:border-warning-800',
    icon: 'text-warning-500',
    text: 'text-warning-700 dark:text-warning-300',
    Icon: AlertTriangle,
  },
  danger: {
    container: 'bg-danger-50 border-danger-200 dark:bg-danger-950/30 dark:border-danger-800',
    icon: 'text-danger-500',
    text: 'text-danger-700 dark:text-danger-300',
    Icon: AlertCircle,
  },
};

/**
 * Alert component - Contextual message bar for feedback and notifications.
 *
 * @param {Object} props
 * @param {'info'|'success'|'warning'|'danger'} [props.variant='info'] - Alert variant
 * @param {boolean} [props.dismissible=false] - Show dismiss button
 * @param {function} [props.onDismiss] - Dismiss callback
 * @param {string} [props.title] - Optional bold title
 * @param {string} [props.className] - Additional CSS classes
 */
export function Alert({
  variant = 'info',
  dismissible = false,
  onDismiss,
  title,
  children,
  className = '',
}) {
  const config = variantStyles[variant] || variantStyles.info;
  const { container, icon, text, Icon } = config;

  return (
    <div
      role="alert"
      className={`
        relative flex gap-3 rounded-lg border p-4
        ${container}
        animate-slide-down
        ${className}
      `.trim()}
    >
      <div className={`shrink-0 mt-0.5 ${icon}`}>
        <Icon size={18} aria-hidden="true" />
      </div>

      <div className={`flex-1 min-w-0 ${text}`}>
        {title && (
          <p className="text-sm font-semibold mb-1">{title}</p>
        )}
        <div className="text-sm">{children}</div>
      </div>

      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Dismiss alert"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

