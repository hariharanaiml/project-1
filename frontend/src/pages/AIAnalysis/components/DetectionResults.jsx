import { motion } from 'framer-motion';
import { ListChecks } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import SectionHeading from './SectionHeading';

/** Map severity → badge variant. */
const SEVERITY_VARIANT = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
  Critical: 'danger',
};

/** Map status → badge variant. */
const STATUS_VARIANT = {
  Confirmed: 'success',
  Verified: 'info',
  Pending: 'warning',
  Rejected: 'danger',
};

/**
 * DetectionResults - Responsive table of AI-detected damages.
 *
 * @param {Object} props
 * @param {Array<{id: number, damageType: string, severity: string, confidence: number, riskScore: number, roadCondition: string, status: string}>} props.results - Detection rows
 */
export default function DetectionResults({ results = [] }) {
  return (
    <section aria-label="Detection results">
      <SectionHeading
        title="Detection Results"
        description="AI-detected damage instances with confidence and risk scoring."
        icon={ListChecks}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          bordered
          padding="none"
          className="relative overflow-hidden bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <caption className="sr-only">
                AI detection results including damage type, severity, confidence, risk score, road condition, and status
              </caption>
              <thead>
                <tr className="border-b border-secondary-100 dark:border-dark-800 bg-secondary-50/70 dark:bg-dark-800/40">
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400">
                    Damage Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400">
                    Severity
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400">
                    Confidence
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400">
                    Risk Score
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400">
                    Road Condition
                  </th>
                  <th scope="col" className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + index * 0.06 }}
                    className="border-b border-secondary-100 dark:border-dark-800 last:border-b-0 hover:bg-secondary-50/50 dark:hover:bg-dark-800/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-medium text-secondary-900 dark:text-dark-100">
                      {row.damageType}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={SEVERITY_VARIANT[row.severity] || 'default'} size="sm" pill>
                        {row.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary-700 dark:text-dark-200 tabular-nums">
                      {row.confidence}%
                    </td>
                    <td className="px-4 py-3 text-secondary-700 dark:text-dark-200 tabular-nums">
                      {row.riskScore}
                    </td>
                    <td className="px-4 py-3 text-secondary-700 dark:text-dark-200">
                      {row.roadCondition}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[row.status] || 'default'} size="sm" dot pill>
                        {row.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

