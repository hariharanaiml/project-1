import { DollarSign, Gauge, MapPin, Flag, Calendar } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';

/** Map report status to badge variant. */
const statusVariant = (status = '') => {
  const s = String(status).toLowerCase();
  if (s === 'resolved') return 'success';
  if (s === 'rejected') return 'danger';
  if (s === 'verified') return 'primary';
  if (s === 'submitted' || s === 'in-review') return 'info';
  return 'warning';
};

/** Map report severity to badge variant. */
const severityVariant = (severity = '') => {
  const s = String(severity).toLowerCase();
  if (s === 'critical') return 'danger';
  if (s === 'high') return 'warning';
  if (s === 'medium') return 'info';
  return 'default';
};

/** Format a kebab-case status key into a display label. */
const formatStatus = (status = '') =>
  String(status)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const detailItemClass =
  'rounded-lg bg-secondary-50 dark:bg-dark-800/60 border border-secondary-100 dark:border-dark-800 p-4';

const detailLabelClass = 'text-xs font-medium text-secondary-500 dark:text-dark-400';
const detailValueClass = 'mt-1 text-sm font-semibold text-secondary-900 dark:text-dark-100';

/**
 * ReportDetailModal - Detailed view of a single report.
 *
 * @param {Object} props
 * @param {Object|null} props.report - Selected report (or null)
 * @param {() => void} props.onClose - Close handler
 */
export default function ReportDetailModal({ report, onClose }) {
  if (!report) return null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Report ${report.id}`}
      description={report.roadName}
      size="lg"
    >
      <div className="space-y-5">
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2" aria-label="Report summary">
          <Badge variant={statusVariant(report.status)} size="sm" pill dot>
            {formatStatus(report.status)}
          </Badge>
          <Badge variant={severityVariant(report.severity)} size="sm" pill>
            {report.severity} Severity
          </Badge>
          <Badge variant="default" size="sm" pill>
            <Flag size={12} className="mr-1" aria-hidden="true" />
            {report.priority} Priority
          </Badge>
        </div>

        {/* Detail grid */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>Damage Type</dt>
            <dd className={detailValueClass}>{report.damageType}</dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>Submitted Date</dt>
            <dd className={`${detailValueClass} flex items-center gap-1.5`}>
              <Calendar size={14} className="text-secondary-400 dark:text-dark-500" aria-hidden="true" />
              {report.submittedDate}
            </dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>AI Confidence</dt>
            <dd className={`${detailValueClass} flex items-center gap-1.5`}>
              <Gauge size={14} className="text-primary-500" aria-hidden="true" />
              {report.confidence}%
            </dd>
          </div>
          <div className={detailItemClass}>
            <dt className={detailLabelClass}>Estimated Repair Cost</dt>
            <dd className={`${detailValueClass} flex items-center gap-1.5`}>
              <DollarSign size={14} className="text-success-500" aria-hidden="true" />
              {report.estimatedRepairCost > 0
                ? `$${report.estimatedRepairCost.toLocaleString()}`
                : 'N/A'}
            </dd>
          </div>
          <div className={`${detailItemClass} sm:col-span-2`}>
            <dt className={detailLabelClass}>Location</dt>
            <dd className={`${detailValueClass} flex items-center gap-1.5`}>
              <MapPin size={14} className="text-danger-500" aria-hidden="true" />
              {report.location ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}` : 'N/A'}
            </dd>
          </div>
        </dl>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            Description
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-secondary-600 dark:text-dark-300">
            {report.description}
          </p>
        </div>
      </div>
    </Modal>
  );
}

