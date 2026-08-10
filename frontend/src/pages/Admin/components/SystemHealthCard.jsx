import { memo } from 'react';
import { Activity, Cpu, Database, HardDrive, Timer, Archive } from 'lucide-react';
import { Card } from '../../../components/common/Card';

/** Icon map for each system health metric. */
const ICON_MAP = {
  aiServer: Cpu,
  database: Database,
  storage: HardDrive,
  api: Timer,
  backup: Archive,
};

/** Status color classes (dot + icon + label). */
const STATUS_STYLES = {
  success: {
    dot: 'bg-success-500',
    text: 'text-success-600 dark:text-success-400',
    iconBg: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    label: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300',
  },
  warning: {
    dot: 'bg-warning-500',
    text: 'text-warning-600 dark:text-warning-400',
    iconBg: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    label: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  },
  danger: {
    dot: 'bg-danger-500',
    text: 'text-danger-600 dark:text-danger-400',
    iconBg: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
    label: 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300',
  },
};

/**
 * SystemHealthCard - Displays infrastructure health metrics with colored indicators.
 *
 * @param {Object} props
 * @param {Array<{key: string, label: string, status: string, statusLabel: string, detail: string, meta: string, progress?: number, barClass?: string}>} props.metrics - Health metrics
 */
function SystemHealthCard({ metrics = [] }) {
  return (
    <Card
      bordered
      padding="none"
      className="h-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl"
      aria-label="System health"
    >
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-primary-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            System Health
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
          Live infrastructure overview
        </p>
      </div>

      <ul className="px-4 sm:px-5 pb-4 space-y-3" role="list" aria-label="System health metrics">
        {metrics.map((metric) => {
          const Icon = ICON_MAP[metric.key] || Activity;
          const style = STATUS_STYLES[metric.status] || STATUS_STYLES.success;
          return (
            <li
              key={metric.key}
              className="rounded-lg border border-secondary-100 dark:border-dark-800 p-3 bg-secondary-50/60 dark:bg-dark-800/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${style.iconBg}`}
                    aria-hidden="true"
                  >
                    <Icon size={16} />
                  </span>
                  <p className="text-xs font-medium text-secondary-700 dark:text-dark-200 truncate">
                    {metric.label}
                  </p>
                </div>
                <span className={`text-xs font-semibold tabular-nums shrink-0 ${style.text}`}>
                  {metric.statusLabel}
                </span>
              </div>

              {metric.progress != null ? (
                <>
                  <div
                    className="mt-3 h-1.5 w-full rounded-full bg-secondary-100 dark:bg-dark-700 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={metric.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${metric.label} usage`}
                  >
                    <div
                      className={`h-full rounded-full ${
                        metric.status === 'warning'
                          ? 'bg-gradient-to-r from-warning-400 to-warning-500'
                          : metric.status === 'danger'
                          ? 'bg-gradient-to-r from-danger-400 to-danger-500'
                          : 'bg-gradient-to-r from-success-400 to-success-500'
                      }`}
                      style={{ width: `${metric.progress ?? 0}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-2xs text-secondary-500 dark:text-dark-400">{metric.detail}</p>
                    <p className="text-2xs font-medium text-secondary-500 dark:text-dark-400 tabular-nums">
                      {metric.meta}
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-2xs text-secondary-500 dark:text-dark-400">{metric.detail}</p>
                  <p className="text-2xs font-medium text-secondary-500 dark:text-dark-400 tabular-nums">
                    {metric.meta}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export default memo(SystemHealthCard);

