import { motion } from 'framer-motion';
import { BellOff } from 'lucide-react';

/**
 * EmptyNotificationsState - Shown when no notifications match the current filter.
 */
export default function EmptyNotificationsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700"
      role="status"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary-50 dark:bg-dark-800 border-2 border-dashed border-secondary-300 dark:border-dark-600"
        aria-hidden="true"
      >
        <BellOff size={32} className="text-secondary-400 dark:text-dark-500" />
      </motion.div>

      <h3 className="mt-5 text-base font-semibold text-secondary-900 dark:text-dark-100">
        No notifications
      </h3>
      <p className="mt-1 text-sm text-secondary-500 dark:text-dark-400 max-w-sm">
        You're all caught up! New updates about your reports and maintenance will appear here.
      </p>
    </motion.div>
  );
}

