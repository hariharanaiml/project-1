import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoForm from './components/PersonalInfoForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import AccountStatistics from './components/AccountStatistics';
import { userProfile, accountStatistics } from './data/mockProfile';

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

export default function Profile() {
  return (
    <DashboardLayout pageTitle="Profile">
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
            Profile
          </span>
        </motion.nav>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            My Profile
          </h1>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400">
            Manage your personal information and account security.
          </p>
        </motion.div>

        {/* Hero header */}
        <motion.div variants={fadeUp}>
          <ProfileHeader profile={userProfile} />
        </motion.div>

        {/* Account statistics */}
        <motion.div variants={fadeUp}>
          <AccountStatistics stats={accountStatistics} />
        </motion.div>

        {/* Personal info + change password */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
        >
          <div className="min-w-0">
            <PersonalInfoForm profile={userProfile} />
          </div>
          <div className="min-w-0">
            <ChangePasswordForm />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

