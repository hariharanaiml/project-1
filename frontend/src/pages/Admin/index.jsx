import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import AdminOverviewCards from './components/AdminOverviewCards';
import RecentReportsTable from './components/RecentReportsTable';
import PendingApprovals from './components/PendingApprovals';
import SystemHealthCard from './components/SystemHealthCard';
import UserManagement from './components/UserManagement';
import AdminActivityTimeline from './components/AdminActivityTimeline';
import {
  getAdminOverview,
  getRecentReports,
  getPendingApprovals,
  getAdminActivities,
  getAdminUsers,
  getAdminSystemHealth,
} from '../../services/adminService';
import { Alert } from '../../components/common/Alert';
import { Card } from '../../components/common/Card';

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

export default function Admin() {
  const [overview, setOverview] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminActivities, setAdminActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    Promise.all([
      getAdminOverview(),
      getRecentReports(),
      getPendingApprovals(),
      getAdminSystemHealth(),
      getAdminUsers(),
      getAdminActivities(),
    ])
      .then(([overviewData, reports, approvals, health, users, activities]) => {
        if (cancelled) return;
        setOverview(overviewData);
        setRecentReports(reports);
        setPendingApprovals(approvals);
        setSystemHealth(health);
        setAdminUsers(users);
        setAdminActivities(activities);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load admin data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout pageTitle="Admin">
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
            Admin
          </span>
        </motion.nav>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            Admin Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400">
            Platform administration, report moderation, and system monitoring.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={fadeUp}>
            <Alert variant="danger" title="Failed to load admin data">
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
                Loading admin data...
              </p>
            </Card>
          </motion.div>
        )}

        {/* Content */}
        {!loading && !error && overview && (
          <>
            {/* Overview cards */}
            <motion.div variants={fadeUp}>
              <AdminOverviewCards
                totalReports={overview.totalReports}
                pendingVerification={overview.pendingVerification}
                reportsResolved={overview.reportsResolved}
                activeUsers={overview.activeUsers}
              />
            </motion.div>

            {/* Recent reports + pending approvals */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              <div className="lg:col-span-2 min-w-0">
                <RecentReportsTable reports={recentReports} />
              </div>
              <div className="min-w-0">
                <PendingApprovals approvals={pendingApprovals} />
              </div>
            </motion.div>

            {/* System health + user management */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              <div className="min-w-0">
                <SystemHealthCard metrics={systemHealth} />
              </div>
              <div className="lg:col-span-2 min-w-0">
                <UserManagement users={adminUsers} />
              </div>
            </motion.div>

            {/* Activity timeline */}
            <motion.div variants={fadeUp}>
              <AdminActivityTimeline activities={adminActivities} />
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
