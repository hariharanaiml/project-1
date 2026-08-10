/**
 * Mock profile data for the Profile page (Phase 10, Milestone 1).
 * Frontend only — no backend, no APIs. Will be replaced by a future API.
 */

/** Current user profile. */
export const userProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  role: 'Citizen',
  location: 'New Delhi, India',
  bio: 'Active citizen reporter helping keep local roads safe and well-maintained.',
  joinedDate: 'January 2025',
  status: 'online',
};

/** Account statistics shown on the profile page. */
export const accountStatistics = [
  {
    key: 'totalReports',
    label: 'Total Reports',
    value: 24,
    icon: 'FileText',
    color: 'text-primary-500',
    bg: 'bg-primary-50/70 dark:bg-primary-950/30',
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    value: 16,
    icon: 'CheckCircle2',
    color: 'text-success-500',
    bg: 'bg-success-50/70 dark:bg-success-950/30',
    iconBg: 'bg-success-100 dark:bg-success-900/30',
  },
  {
    key: 'pending',
    label: 'In Progress',
    value: 6,
    icon: 'Clock',
    color: 'text-warning-500',
    bg: 'bg-warning-50/70 dark:bg-warning-950/30',
    iconBg: 'bg-warning-100 dark:bg-warning-900/30',
  },
  {
    key: 'helpful',
    label: 'Helpful Votes',
    value: 42,
    icon: 'ThumbsUp',
    color: 'text-info-500',
    bg: 'bg-info-50/70 dark:bg-info-950/30',
    iconBg: 'bg-info-100 dark:bg-info-900/30',
  },
];

