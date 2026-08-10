import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileSearch, FilePlus2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';

/**
 * EmptyReportsState - Shown when no reports match the current filters.
 */
export default function EmptyReportsState() {
  const navigate = useNavigate();

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
        <FileSearch size={32} className="text-secondary-400 dark:text-dark-500" />
      </motion.div>

      <h3 className="mt-5 text-base font-semibold text-secondary-900 dark:text-dark-100">
        No reports found
      </h3>
      <p className="mt-1 text-sm text-secondary-500 dark:text-dark-400 max-w-sm">
        Try adjusting your search or filters, or submit a new road damage report to get started.
      </p>

      <div className="mt-5">
        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={FilePlus2}
          onClick={() => navigate('/report')}
          aria-label="Report road damage"
        >
          Report Damage
        </Button>
      </div>
    </motion.div>
  );
}

