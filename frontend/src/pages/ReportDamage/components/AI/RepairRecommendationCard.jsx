import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, HardHat, ShieldAlert } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import SectionHeader from '../Shared/SectionHeader';

/**
 * RepairRecommendationCard component - Displays AI repair recommendation with details.
 *
 * @param {Object} props
 * @param {string} [props.repairRecommendation] - Primary repair recommendation text
 * @param {string} [props.recommendedMethod] - Recommended repair method name
 * @param {string} [props.duration] - Estimated repair duration
 * @param {string[]} [props.equipment] - Required equipment list
 * @param {string} [props.safetyNotes] - Safety precautions
 */
export default function RepairRecommendationCard({
  repairRecommendation = '',
  recommendedMethod = '',
  duration = '',
  equipment = [],
  safetyNotes = '',
}) {
  const detailItems = useMemo(() => [
    { icon: Wrench, label: 'Method', value: recommendedMethod },
    { icon: Clock, label: 'Duration', value: duration },
  ], [recommendedMethod, duration]);

  return (
    <section aria-label="Repair recommendation">
      <SectionHeader
        title="Repair Recommendation"
        description="AI-suggested repair method and requirements."
        delay={0.15}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-4">
            {/* Primary recommendation */}
            {repairRecommendation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800"
              >
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100 leading-relaxed">
                  &ldquo;{repairRecommendation}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Method and duration details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
                  >
                    <Icon size={16} className="shrink-0 mt-0.5 text-primary-500" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs text-secondary-500 dark:text-dark-400">{item.label}</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-dark-100">{item.value || 'N/A'}</p>
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
                transition={{ duration: 0.3, delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <HardHat size={14} className="text-secondary-500 dark:text-dark-400" aria-hidden="true" />
                  <span className="text-xs font-medium text-secondary-600 dark:text-dark-300 uppercase tracking-wider">
                    Required Equipment
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {equipment.map((item) => (
                    <span
                      key={item}
                      className="inline-flex px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary-100 dark:bg-dark-800 text-secondary-700 dark:text-dark-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Safety notes */}
            {safetyNotes && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800/50"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-warning-600 dark:text-warning-400" aria-hidden="true" />
                <p className="text-xs text-warning-800 dark:text-warning-200 leading-relaxed">
                  {safetyNotes}
                </p>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
