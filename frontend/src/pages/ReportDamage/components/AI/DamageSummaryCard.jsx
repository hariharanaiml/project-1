import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, Calendar, AlertTriangle, BadgeCheck } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import SectionHeader from '../Shared/SectionHeader';
import { useCountUp } from '../../../../hooks/useCountUp';

/**
 * DamageSummaryCard component - Summarizes the damage report details.
 *
 * @param {Object} props
 * @param {string} [props.roadName] - Road name
 * @param {string} [props.roadType] - Type of road
 * @param {string} [props.damageType] - Detected damage type
 * @param {string} [props.severity] - Severity level
 * @param {string} [props.location] - Location description
 * @param {string} [props.uploadTime] - ISO upload timestamp
 * @param {string} [props.status] - Report status
 * @param {number} [props.overallDamageScore=0] - Overall damage score (0-100)
 */
export default function DamageSummaryCard({
  roadName = '',
  roadType = '',
  damageType = '',
  severity = '',
  location = '',
  uploadTime = '',
  status = '',
  overallDamageScore = 0,
}) {
  const { count: animatedScore, ref } = useCountUp(overallDamageScore, 1400, 300);

  const summaryData = useMemo(() => [
    { key: 'roadName', label: 'Road Name', icon: Route, value: roadName },
    { key: 'roadType', label: 'Road Type', icon: MapPin, value: roadType },
    { key: 'location', label: 'Location', icon: MapPin, value: location },
    {
      key: 'uploadTime',
      label: 'Uploaded',
      icon: Calendar,
      value: uploadTime
        ? new Date(uploadTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    },
  ], [roadName, roadType, location, uploadTime]);

  return (
    <section aria-label="Damage report summary">
      <SectionHeader
        title="Report Summary"
        description="Overview of the damage report details."
        delay={0.05}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-3">
            {/* Status badge */}
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-primary-500" aria-hidden="true" />
                  <span className="text-xs font-medium text-secondary-600 dark:text-dark-300">Status</span>
                </div>
                <Badge variant="primary" size="sm" pill>
                  {status}
                </Badge>
              </motion.div>
            )}

            {/* Damage type + severity badges */}
            {(damageType || severity) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
              >
                <AlertTriangle size={14} className="text-secondary-400" aria-hidden="true" />
                <span className="text-xs text-secondary-600 dark:text-dark-300">Detected:</span>
                {damageType && (
                  <Badge variant="primary" size="sm" pill>
                    {damageType}
                  </Badge>
                )}
                {severity && (
                  <Badge
                    variant={
                      severity === 'Critical' || severity === 'High'
                        ? 'danger'
                        : severity === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                    pill
                  >
                    {severity}
                  </Badge>
                )}
              </motion.div>
            )}

            {/* Overall damage score */}
            {overallDamageScore > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.22 }}
                ref={ref}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
              >
                <span className="text-xs text-secondary-600 dark:text-dark-300">Overall Damage Score</span>
                <span className="text-sm font-bold text-secondary-900 dark:text-dark-100 tabular-nums">
                  {animatedScore}/100
                </span>
              </motion.div>
            )}

            {/* Summary details */}
            <div className="space-y-2">
              {summaryData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800"
                  >
                    <Icon size={16} className="shrink-0 text-secondary-400 dark:text-dark-500" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-2xs text-secondary-500 dark:text-dark-400">{item.label}</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
                        {item.value || 'N/A'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

