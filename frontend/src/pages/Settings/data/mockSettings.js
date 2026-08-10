/**
 * Mock settings data for the Settings page (Phase 10, Milestone 1).
 * Frontend only — no backend, no APIs. Will be replaced by a future API.
 */

/** Theme appearance options. */
export const themeOptions = [
  { value: 'dark', label: 'Dark', description: 'Easier on the eyes in low light.' },
  { value: 'light', label: 'Light', description: 'Bright and clean interface.' },
  { value: 'system', label: 'System', description: 'Follow your device appearance.' },
];

/** Notification preference toggles. */
export const notificationPreferences = [
  {
    key: 'reportUpdates',
    title: 'Report Status Updates',
    description: 'Get notified when the status of your reports changes.',
    enabled: true,
  },
  {
    key: 'aiAnalysis',
    title: 'AI Analysis Results',
    description: 'Receive alerts when AI analysis completes for your submissions.',
    enabled: true,
  },
  {
    key: 'maintenance',
    title: 'Maintenance Alerts',
    description: 'Be notified about scheduled road maintenance in your area.',
    enabled: false,
  },
  {
    key: 'community',
    title: 'Community Activity',
    description: 'Updates on reports and comments from nearby citizens.',
    enabled: true,
  },
];

/** Language selection options. */
export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
];

/** Privacy toggle options. */
export const privacySettings = [
  {
    key: 'publicProfile',
    title: 'Public Profile',
    description: 'Allow other users to see your name and submitted reports.',
    enabled: true,
  },
  {
    key: 'shareLocation',
    title: 'Share Location',
    description: 'Allow reports to include your approximate location.',
    enabled: true,
  },
  {
    key: 'emailDigest',
    title: 'Email Digest',
    description: 'Receive a weekly summary of your activity via email.',
    enabled: false,
  },
  {
    key: 'analytics',
    title: 'Anonymous Analytics',
    description: 'Help improve RoadSense AI with anonymized usage data.',
    enabled: true,
  },
];

/** Account preference options. */
export const accountPreferences = [
  {
    key: 'autoSaveReports',
    title: 'Auto-save draft reports',
    description: 'Keep in-progress reports so you never lose your work.',
    enabled: true,
  },
  {
    key: 'highContrast',
    title: 'High contrast mode',
    description: 'Increase contrast for better visibility.',
    enabled: false,
  },
  {
    key: 'reducedMotion',
    title: 'Reduce motion',
    description: 'Minimize animations across the interface.',
    enabled: false,
  },
  {
    key: 'compactView',
    title: 'Compact density',
    description: 'Show more content on screen with a denser layout.',
    enabled: false,
  },
];

