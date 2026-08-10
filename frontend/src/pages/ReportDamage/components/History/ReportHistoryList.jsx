import { memo } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../Shared/SectionHeader';
import ReportHistoryCard from './ReportHistoryCard';
import EmptyHistoryState from './EmptyHistoryState';
import { Badge } from '../../../../components/common/Badge';

/**
 * ReportHistoryList component - Displays all submitted reports with stagger animation.
 * Shows an empty state when there are no reports.
 *
 * @param {Object} props
 * @param {Array<Object>} props.reports - List of submitted reports
 * @param {() => void} props.onCreateFirstReport - Empty state action
 */
function ReportHistoryList({ reports, onCreateFirstReport }) {
  return (
    <section aria-label="Report history" className="scroll-mt-24">
      <SectionHeader
        title="Report History"
        description="All reports submitted from this device."
        delay={0.05}
        action={
          reports.length > 0 ? (
            <Badge variant="primary" size="sm" pill>
              {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
            </Badge>
          ) : undefined
        }
      />

      {reports.length === 0 ? (
        <EmptyHistoryState onCreateFirstReport={onCreateFirstReport} />
      ) : (
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
        >
          {reports.map((report) => (
            <ReportHistoryCard key={report.id} report={report} />
          ))}
        </motion.div>
      )}
    </section>
  );
}

export default memo(ReportHistoryList);

