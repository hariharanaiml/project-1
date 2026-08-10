import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, BellRing } from 'lucide-react';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import NotificationFilters from './components/NotificationFilters';
import NotificationItem from './components/NotificationItem';
import EmptyNotificationsState from './components/EmptyNotificationsState';
import { mockNotifications, notificationFilters } from './data/mockNotifications';

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

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    if (activeFilter === 'unread') return notifications.filter((n) => !n.read);
    if (activeFilter === 'read') return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, activeFilter]);

  const handleMarkRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleFilterChange = useCallback((value) => {
    setActiveFilter(value);
  }, []);

  return (
    <DashboardLayout pageTitle="Notifications">
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
            Notifications
          </span>
        </motion.nav>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            Notifications
          </h1>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400">
            Stay up to date with your reports, AI analysis, and road maintenance.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeUp}>
          <NotificationFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onMarkAllRead={handleMarkAllRead}
            unreadCount={unreadCount}
            filters={notificationFilters}
          />
        </motion.div>

        {/* Summary */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-dark-400">
            <BellRing size={16} className="text-primary-500" aria-hidden="true" />
            <span>
              {unreadCount > 0
                ? `You have ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
                : 'All caught up — no unread notifications.'}
            </span>
          </div>
        </motion.div>

        {/* Notification list / empty state */}
        {visibleNotifications.length === 0 ? (
          <motion.div variants={fadeUp}>
            <EmptyNotificationsState />
          </motion.div>
        ) : (
          <motion.ul
            role="list"
            aria-label="Notifications list"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
            className="space-y-3 sm:space-y-4"
          >
            {visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}
          </motion.ul>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

