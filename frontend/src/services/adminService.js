import api from './api';
import { listReports } from './reportService';

const normalizeUser = (user = {}) => ({
  id: user.id || user.email || Math.random().toString(36).slice(2, 9),
  name: user.name || user.email || 'Unknown User',
  email: user.email || 'unknown@example.com',
  role: user.role || 'user',
  status: user.status || 'active',
  joined: user.joined || 'Recently',
});

export async function getAdminOverview() {
  const response = await api.get('/admin/overview');
  return response.data;
}

export async function getRecentReports(limit = 8) {
  const reports = await listReports({ page_size: limit });
  return reports.map((report) => ({
    reportId: report.reportId,
    roadName: report.roadName,
    damageType: report.damageType,
    severity: report.severity,
    status: report.status,
    submittedDate: report.submittedDate,
  }));
}

export async function getPendingApprovals(limit = 5) {
  const reports = await listReports({ page_size: 100 });
  return reports
    .filter((report) =>
      ['submitted', 'pending', 'in review'].includes(String(report.status).toLowerCase()),
    )
    .slice(0, limit)
    .map((report) => ({
      reportId: report.reportId,
      roadName: report.roadName,
      submittedBy: '—',
      severity: report.severity,
      submittedDate: report.submittedDate,
    }));
}

/** Format an ISO timestamp as a short relative label. */
const formatRelative = (iso) => {
  if (!iso) return '—';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export async function getAdminActivities(limit = 5) {
  const reports = await listReports({ page_size: limit });
  return reports.map((report, index) => {
    const statusKey = String(report.status).toLowerCase();
    const type = statusKey === 'rejected' ? 'rejected' : statusKey === 'resolved' ? 'approved' : 'registered';
    const verb = statusKey === 'rejected' ? 'rejected' : statusKey === 'resolved' ? 'resolved' : 'submitted';
    return {
      id: index + 1,
      type,
      title: `Report ${report.reportId} ${verb}`,
      description: `${report.damageType} on ${report.roadName}`,
      timestamp: formatRelative(report.createdAt),
    };
  });
}

export async function getAdminUsers() {
  const response = await api.get('/admin/users');
  const payload = response.data || [];
  const users = Array.isArray(payload) ? payload : payload.users || [];
  return users.map(normalizeUser);
}

export async function getAdminSystemHealth() {
  const response = await api.get('/admin/system-health');
  const payload = response.data || [];
  return Array.isArray(payload) ? payload : payload.metrics || [];
}

export async function getDashboardOverview() {
  const response = await api.get('/dashboard/overview');
  return response.data;
}

export default {
  getAdminOverview,
  getRecentReports,
  getPendingApprovals,
  getAdminActivities,
  getAdminUsers,
  getAdminSystemHealth,
  getDashboardOverview,
};
