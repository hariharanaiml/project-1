import { memo } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

/** Map report severity to badge variant. */
const severityVariant = (severity = '') => {
  const s = String(severity).toLowerCase();
  if (s === 'critical') return 'danger';
  if (s === 'high') return 'warning';
  if (s === 'medium') return 'info';
  return 'default'; // low
};

/**
 * PendingApprovals - List of reports awaiting admin approval with Approve/Reject actions.
 * UI only — no state mutation or backend calls.
 *
 * @param {Object} props
 * @param {Array<{reportId: string, roadName: string, submittedBy: string, severity: string, submittedDate: string}>} props.approvals - Pending approval items
 */
function PendingApprovals({ approvals = [] }) {
  return (
    <Card
      bordered
      padding="none"
      className="h-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl"
      aria-label="Pending approvals"
    >
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-warning-500" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
              Pending Approvals
            </h3>
          </div>
          <Badge variant="warning" size="xs" pill>
            {approvals.length} waiting
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
          Reports awaiting verification
        </p>
      </div>

      <ul
        className="px-4 sm:px-5 pb-4 space-y-4 max-h-[400px] overflow-y-auto"
        role="list"
        aria-label="Reports awaiting approval"
      >
        {approvals.map((approval) => (
          <li
            key={approval.reportId}
            className="rounded-lg border border-secondary-100 dark:border-dark-800 p-3 bg-secondary-50/60 dark:bg-dark-800/40"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
                {approval.roadName}
              </p>
              <Badge variant={severityVariant(approval.severity)} size="xs">
                {approval.severity}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-secondary-500 dark:text-dark-400">
              <span className="font-medium text-secondary-600 dark:text-dark-300">
                {approval.reportId}
              </span>{' '}
              · by {approval.submittedBy}
            </p>
            <p className="mt-0.5 text-2xs text-secondary-400 dark:text-dark-500">
              {approval.submittedDate}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="xs"
                leftIcon={CheckCircle2}
                aria-label={`Approve report ${approval.reportId}`}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="danger"
                size="xs"
                leftIcon={XCircle}
                aria-label={`Reject report ${approval.reportId}`}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default memo(PendingApprovals);

