import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Calendar, Tag } from 'lucide-react';
import { Badge } from '../../../../components/common/Badge';

/** Framer Motion variants inherited from the parent stagger container. */
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/** Map a report status to the Badge color variant. */
const STATUS_VARIANTS = {
  Submitted: 'primary',
  Pending: 'warning',
  'In Review': 'info',
  Resolved: 'success',
  Completed: 'success',
};

/** Map a severity level to the Badge color variant. */
const severityVariant = (severity = '') => {
  const s = String(severity).toLowerCase();
  if (s === 'critical' || s === 'high') return 'danger';
  if (s === 'medium') return 'warning';
  return 'success';
};

/** Format an ISO timestamp as a short date. */
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * ReportHistoryCard component - Single report entry in the history list.
 *
 * @param {Object} props
 * @param {Object} props.report - Report object (see useReportHistory contract)
 */
function ReportHistoryCard({ report }) {
  const {
    id,
    roadName,
    damageType,
    severity,
    priority,
    createdAt,
    status = 'Submitted',
    image,
  } = report;

  const statusVariant = useMemo(() => STATUS_VARIANTS[status] || 'default', [status]);

  return (
    <motion.article
      variants={itemVariants}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      aria-label={`Report ${id}`}
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        {/* Thumbnail */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-secondary-100 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
          {image ? (
            <img
              src={image}
              alt={`Road damage for ${roadName || 'report'}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-secondary-400 dark:text-dark-500">
              <ImageIcon size={24} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 truncate">
              {roadName || 'Unnamed Road'}
            </h4>
            <Badge variant={statusVariant} size="xs" pill className="transition-colors duration-300 shrink-0">
              {status}
            </Badge>
          </div>

          <p className="mt-1 text-xs text-secondary-500 dark:text-dark-400 flex items-center gap-1.5 truncate">
            <Tag size={12} aria-hidden="true" />
            {damageType || 'Unknown Damage'}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={severityVariant(severity)} size="xs" pill className="transition-colors duration-300">
              {severity || 'Unknown'}
            </Badge>
            <Badge variant="default" size="xs" pill className="transition-colors duration-300">
              {priority || 'Low'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 sm:px-5 pb-4 flex items-center justify-between gap-2 text-xs text-secondary-500 dark:text-dark-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={12} aria-hidden="true" />
          {formatDate(createdAt)}
        </span>
        <span className="font-mono text-2xs text-secondary-400 dark:text-dark-500 truncate">{id}</span>
      </div>
    </motion.article>
  );
}

export default memo(ReportHistoryCard);

