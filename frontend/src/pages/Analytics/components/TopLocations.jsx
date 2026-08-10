import { memo } from 'react';
import { Card } from '../../../components/common/Card';

/**
 * Compute the percentage width for a progress bar relative to the max count.
 * Returns a Tailwind arbitrary width class (no inline styles).
 *
 * @param {number} count - Road report count
 * @param {number} max - Maximum count in the list
 * @returns {string} Tailwind width class
 */
function barWidthClass(count, max) {
  if (!max) return 'w-0';
  const percent = Math.max(0, Math.min(100, Math.round((count / max) * 100)));
  return `w-[${percent}%]`;
}

/**
 * TopLocations - Top 10 damaged roads with progress bars.
 *
 * @param {Object} props
 * @param {Array<{roadName: string, count: number}>} props.locations - Top locations data
 */
function TopLocations({ locations = [] }) {
  const max = locations.length ? locations[0].count : 0;

  return (
    <Card
      bordered
      padding="none"
      className="h-full"
      aria-label="Top 10 damaged roads"
    >
      <div className="p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            Top Locations
          </h3>
          <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
            Top 10 roads with most damage reports
          </p>
        </div>

        <ul className="space-y-3.5" role="list" aria-label="Top damaged roads list">
          {locations.map((location, index) => (
            <li key={location.roadName}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-md text-2xs font-bold shrink-0 ${
                      index < 3
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'bg-secondary-100 text-secondary-500 dark:bg-dark-800 dark:text-dark-400'
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <p className="text-xs font-medium text-secondary-700 dark:text-dark-200 truncate">
                    {location.roadName}
                  </p>
                </div>
                <span className="text-xs font-semibold text-secondary-500 dark:text-dark-400 tabular-nums shrink-0">
                  {location.count}
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full bg-secondary-100 dark:bg-dark-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={location.count}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${location.roadName} report count`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 ${barWidthClass(
                    location.count,
                    max
                  )}`}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default memo(TopLocations);

