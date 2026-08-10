import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, RotateCcw } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';

/**
 * AnalyticsFilters - UI-only filter panel (Date Range, Road Type, Severity, Status, Reset).
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {(key: string, value: string) => void} props.onFilterChange - Filter change handler
 * @param {() => void} props.onReset - Reset all filters
 * @param {Array<{value: string, label: string}>} props.dateRangeOptions - Date range options
 * @param {Array<{value: string, label: string}>} props.roadTypeOptions - Road type options
 * @param {Array<{value: string, label: string}>} props.severityOptions - Severity options
 * @param {Array<{value: string, label: string}>} props.statusOptions - Status options
 */
export default function AnalyticsFilters({
  filters,
  onFilterChange,
  onReset,
  dateRangeOptions,
  roadTypeOptions,
  severityOptions,
  statusOptions,
}) {
  const handleChange = useCallback(
    (key) => (event) => {
      onFilterChange(key, event.target.value);
    },
    [onFilterChange]
  );

  const hasActiveFilters = Object.values(filters).some((value) => value && value !== 'all');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
    >
      <Card bordered padding="none" className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-primary-500" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                Filters
              </h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters.dateRange}
              onChange={handleChange('dateRange')}
              fullWidth
              aria-label="Filter by date range"
            />
            <Select
              label="Road Type"
              options={roadTypeOptions}
              value={filters.roadType}
              onChange={handleChange('roadType')}
              fullWidth
              aria-label="Filter by road type"
            />
            <Select
              label="Severity"
              options={severityOptions}
              value={filters.severity}
              onChange={handleChange('severity')}
              fullWidth
              aria-label="Filter by severity"
            />
            <Select
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={handleChange('status')}
              fullWidth
              aria-label="Filter by status"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

