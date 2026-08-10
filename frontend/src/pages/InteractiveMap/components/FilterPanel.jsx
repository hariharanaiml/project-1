import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Select } from '../../../components/common/Select';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';

/**
 * FilterPanel component - Sidebar filters for the interactive map.
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter values { severity, status, damageType, date, search }
 * @param {(key: string, value: string) => void} props.onFilterChange - Filter change handler
 * @param {() => void} props.onClearFilters - Clear all filters handler
 * @param {string[]} props.severityOptions - Available severity options
 * @param {string[]} props.statusOptions - Available status options
 * @param {string[]} props.damageTypeOptions - Available damage type options
 * @param {boolean} props.isOpen - Whether the filter panel is open (mobile)
 * @param {() => void} props.onToggle - Toggle filter panel visibility
 */
export default function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  severityOptions,
  statusOptions,
  damageTypeOptions,
  isOpen,
  onToggle,
}) {
  const handleChange = useCallback((key) => (e) => {
    onFilterChange(key, e.target ? e.target.value : e);
  }, [onFilterChange]);

  const handleSearchChange = useCallback((e) => {
    onFilterChange('search', e.target.value);
  }, [onFilterChange]);

  const severitySelect = severityOptions.map((s) => ({ value: s, label: s }));
  const statusSelect = statusOptions.map((s) => ({ value: s, label: s }));
  const damageTypeSelect = damageTypeOptions.map((d) => ({ value: d, label: d }));

  const hasActiveFilters = filters.severity || filters.status || filters.damageType || filters.date || filters.search;

  const filterContent = (
    <div className="space-y-4">
      {/* Search */}
      <Input
        label="Search Road"
        placeholder="Search by road name..."
        leftIcon={Search}
        value={filters.search}
        onChange={handleSearchChange}
        fullWidth
        aria-label="Search road name"
      />

      {/* Severity */}
      <Select
        label="Severity"
        placeholder="All Severities"
        options={severitySelect}
        value={filters.severity}
        onChange={handleChange('severity')}
        fullWidth
        aria-label="Filter by severity"
      />

      {/* Status */}
      <Select
        label="Status"
        placeholder="All Statuses"
        options={statusSelect}
        value={filters.status}
        onChange={handleChange('status')}
        fullWidth
        aria-label="Filter by status"
      />

      {/* Damage Type */}
      <Select
        label="Damage Type"
        placeholder="All Types"
        options={damageTypeSelect}
        value={filters.damageType}
        onChange={handleChange('damageType')}
        fullWidth
        aria-label="Filter by damage type"
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={filters.date}
        onChange={handleChange('date')}
        fullWidth
        aria-label="Filter by date"
      />

      {/* Clear */}
      {hasActiveFilters && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth
            leftIcon={RotateCcw}
            onClick={onClearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary-600 dark:text-dark-300 bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={isOpen ? 'Close filter panel' : 'Open filter panel'}
        aria-expanded={isOpen}
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        Filters
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" aria-hidden="true" />
        )}
      </button>

      {/* Desktop sidebar panel */}
      <aside
        className="hidden lg:block w-64 shrink-0"
        aria-label="Map filters"
      >
        <Card padding="md" bordered>
          {filterContent}
        </Card>
      </aside>

      {/* Mobile drawer panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onToggle}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-dark-900 shadow-2xl lg:hidden overflow-y-auto"
              aria-label="Filter panel"
            >
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-dark-700">
                <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">Filters</h3>
                <button
                  type="button"
                  onClick={onToggle}
                  className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-dark-200 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-label="Close filter panel"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="p-4">{filterContent}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
