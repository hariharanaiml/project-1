import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, HardHat, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import SectionHeading from './SectionHeading';

/** Map priority → badge variant. */
const PRIORITY_VARIANT = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
  Critical: 'danger',
};

/**
 * RepairRecommendation - AI repair recommendation with priority badge.
 *
 * @param {Object} props
 * @param {string} [props.recommendation] - Primary repair recommendation
 * @param {string} [props.method] - Recommended repair method
 * @param {string} [props.duration] - Estimated repair duration
 * @param {string[]} [props.equipment=[]] - Required equipment list
 * @param {string} [props.safetyPrecautions] - Safety precautions
 * @param {string} [props.priority] - Priority level
 */
export default function RepairRecommendation({
  recommendation = '',
  method = '',
  duration = '',
  equipment = [],
  safetyPrecautions = '',
  priority = 'Low',
}) {
  const detailItems = useMemo(
    () => [
      { icon: Wrench, label: 'Recommended Repair', value: method },
      { icon: Clock, label: 'Estimated Duration', value: duration },
    ],
    [method, duration]
  );

  return (
    <section aria-label="Repair recommendation">
      <SectionHeading
        title="Repair Recommendation"
        description="AI-suggested repair method and requirements."
        icon={Wrench}
        action={<Badge variant={PRIORITY_VARIANT[priority] || 'default'} size="md" dot pill>{priority} Priority</Badge>}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          bordered
          padding="lg"
          className="relative overflow-hidden bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl h-full"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-success-500/10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-4">
            {/* Recommendation quote */}
            {recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800"
              >
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100 leading-relaxed">
                  &ldquo;{recommendation}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Method + duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary-50/80 dark:bg-dark-800/60"
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 shrink-0"
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-2xs text-secondary-500 dark:text-dark-400 uppercase tracking-wider">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-secondary-900 dark:text-dark-100">
                        {item.value || 'N/A'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Required equipment */}
            {equipment.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <HardHat size={14} className="text-secondary-500 dark:text-dark-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-secondary-600 dark:text-dark-300 uppercase tracking-wider">
                    Required Equipment
                  </span>
                </div>
                <ul className="flex flex-wrap gap-2" role="list" aria-label="Required equipment">
                  {equipment.map((item) => (
                    <li
                      key={item}
                      className="inline-flex px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary-100 dark:bg-dark-800 text-secondary-700 dark:text-dark-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Safety precautions */}
            {safetyPrecautions && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800/50"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-warning-600 dark:text-warning-400" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-warning-700 dark:text-warning-300">Safety Precautions</p>
                  <p className="mt-0.5 text-xs text-warning-800 dark:text-warning-200 leading-relaxed">
                    {safetyPrecautions}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

