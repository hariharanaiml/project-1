import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import ReportFilters from './components/ReportFilters';
import ReportsTable from './components/ReportsTable';
import ReportDetailModal from './components/ReportDetailModal';
import Pagination from './components/Pagination';
import EmptyReportsState from './components/EmptyReportsState';
import { mockReports, statusOptions } from './data/mockReports';

/** Number of reports shown per page. */
const PAGE_SIZE = 6;

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

export default function MyReports() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mockReports.filter((report) => {
      const matchesStatus = status === 'all' || report.status === status;
      const matchesSearch =
        !query ||
        report.id.toLowerCase().includes(query) ||
        report.roadName.toLowerCase().includes(query) ||
        report.damageType.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));

  // Keep the current page in range when filters shrink the result set.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, safePage]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearch('');
    setStatus('all');
    setCurrentPage(1);
  }, []);

  return (
    <DashboardLayout pageTitle="My Reports">
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
            My Reports
          </span>
        </motion.nav>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            My Reports
          </h1>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400">
            Track the status and progress of all your submitted road damage reports.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeUp}>
          <ReportFilters
            search={search}
            status={status}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            onReset={handleReset}
            statusOptions={statusOptions}
            totalCount={filteredReports.length}
          />
        </motion.div>

        {/* Table / Empty state */}
        {filteredReports.length === 0 ? (
          <motion.div variants={fadeUp}>
            <EmptyReportsState />
          </motion.div>
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <ReportsTable reports={paginatedReports} onView={setSelectedReport} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredReports.length}
                pageSize={PAGE_SIZE}
              />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Detail modal */}
      <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </DashboardLayout>
  );
}

