import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import SectionHeader from '../Shared/SectionHeader';

/** Severity levels with metadata */
const SEVERITY_LEVELS = [
  {
    id: 'auto_detect',
    label: 'Auto Detect',
    variant: 'default',
    risk: 0,
    explanation: 'Let AI determine the severity automatically.',
  },
  {
    id: 'low',
    label: 'Low',
    variant: 'success',
    risk: 25,
    explanation: 'Minor surface wear. Monitor and schedule routine maintenance.',
  },
  {
    id: 'medium',
    label: 'Medium',
    variant: 'warning',
    risk: 50,
    explanation: 'Moderate damage requiring attention within the next maintenance cycle.',
  },
  {
    id: 'high',
    label: 'High',
    variant: 'danger',
    risk: 75,
    explanation: 'Significant damage. Priority repair needed to prevent further deterioration.',
  },
  {
    id: 'critical',
    label: 'Critical',
    variant: 'danger',
    risk: 100,
    explanation: 'Severe damage posing safety risks. Immediate repair required.',
  },
];

/**
 * SeverityCard component - Severity prediction display with risk indicator.
 *
 * @param {Object} props
 * @param {string} props.severity - Current severity ID
 * @param {number} [props.confidence] - AI confidence percentage (optional, future)
 * @param {number} [props.riskScore] - Risk score (optional, future)
 * @param {number} [props.estimatedRepairCost] - Estimated repair cost (optional, future)
 * @param {string} [props.repairPriority] - Repair priority (optional, future)
 * @param {function} [props.onChange] - Severity change callback
 */
export default function SeverityCard({
  severity = 'auto_detect',
  confidence,
  riskScore,
  estimatedRepairCost,
  repairPriority: _repairPriority,
  onChange,
}) {
  const currentLevel = useMemo(
    () => SEVERITY_LEVELS.find((l) => l.id === severity) || SEVERITY_LEVELS[0],
    [severity],
  );

  const riskWidth = useMemo(() => {
    if (riskScore !== undefined) return Math.min(100, Math.max(0, riskScore));
    return currentLevel.risk;
  }, [currentLevel.risk, riskScore]);

  return (
    <section aria-label="Severity prediction">
      <SectionHeader
        title="Severity Prediction"
        description="AI-estimated severity of the detected damage."
        delay={0.1}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-5">
            {/* Current severity badge */}
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={20}
                className={`shrink-0 ${
                  currentLevel.id === 'critical' || currentLevel.id === 'high'
                    ? 'text-danger-500'
                    : currentLevel.id === 'medium'
                    ? 'text-warning-500'
                    : currentLevel.id === 'low'
                    ? 'text-success-500'
                    : 'text-secondary-400'
                }`}
                aria-hidden="true"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-secondary-700 dark:text-dark-200">
                  Current Prediction:
                </span>
                <Badge
                  variant={currentLevel.variant}
                  size="md"
                  pill
                >
                  {currentLevel.label}
                </Badge>
              </div>
            </div>

            {/* Risk indicator bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-500 dark:text-dark-400">Risk Level</span>
                <span className="font-medium text-secondary-700 dark:text-dark-200 tabular-nums">
                  {riskWidth}%
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-secondary-200 dark:bg-dark-700 overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-300 ${
                    riskWidth > 75
                      ? 'bg-danger-500'
                      : riskWidth > 50
                      ? 'bg-warning-500'
                      : riskWidth > 25
                      ? 'bg-primary-500'
                      : 'bg-success-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${riskWidth}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex justify-between text-2xs text-secondary-400 dark:text-dark-500">
                <span>Safe</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary-50 dark:bg-dark-800">
              <Info size={14} className="shrink-0 mt-0.5 text-secondary-400 dark:text-dark-400" aria-hidden="true" />
              <p className="text-xs text-secondary-600 dark:text-dark-300">
                {currentLevel.explanation}
              </p>
            </div>

            {/* Future AI fields (hidden placeholders for backend integration) */}
            {confidence !== undefined && (
              <p className="text-xs text-secondary-400 dark:text-dark-500">
                AI Confidence: <strong className="tabular-nums">{confidence}%</strong>
              </p>
            )}
            {estimatedRepairCost !== undefined && (
              <p className="text-xs text-secondary-400 dark:text-dark-500">
                Estimated Repair Cost: <strong>${estimatedRepairCost.toLocaleString()}</strong>
              </p>
            )}

            {/* Severity selector (UI only, can be overwritten by AI) */}
            {onChange && (
              <div className="pt-2 border-t border-secondary-100 dark:border-dark-800">
                <p className="text-xs font-medium text-secondary-500 dark:text-dark-400 mb-2">
                  Manual Override (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => onChange(level.id)}
                      className={`
                        px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                        ${severity === level.id
                          ? `ring-2 ring-offset-1 ${
                              level.id === 'critical' || level.id === 'high'
                                ? 'ring-danger-500 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                                : level.id === 'medium'
                                ? 'ring-warning-500 bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300'
                                : level.id === 'low'
                                ? 'ring-success-500 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300'
                                : 'ring-secondary-500 bg-secondary-100 dark:bg-dark-700 text-secondary-700 dark:text-dark-200'
                            }`
                          : 'bg-secondary-100 dark:bg-dark-800 text-secondary-600 dark:text-dark-300 hover:bg-secondary-200 dark:hover:bg-dark-700'
                        }
                      `}
                      aria-pressed={severity === level.id}
                      aria-label={`Set severity to ${level.label}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
