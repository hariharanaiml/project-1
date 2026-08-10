import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import SectionHeader from '../Shared/SectionHeader';
import { useCountUp } from '../../../../hooks/useCountUp';

/** Circular progress SVG config */
const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/** Confidence label config with badge variant and color. */
const CONFIDENCE_LEVELS = [
  { min: 80, label: 'High', variant: 'success', color: '#22c55e' },
  { min: 50, label: 'Medium', variant: 'warning', color: '#f59e0b' },
  { min: 0, label: 'Low', variant: 'danger', color: '#ef4444' },
];

/** Confidence explanation text per level. */
const CONFIDENCE_EXPLANATIONS = {
  High: 'The AI model is highly confident in this damage detection result.',
  Medium: 'The AI model has moderate confidence. Manual verification recommended.',
  Low: 'The AI model has low confidence. Human expert review is strongly advised.',
};

/**
 * ConfidenceScoreCard component - Animated circular confidence display with count-up.
 *
 * @param {Object} props
 * @param {number} [props.confidence=0] - Confidence percentage (0-100)
 * @param {string} [props.confidenceLabel] - Optional label override
 */
export default function ConfidenceScoreCard({ confidence = 0, confidenceLabel }) {
  const level = useMemo(() => {
    if (confidenceLabel) {
      return CONFIDENCE_LEVELS.find((l) => l.label === confidenceLabel) || CONFIDENCE_LEVELS[2];
    }
    return CONFIDENCE_LEVELS.find((l) => confidence >= l.min) || CONFIDENCE_LEVELS[2];
  }, [confidence, confidenceLabel]);

  const offset = useMemo(() => {
    return CIRCLE_CIRCUMFERENCE - (confidence / 100) * CIRCLE_CIRCUMFERENCE;
  }, [confidence]);

  const { count, ref } = useCountUp(confidence, 1200, 300);

  const explanation = CONFIDENCE_EXPLANATIONS[level.label] || CONFIDENCE_EXPLANATIONS.Low;

  return (
    <section aria-label="AI confidence score">
      <SectionHeader
        title="Confidence Score"
        description="AI confidence in the detected damage analysis."
        delay={0.1}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center py-6">
            {/* Animated circular progress */}
            <div
              ref={ref}
              className="relative mb-4"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={confidence}
              aria-label={`Confidence: ${confidence}%`}
            >
              <svg
                width="128"
                height="128"
                viewBox="0 0 128 128"
                className="transform -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-secondary-200 dark:text-dark-700"
                />
                {/* Animated progress circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke={level.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  initial={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>

              {/* Center percentage with count-up */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-3xl font-bold text-secondary-900 dark:text-dark-100 tabular-nums"
                >
                  {count}%
                </motion.span>
              </div>
            </div>

            {/* Confidence label */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Badge variant={level.variant} size="md" pill>
                {level.label} Confidence
              </Badge>
            </motion.div>

            {/* Explanation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="mt-3 text-xs text-secondary-500 dark:text-dark-400 text-center max-w-xs"
            >
              {explanation}
            </motion.p>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

