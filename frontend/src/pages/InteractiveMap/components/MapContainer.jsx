import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMapReports } from '../hooks/useMapReports';
import MiniStatistics from './MiniStatistics';
import LeafletMap from './LeafletMap';
import FilterPanel from './FilterPanel';
import SectionHeader from '../../ReportDamage/components/Shared/SectionHeader';
import { Alert } from '../../../components/common/Alert';

/**
 * MapContainer component - Orchestrates the interactive map with filters, statistics, and controls.
 */
export default function MapContainer() {
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    filteredReports,
    statistics,
    filters,
    setFilter,
    clearFilters,
    loading,
    error,
    SEVERITY_OPTIONS,
    STATUS_OPTIONS,
    DAMAGE_TYPE_OPTIONS,
  } = useMapReports();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page heading */}
      <SectionHeader
        title="Interactive Map"
        description="GIS-style visualization of reported road damages across India."
        delay={0.05}
      />

      {/* Load error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Alert variant="danger" title="Failed to load reports">
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Statistics cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <MiniStatistics
          total={statistics.total}
          critical={statistics.critical}
          resolved={statistics.resolved}
          pending={statistics.pending}
        />
      </motion.div>

      {/* Filter toggle + Result count (mobile) */}
      <div className="flex items-center justify-between lg:hidden">
        <FilterPanel
          filters={filters}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
          severityOptions={SEVERITY_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          damageTypeOptions={DAMAGE_TYPE_OPTIONS}
          isOpen={filterOpen}
          onToggle={() => setFilterOpen((prev) => !prev)}
        />
        <p className="text-xs text-secondary-500 dark:text-dark-400">
          {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
        </p>
      </div>

      {/* Map + Filters layout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        className="flex flex-col lg:flex-row gap-4 sm:gap-5"
      >
        {/* Filter panel (desktop) */}
        <div className="hidden lg:block">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilter}
            onClearFilters={clearFilters}
            severityOptions={SEVERITY_OPTIONS}
            statusOptions={STATUS_OPTIONS}
            damageTypeOptions={DAMAGE_TYPE_OPTIONS}
            isOpen={false}
            onToggle={() => {}}
          />
        </div>

        {/* Map */}
        <div className="relative flex-1 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
          <LeafletMap reports={filteredReports} />
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/70 dark:bg-dark-900/70 backdrop-blur-sm">
              <Loader2 size={28} className="animate-spin text-primary-500" aria-hidden="true" />
              <p className="text-sm font-medium text-secondary-600 dark:text-dark-300">
                Loading reports...
              </p>
            </div>
          )}
          {!loading && !error && filteredReports.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-dark-900/70 backdrop-blur-sm">
              <p className="text-sm font-medium text-secondary-600 dark:text-dark-300">
                No reports match your filters.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Status bar */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-xs text-secondary-400 dark:text-dark-500 text-center"
      >
        Showing {filteredReports.length} of {statistics.total} reports &middot; Data updates automatically
      </motion.p>
    </div>
  );
}
