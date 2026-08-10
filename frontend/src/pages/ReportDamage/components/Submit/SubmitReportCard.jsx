import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, PencilLine, CheckCircle2, ShieldAlert, Tag, Wallet, Route, MapPin } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { Divider } from '../../../../components/common/Divider';

/** Format a number as USD currency (no decimals). */
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

/**
 * SubmitReportCard component - Review + submit the analyzed damage report.
 *
 * @param {Object} props
 * @param {string} [props.damageType] - Detected damage type
 * @param {string} [props.severity] - Severity level
 * @param {number} [props.confidence=0] - Confidence percentage
 * @param {string} [props.priority] - Repair priority level
 * @param {number} [props.repairCost=0] - Estimated repair cost
 * @param {string} [props.roadName] - Road name
 * @param {string} [props.address] - Address / location
 * @param {boolean} [props.isSubmitting=false] - Submission in progress
 * @param {boolean} [props.isSubmitted=false] - Report already submitted
 * @param {() => void} props.onSubmit - Submit handler
 * @param {() => void} props.onEditAnalysis - Edit analysis handler
 */
export default function SubmitReportCard({
  damageType = '',
  severity = '',
  confidence = 0,
  priority = '',
  repairCost = 0,
  roadName = '',
  address = '',
  isSubmitting = false,
  isSubmitted = false,
  onSubmit,
  onEditAnalysis,
}) {
  const summaryRows = useMemo(() => [
    { key: 'damageType', label: 'Damage Type', icon: ShieldAlert, value: damageType },
    { key: 'severity', label: 'Severity', icon: Tag, value: severity },
    { key: 'confidence', label: 'Confidence', icon: CheckCircle2, value: confidence ? `${confidence}%` : 'N/A' },
    { key: 'priority', label: 'Priority', icon: ShieldAlert, value: priority },
    { key: 'repairCost', label: 'Est. Repair Cost', icon: Wallet, value: repairCost ? formatCurrency(repairCost) : 'N/A' },
    { key: 'roadName', label: 'Road Name', icon: Route, value: roadName },
    { key: 'address', label: 'Address', icon: MapPin, value: address },
  ], [damageType, severity, confidence, priority, repairCost, roadName, address]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label="Submit report"
    >
      <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success-500/5 via-transparent to-primary-500/5 dark:from-success-500/10 dark:to-primary-500/10 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10">
          <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
            Submit Damage Report
          </h3>
          <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
            Review the AI analysis and submit this report for processing.
          </p>

          {/* Summary rows */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summaryRows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800"
                >
                  <Icon size={16} className="shrink-0 text-secondary-400 dark:text-dark-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-2xs text-secondary-500 dark:text-dark-400">{row.label}</p>
                    <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
                      {row.value || 'N/A'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submitted confirmation */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-success-50 dark:bg-success-950/30 border border-success-200 dark:border-success-800 text-sm text-success-700 dark:text-success-300"
              role="status"
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Report submitted successfully. View it in Report History below.
            </motion.div>
          )}

          <Divider className="my-4" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <motion.div
              whileHover={isSubmitting || isSubmitted ? undefined : { scale: 1.02 }}
              whileTap={isSubmitting || isSubmitted ? undefined : { scale: 0.98 }}
              className="w-full sm:w-auto sm:flex-1"
            >
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitted}
                leftIcon={!isSubmitted ? Send : CheckCircle2}
                onClick={onSubmit}
                aria-label={isSubmitted ? 'Report already submitted' : 'Submit report'}
              >
                {isSubmitting ? 'Submitting Report...' : isSubmitted ? 'Submitted' : 'Submit Report'}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={PencilLine}
                onClick={onEditAnalysis}
                aria-label="Edit analysis"
              >
                Edit Analysis
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.section>
  );
}

