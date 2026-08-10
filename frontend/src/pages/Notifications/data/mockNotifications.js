/**
 * Mock notifications data for the Notifications page (Phase 10, Milestone 1).
 * Frontend only — no backend, no APIs. Will be replaced by a future API.
 */

/** Notification filter tabs. */
export const notificationFilters = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

/** Mock notifications list. */
export const mockNotifications = [
  {
    id: 1,
    type: 'report',
    title: 'Report RS-1042 updated',
    message:
      'Your pothole report on MG Road, New Delhi has been marked as Pending and is awaiting verification.',
    timestamp: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'ai',
    title: 'AI analysis completed',
    message:
      'AI detection finished for Report RS-1041. Damage type: Crack, confidence 91%.',
    timestamp: '15 minutes ago',
    read: false,
  },
  {
    id: 3,
    type: 'maintenance',
    title: 'Maintenance scheduled',
    message:
      'Road maintenance is scheduled on Anna Salai, Chennai for the pothole cluster you reported.',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: 4,
    type: 'status',
    title: 'Report RS-1038 resolved',
    message:
      'Your report on Anna Salai, Chennai has been resolved. Thank you for helping keep roads safe!',
    timestamp: '3 hours ago',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    title: 'Welcome to RoadSense AI',
    message:
      'Thanks for joining! Submit your first damage report to help your community.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 6,
    type: 'report',
    title: 'Report RS-1039 needs review',
    message:
      'Your edge failure report on Park Street, Kolkata is now in review by the road authority.',
    timestamp: '1 day ago',
    read: false,
  },
  {
    id: 7,
    type: 'status',
    title: 'Report RS-1036 rejected',
    message:
      'Your report on SG Highway, Ahmedabad was rejected as a duplicate submission.',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 8,
    type: 'ai',
    title: 'New AI model deployed',
    message:
      'Detection model v2.4 is live with improved accuracy for surface wear detection.',
    timestamp: '3 days ago',
    read: true,
  },
];

