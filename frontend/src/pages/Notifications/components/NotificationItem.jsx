import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Wrench, CheckCircle2, Info } from 'lucide-react';

/** Map notification type to an icon + color. */
const TYPE_CONFIG = {
  report: { Icon: FileText, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/40' },
  ai: { Icon: Cpu, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  maintenance: { Icon: Wrench, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/40' },
  status: { Icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-950/40' },
  system: { Icon: Info, color: 'text-info-500', bg: 'bg-info-50 dark:bg-info-950/40' },
};

/** Framer Motion variants inherited from the parent stagger container. */
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/**
 * NotificationItem - Single notification row with read/unread styling.
 *
 * @param {Object} props
 * @param {Object} props.notification - Notification object
 * @param {(id: number) => void} props.onMarkRead - Mark single notification as read
 */
function NotificationItem({ notification, onMarkRead }) {
  const { Icon, color, bg } = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;

  return (
    <motion.li
      variants={itemVariants}
      className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-xl border transition-colors duration-200 ${
        notification.read
          ? 'bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700'
          : 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-200 dark:border-primary-900/40'
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <span
          className="absolute top-5 right-4 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-500/20"
          aria-label="Unread notification"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div
        className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl ${bg} ${color}`}
        aria-hidden="true"
      >
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h4
            className={`text-sm font-semibold ${
              notification.read
                ? 'text-secondary-700 dark:text-dark-200'
                : 'text-secondary-900 dark:text-dark-100'
            }`}
          >
            {notification.title}
          </h4>
          <time className="shrink-0 text-2xs text-secondary-400 dark:text-dark-500 whitespace-nowrap">
            {notification.timestamp}
          </time>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-secondary-500 dark:text-dark-400">
          {notification.message}
        </p>

        {!notification.read && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              aria-label={`Mark "${notification.title}" as read`}
            >
              Mark as read
            </button>
          </div>
        )}
      </div>
    </motion.li>
  );
}

export default memo(NotificationItem);

