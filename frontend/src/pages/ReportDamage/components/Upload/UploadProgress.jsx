import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Upload, Search, Cpu } from 'lucide-react';

/** Map of stage names to icons for visual variety */
const STAGE_ICONS = {
  'Uploading...': Upload,
  'Validating Image...': Search,
  'Preparing AI Analysis...': Cpu,
  Completed: CheckCircle2,
};

/**
 * UploadProgress component - Animated progress bar with stage transitions.
 *
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0–100)
 * @param {string} props.stage - Current stage label
 */
export default function UploadProgress({ progress = 0, stage = '' }) {
  const StageIcon = STAGE_ICONS[stage] || null;

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Upload progress: ${progress}% - ${stage}`}
    >
      {/* Progress percentage */}
      <div className="flex items-center justify-between mb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {StageIcon && (
              <StageIcon size={16} className="text-primary-500" aria-hidden="true" />
            )}
            <span className="text-sm font-medium text-secondary-700 dark:text-dark-200">
              {stage}
            </span>
          </motion.div>
        </AnimatePresence>

        <motion.span
          key={progress}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums"
        >
          {progress}%
        </motion.span>
      </div>

      {/* Progress bar track */}
      <div className="relative h-2.5 rounded-full bg-secondary-200 dark:bg-dark-700 overflow-hidden">
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 dark:from-primary-600 dark:to-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          aria-hidden="true"
        />

        {/* Shimmer effect at the leading edge when not completed */}
        {progress < 100 && (
          <motion.div
            className="absolute inset-y-0 rounded-full bg-white/20 dark:bg-white/10"
            initial={{ left: `${progress - 10}%`, width: '8%' }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Completed state indicator */}
      {progress === 100 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-success-600 dark:text-success-400 flex items-center gap-1.5"
        >
          <CheckCircle2 size={14} aria-hidden="true" />
          <span>Upload complete</span>
        </motion.p>
      )}
    </div>
  );
}
