import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';

/**
 * ReportFilters - Search + status filter toolbar for the My Reports page.
 *
 * @param {Object} props
 * @param {string} props.search - Current search query
 * @param {string} props.status - Current status filter value
 * @param {(value: string) => void} props.onSearch - Search change handler
 * @param {(value: string) => void} props.onStatusChange - Status change handler
 * @param {() => void} props.onReset - Reset all filters
 * @param {Array<{value: string, label: string}>} props.statusOptions - Status options
 * @param {number} props.totalCount - Number of results after filtering
 */
export default function ReportFilters({
  search,
  status,
  onSearch,
  onStatusChange,
  onReset,
  statusOptions,
  totalCount,
}) {
  const handleStatus = useCallback(
    (event) => onStatusChange(event.target.value),
    [onStatusChange]
  );

  const hasActiveFilters = search.trim() !== '' || status !== 'all';

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
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-primary-500" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                Filters
              </h3>
              {totalCount > 0 && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 text-2xs font-medium rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                  {totalCount} {totalCount === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                leftIcon={RotateCcw}
                onClick={onReset}
                aria-label="Reset all filters"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Input
                type="search"
                label="Search"
                leftIcon={Search}
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search by report ID, road name, or damage type..."
                fullWidth
                aria-label="Search reports"
              />
            </div>
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={handleStatus}
              fullWidth
              aria-label="Filter by status"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

