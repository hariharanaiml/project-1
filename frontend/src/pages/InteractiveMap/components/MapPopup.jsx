import { memo } from 'react';
import { Calendar, Tag, ExternalLink } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

/** Map severity to badge variant. */
const severityVariant = (severity = '') => {
  const s = String(severity).toLowerCase();
  if (s === 'critical' || s === 'high') return 'danger';
  if (s === 'medium') return 'warning';
  return 'success';
};

/** Map status to badge variant. */
const statusVariant = (status = '') => {
  const s = String(status).toLowerCase();
  if (s === 'resolved' || s === 'completed') return 'success';
  if (s === 'in review') return 'info';
  if (s === 'pending') return 'warning';
  return 'primary';
};

/**
 * MapPopup component - Content displayed inside Leaflet marker popups.
 *
 * @param {Object} props
 * @param {Object} props.report - Report object with id, roadName, damageType, severity, date, status, priority
 */
function MapPopup({ report }) {
  const { roadName, damageType, severity, date, status } = report;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <div className="min-w-[200px] max-w-[260px]" role="dialog" aria-label={`Report details for ${roadName}`}>
      <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 truncate mb-2">
        {roadName || 'Unnamed Road'}
      </h4>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-dark-300">
          <Tag size={12} className="shrink-0 text-secondary-400" aria-hidden="true" />
          <span className="truncate">{damageType || 'Unknown Damage'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-dark-300">
          <Calendar size={12} className="shrink-0 text-secondary-400" aria-hidden="true" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <Badge variant={severityVariant(severity)} size="xs" pill>
            {severity || 'Unknown'}
          </Badge>
          <Badge variant={statusVariant(status)} size="xs" pill>
            {status || 'Unknown'}
          </Badge>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-secondary-100 dark:border-dark-700">
        <Button
          type="button"
          variant="primary"
          size="xs"
          fullWidth
          rightIcon={ExternalLink}
          aria-label={`View details for report ${report.id}`}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

export default memo(MapPopup);
