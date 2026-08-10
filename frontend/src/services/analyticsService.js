import { listReports } from './reportService';

const formatMonthLabel = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
  });

const formatStatusLabel = (status = '') => String(status).toLowerCase();

export async function getAnalyticsOverview() {
  const reports = await listReports({ page_size: 100 });

  const total = reports.length;
  const resolved = reports.filter((report) => formatStatusLabel(report.status) === 'resolved').length;
  const pending = reports.filter((report) => ['submitted', 'pending', 'in review'].includes(formatStatusLabel(report.status))).length;
  const critical = reports.filter((report) => formatStatusLabel(report.severity) === 'critical').length;

  const monthMap = new Map();
  reports.forEach((report) => {
    const month = formatMonthLabel(report.createdAt);
    const existing = monthMap.get(month) || { month, reports: 0 };
    existing.reports += 1;
    monthMap.set(month, existing);
  });

  const monthlyTrend = Array.from(monthMap.values()).slice(0, 12);

  const damageCounts = reports.reduce((acc, report) => {
    const key = report.damageType || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const damageTypeData = Object.entries(damageCounts).map(([name, value]) => ({ name, value }));

  const severityCounts = reports.reduce((acc, report) => {
    const key = report.severity || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const severityData = Object.entries(severityCounts).map(([severity, count]) => ({ severity, count }));

  const topLocations = reports
    .filter((report) => report.address)
    .reduce((acc, report) => {
      const key = report.address;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const locations = Object.entries(topLocations)
    .map(([roadName, count]) => ({ roadName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const recentActivities = reports.slice(0, 6).map((report) => ({
    id: report.id,
    user: 'RoadSense AI',
    time: report.submittedDate,
    roadName: report.roadName,
    damageType: report.damageType,
    status: report.status,
  }));

  return {
    overviewStats: {
      total,
      resolved,
      pending,
      critical,
    },
    monthlyTrend,
    damageTypeData,
    severityData,
    topLocations: locations,
    recentActivities,
  };
}

export default {
  getAnalyticsOverview,
};
