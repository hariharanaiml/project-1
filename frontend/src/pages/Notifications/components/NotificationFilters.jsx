import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

/**
 * NotificationFilters - Filter tabs (All / Unread / Read) + Mark all as read.
 *
 * @param {Object} props
 * @param {string} props.activeFilter - Current filter value
 * @param {(value: string) => void} props.onFilterChange - Filter change handler
 * @param {() => void} props.onMarkAllRead - Mark all as read handler
 * @param {number} props.unreadCount - Number of unread notifications
 * @param {Array<{value: string, label: string}>} props.filters - Filter options
 */
export default function NotificationFilters({
  activeFilter,
  onFilterChange,
  onMarkAllRead,
  unreadCount,
  filters,
}) {
  const handleFilter = useCallback(
    (value) => () => onFilterChange(value),
    [onFilterChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
    >
      <Card
        bordered
        padding="none"
        className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl"
      >
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filter tabs */}
          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-secondary-100 dark:bg-dark-800 w-fit"
            role="group"
            aria-label="Filter notifications"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={handleFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  activeFilter === filter.value
                    ? 'bg-white dark:bg-dark-900 text-secondary-900 dark:text-dark-100 shadow-sm'
                    : 'text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100'
                }`}
              >
                {filter.label}
                {filter.value === 'unread' && unreadCount > 0 && (
                  <Badge variant="primary" size="xs" pill>
                    {unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Mark all as read */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={Bell}
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

