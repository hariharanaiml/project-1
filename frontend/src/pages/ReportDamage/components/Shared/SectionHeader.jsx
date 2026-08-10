import { motion } from 'framer-motion';

/**
 * SectionHeader component - Consistent heading for report damage sections.
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.description] - Optional description
 * @param {React.ReactNode} [props.action] - Optional action element (e.g., badge)
 * @param {number} [props.delay=0] - Animation delay in seconds
 */
export default function SectionHeader({ title, description, action, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-dark-100">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.div>
  );
}
