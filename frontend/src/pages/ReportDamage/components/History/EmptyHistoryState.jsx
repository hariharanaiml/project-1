import { motion } from 'framer-motion';
import { FilePlus2, FileText } from 'lucide-react';
import { Button } from '../../../../components/common/Button';

/**
 * EmptyHistoryState component - Placeholder shown when no reports exist.
 *
 * @param {Object} props
 * @param {() => void} props.onCreateFirstReport - Navigate to report creation
 */
export default function EmptyHistoryState({ onCreateFirstReport }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700"
      role="status"
    >
      {/* Illustration placeholder */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary-50 dark:bg-dark-800 border-2 border-dashed border-secondary-300 dark:border-dark-600"
        aria-hidden="true"
      >
        <FileText size={32} className="text-secondary-400 dark:text-dark-500" />
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-primary-500 text-white">
          <FilePlus2 size={14} />
        </span>
      </motion.div>

      <h3 className="mt-5 text-base font-semibold text-secondary-900 dark:text-dark-100">No Reports Yet</h3>
      <p className="mt-1 text-sm text-secondary-500 dark:text-dark-400 max-w-sm">
        Your submitted reports will appear here.
      </p>

      <div className="mt-5">
        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={FilePlus2}
          onClick={onCreateFirstReport}
          aria-label="Create first report"
        >
          Create First Report
        </Button>
      </div>
    </motion.div>
  );
}

