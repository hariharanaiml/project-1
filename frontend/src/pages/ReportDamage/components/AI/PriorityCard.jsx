import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import SectionHeader from '../Shared/SectionHeader';
import { useCountUp } from '../../../../hooks/useCountUp';

/** Priority level configuration */
const PRIORITY_CONFIG = {
  Low: { variant: 'success', icon: ArrowUpRight, explanation: 'Routine maintenance. Schedule during next regular cycle.' },
  Medium: { variant: 'warning', icon: AlertTriangle, explanation: 'Requires attention soon. Plan within the next maintenance window.' },
  High: { variant: 'danger', icon: AlertTriangle, explanation: 'Significant risk. Priority repair needed to prevent escalation.' },
  Critical: { variant: 'danger', icon: AlertTriangle, explanation: 'Immediate action required. Safety hazard present.' },
};

/**
 * PriorityCard component - Displays repair priority with risk context.
 *
 * @param {Object} props
 * @param {string} [props.repairPriority='Low'] - Priority level
 * @param {string} [props.expectedResponse] - Expected response time
 * @param {number} [props.riskScore=0] - AI risk score (0-100)
 */
export default function PriorityCard({ repairPriority = 'Low', expectedResponse = '', riskScore = 0 }) {
  const config = useMemo(() => {
    return PRIORITY_CONFIG[repairPriority] || PRIORITY_CONFIG.Low;
  }, [repairPriority]);

  const Icon = config.icon;
  const { count: animatedRisk, ref } = useCountUp(riskScore, 1200, 350);

  return (
    <section aria-label="Repair priority">
      <SectionHeader
        title="Repair Priority"
        description="AI-determined urgency level for this damage."
        delay={0.2}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-4">
            {/* Priority header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                repairPriority === 'Critical' || repairPriority === 'High'
                  ? 'bg-danger-100 dark:bg-danger-900/30 text-danger-500'
                  : repairPriority === 'Medium'
                  ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-500'
                  : 'bg-success-100 dark:bg-success-900/30 text-success-500'
              }`}>
                <Icon size={24} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-dark-400">Priority Level</p>
                <Badge variant={config.variant} size="lg" pill>
                  {repairPriority}
                </Badge>
              </div>
            </motion.div>

            {/* Response time */}
            {expectedResponse && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
              >
                <Clock size={16} className="shrink-0 text-secondary-400 dark:text-dark-500" aria-hidden="true" />
                <div>
                  <p className="text-xs text-secondary-500 dark:text-dark-400">Expected Response Time</p>
                  <p className="text-sm font-medium text-secondary-900 dark:text-dark-100">
                    {expectedResponse}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Risk score */}
            {riskScore > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.38 }}
                ref={ref}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
              >
                <span className="text-xs text-secondary-600 dark:text-dark-300">AI Risk Score</span>
                <span className="text-sm font-bold text-secondary-900 dark:text-dark-100 tabular-nums">
                  {animatedRisk}/100
                </span>
              </motion.div>
            )}

            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-secondary-400 dark:text-dark-400" aria-hidden="true" />
              <p className="text-xs text-secondary-600 dark:text-dark-300 leading-relaxed">
                {config.explanation}
              </p>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

