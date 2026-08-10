import { memo } from 'react';
import { CheckCircle2, XCircle, UserPlus, Brain, DatabaseBackup, Activity } from 'lucide-react';
import { Card } from '../../../components/common/Card';

/** Icon + color map per activity type. */
const EVENT_STYLES = {
  approved: {
    icon: CheckCircle2,
    iconBg: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    dotBg: 'bg-success-500',
  },
  rejected: {
    icon: XCircle,
    iconBg: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
    dotBg: 'bg-danger-500',
  },
  registered: {
    icon: UserPlus,
    iconBg: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    dotBg: 'bg-primary-500',
  },
  ai: {
    icon: Brain,
    iconBg: 'bg-info-100 text-info-600 dark:bg-info-900/30 dark:text-info-400',
    dotBg: 'bg-info-500',
  },
  backup: {
    icon: DatabaseBackup,
    iconBg: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    dotBg: 'bg-warning-500',
  },
};

/**
 * AdminActivityTimeline - Vertical timeline of admin panel events.
 *
 * @param {Object} props
 * @param {Array<{id: number, type: string, title: string, description: string, timestamp: string}>} props.activities - Timeline events
 */
function AdminActivityTimeline({ activities = [] }) {
  return (
    <Card
      bordered
      padding="none"
      className="h-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl"
      aria-label="Admin activity timeline"
    >
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            Activity Timeline
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
          Recent admin actions and system events
        </p>
      </div>

      <ul
        className="px-4 sm:px-5 pb-4 space-y-0"
        role="list"
        aria-label="Activity events list"
      >
        {activities.map((event, index) => {
          const style = EVENT_STYLES[event.type] || EVENT_STYLES.approved;
          const Icon = style.icon;
          const isLast = index === activities.length - 1;

          return (
            <li key={event.id} className="relative flex gap-3">
              {/* Timeline connector */}
              {!isLast && (
                <span
                  className="absolute left-[15px] top-8 bottom-0 w-px bg-secondary-200 dark:bg-dark-700"
                  aria-hidden="true"
                />
              )}

              {/* Icon node */}
              <div className="relative flex flex-col items-center shrink-0">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${style.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon size={15} />
                </span>
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-secondary-900 dark:text-dark-100">
                    {event.title}
                  </p>
                  <span className="text-2xs text-secondary-400 dark:text-dark-500 shrink-0">
                    {event.timestamp}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                  {event.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default memo(AdminActivityTimeline);

