import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock } from 'lucide-react';
import { Card } from '../../../../components/common/Card';

/** Spinner dot animation variants */
const DOT_VARIANTS = {
  animate: (i) => ({
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: i * 0.2,
      ease: 'easeInOut',
    },
  }),
};

/**
 * AIProcessingCard component - Simulated AI processing animation with stage info.
 *
 * @param {Object} props
 * @param {{ id: string, label: string }} props.stage - Current processing stage object
 * @param {number} [props.estimatedTime=0] - Estimated remaining time in seconds
 */
export default function AIProcessingCard({ stage = { id: '', label: '' }, estimatedTime = 0 }) {
  const dots = useMemo(() => [0, 1, 2], []);

  return (
    <section aria-label="AI processing status" aria-busy="true">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          {/* Gradient border overlay */}
          <div className="absolute inset-0 rounded-xl p-[1px] pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/20 via-transparent to-secondary-500/20" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center py-8 sm:py-10">
            {/* Animated brain icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-500 dark:text-primary-400 mb-4"
            >
              <Brain size={28} aria-hidden="true" />
            </motion.div>

            {/* Processing stage */}
            <motion.div
              key={stage.id || 'idle'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mb-3"
            >
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-100">
                {stage.label || 'Initializing...'}
              </h3>
            </motion.div>

            {/* Animated dots */}
            <div className="flex items-center gap-1.5 mb-4" aria-hidden="true">
              {dots.map((i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={DOT_VARIANTS}
                  animate="animate"
                  className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"
                />
              ))}
            </div>

            {/* Estimated time */}
            {estimatedTime > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-secondary-500 dark:text-dark-400"
              >
                <Clock size={14} aria-hidden="true" />
                <span>
                  Estimated <strong className="text-secondary-700 dark:text-dark-200 tabular-nums">{estimatedTime}s</strong> remaining
                </span>
              </motion.div>
            )}
          </div>

          {/* Pulsing border glow */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{ boxShadow: ['0 0 0 0 rgba(99,102,241,0)', '0 0 0 4px rgba(99,102,241,0.1)', '0 0 0 0 rgba(99,102,241,0)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        </Card>
      </motion.div>
    </section>
  );
}
