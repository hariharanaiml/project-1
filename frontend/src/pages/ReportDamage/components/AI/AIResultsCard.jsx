import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/common/Card';
import { Divider } from '../../../../components/common/Divider';
import SectionHeader from '../Shared/SectionHeader';
import SubmitReportCard from '../Submit/SubmitReportCard';

/**
 * AIResultsCard component - Parent container that aggregates all AI analysis results.
 * Designed to accept a full API response object directly via the `data` prop,
 * with individual props supported as a fallback for granular composition.
 *
 * @param {Object} props
 * @param {Object} [props.data] - Full AI analysis result object (future API response shape)
 * @param {string} [props.damageType] - Detected damage type
 * @param {string} [props.severity] - Severity level
 * @param {number} [props.confidence] - Confidence percentage
 * @param {string} [props.repairPriority] - Repair priority level
 * @param {number} [props.estimatedRepairCost] - Total estimated cost
 * @param {string} [props.repairRecommendation] - Primary recommendation text
 * @param {string} [props.roadName] - Road name (fallback when not in data)
 * @param {string} [props.address] - Address (fallback when not in data)
 * @param {boolean} [props.isSubmitting=false] - Submit in progress
 * @param {boolean} [props.isSubmitted=false] - Report already submitted
 * @param {() => void} [props.onSubmitReport] - Submit report handler
 * @param {() => void} [props.onEditAnalysis] - Edit analysis handler
 * @param {boolean} [props.showSummary=true] - Show condensed summary in parent
 * @param {React.ReactNode} [props.children] - Child components to render below summary
 */
export default function AIResultsCard({
  data,
  damageType: damageTypeProp = '',
  severity: severityProp = '',
  confidence: confidenceProp = 0,
  repairPriority: repairPriorityProp = '',
  estimatedRepairCost: estimatedRepairCostProp = 0,
  repairRecommendation: repairRecommendationProp = '',
  roadName: roadNameProp = '',
  address: addressProp = '',
  isSubmitting = false,
  isSubmitted = false,
  onSubmitReport,
  onEditAnalysis,
  showSummary = true,
  children,
}) {
  // Resolve values from the API-style `data` object first, falling back to individual props.
  const resolvedData = data || {};
  const {
    damageType = damageTypeProp,
    severity = severityProp,
    confidence = confidenceProp,
    repairPriority = repairPriorityProp,
    estimatedRepairCost = estimatedRepairCostProp,
    repairRecommendation = repairRecommendationProp,
    roadName = roadNameProp,
    address: addressFromData,
  } = resolvedData;

  // The simulation exposes the address under `location`; normalize it here.
  const address = addressFromData || resolvedData.location || addressProp;

  const summaryRows = useMemo(() => [
    { label: 'Damage Type', value: damageType },
    { label: 'Severity', value: severity },
    { label: 'Confidence', value: confidence ? `${confidence}%` : 'N/A' },
    { label: 'Priority', value: repairPriority },
    {
      label: 'Est. Cost',
      value: estimatedRepairCost
        ? `$${Number(estimatedRepairCost).toLocaleString()}`
        : 'N/A',
    },
  ], [damageType, severity, confidence, repairPriority, estimatedRepairCost]);

  return (
    <section aria-label="AI analysis results" aria-live="polite">
      <SectionHeader
        title="AI Analysis Results"
        description="Comprehensive AI-powered damage analysis and repair recommendations."
        delay={0.05}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10">
            {/* Condensed summary grid */}
            {showSummary && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {summaryRows.map((row, index) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                      className="p-3 rounded-lg bg-secondary-50 dark:bg-dark-800 text-center"
                    >
                      <p className="text-2xs text-secondary-500 dark:text-dark-400 mb-1 uppercase tracking-wider">
                        {row.label}
                      </p>
                      <p className="text-sm font-semibold text-secondary-900 dark:text-dark-100 truncate">
                        {row.value || 'N/A'}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Recommendation */}
                {repairRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                    className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800"
                  >
                    <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                      <strong>Recommendation:</strong> {repairRecommendation}
                    </p>
                  </motion.div>
                )}

                <Divider className="my-4" />
              </>
            )}

            {/* Child components (detailed cards) */}
            {children}

            {/* Submit report section */}
            <div className="mt-6 sm:mt-8">
              <SubmitReportCard
                damageType={damageType}
                severity={severity}
                confidence={confidence}
                priority={repairPriority}
                repairCost={estimatedRepairCost}
                roadName={roadName}
                address={address}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
                onSubmit={onSubmitReport}
                onEditAnalysis={onEditAnalysis}
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

