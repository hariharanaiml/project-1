import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import OverviewCards from './components/OverviewCards';
import AnalyticsFilters from './components/AnalyticsFilters';
import ReportsTrendChart from './components/ReportsTrendChart';
import DamageTypeChart from './components/DamageTypeChart';
import SeverityChart from './components/SeverityChart';
import TopLocations from './components/TopLocations';
import RecentActivity from './components/RecentActivity';
import { getAnalyticsOverview } from '../../services/analyticsService';
import { Alert } from '../../components/common/Alert';
import { Card } from '../../components/common/Card';

/** Filter option lists (UI only). */
const dateRangeOptions = [
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'last12m', label: 'Last 12 Months' },
];

const roadTypeOptions = [
  { value: 'all', label: 'All Road Types' },
  { value: 'highway', label: 'Highway' },
  { value: 'city', label: 'City Road' },
  { value: 'village', label: 'Village Road' },
  { value: 'bridge', label: 'Bridge' },
];

const severityFilterOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const statusFilterOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'inReview', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'critical', label: 'Critical' },
];

/** Initial UI-only filter state. */
const INITIAL_FILTERS = {
  dateRange: 'last12m',
  roadType: 'all',
  severity: 'all',
  status: 'all',
};

/** Stagger container for page sections. */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Fade-up animation for each child. */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Analytics() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getAnalyticsOverview()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load analytics.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return (
    <DashboardLayout pageTitle="Analytics">
      <motion.div
        className="space-y-6 sm:space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Breadcrumb */}
        <motion.nav
          variants={fadeUp}
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-secondary-500 dark:text-dark-400"
        >
          <Link
            to="/dashboard"
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-secondary-400 dark:text-dark-500" aria-hidden="true" />
          <span aria-current="page" className="font-medium text-secondary-700 dark:text-dark-200">
            Analytics
          </span>
        </motion.nav>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            Analytics Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400">
            Data-driven insights on road damage reports, severity, and maintenance trends.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={fadeUp}>
            <Alert variant="danger" title="Failed to load analytics">
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div variants={fadeUp}>
            <Card bordered className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 size={28} className="animate-spin text-primary-500" aria-hidden="true" />
              <p className="text-sm font-medium text-secondary-600 dark:text-dark-300">
                Loading analytics...
              </p>
            </Card>
          </motion.div>
        )}

        {/* Content */}
        {!loading && data && (
          <>
            {/* Overview cards */}
            <motion.div variants={fadeUp}>
              <OverviewCards
                total={data.overviewStats.total}
                resolved={data.overviewStats.resolved}
                pending={data.overviewStats.pending}
                critical={data.overviewStats.critical}
              />
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeUp}>
              <AnalyticsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                dateRangeOptions={dateRangeOptions}
                roadTypeOptions={roadTypeOptions}
                severityOptions={severityFilterOptions}
                statusOptions={statusFilterOptions}
              />
            </motion.div>

            {/* Charts grid */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
            >
              <ReportsTrendChart data={data.monthlyTrend} />
              <DamageTypeChart data={data.damageTypeData} />
              <SeverityChart data={data.severityData} />
              <TopLocations locations={data.topLocations} />
            </motion.div>

            {/* Recent activity */}
            <motion.div variants={fadeUp}>
              <RecentActivity activities={data.recentActivities} />
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
