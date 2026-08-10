import { memo } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';

/** Map activity status to badge variant. */
const statusVariant = (status = '') => {
  const s = String(status).toLowerCase();
  if (s === 'resolved' || s === 'completed') return 'success';
  if (s === 'critical') return 'danger';
  if (s === 'in review') return 'info';
  if (s === 'pending') return 'warning';
  return 'primary';
};

/**
 * RecentActivity - Scrollable timeline of the latest reports.
 *
 * @param {Object} props
 * @param {Array<{id: number, user: string, time: string, roadName: string, damageType: string, status: string}>} props.activities - Recent activity items
 */
function RecentActivity({ activities = [] }) {
  return (
    <Card
      bordered
      padding="none"
      className="h-full"
      aria-label="Recent activity timeline"
    >
      <div className="p-4 sm:p-5 pb-3">
        <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
          Recent Activity
        </h3>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
          Latest damage reports
        </p>
      </div>

      <ul
        className="px-4 sm:px-5 pb-4 space-y-4 max-h-[340px] overflow-y-auto"
        role="list"
        aria-label="Recent reports list"
      >
        {activities.map((activity) => (
          <li key={activity.id} className="relative flex gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center shrink-0" aria-hidden="true">
              <Avatar name={activity.user} size="sm" />
              <span className="w-px flex-1 bg-secondary-200 dark:bg-dark-700 my-1" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
                  {activity.roadName}
                </p>
                <Badge variant={statusVariant(activity.status)} size="xs" pill>
                  {activity.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                {activity.damageType} · Reported by {activity.user}
              </p>
              <p className="mt-0.5 text-2xs text-secondary-400 dark:text-dark-500">
                {activity.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default memo(RecentActivity);

