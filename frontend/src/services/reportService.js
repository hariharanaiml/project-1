import api, { getApiAssetUrl } from './api';

const STATUS_LABELS = {
  submitted: 'Submitted',
  pending: 'Pending',
  'in-review': 'In Review',
  verified: 'Verified',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const SEVERITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
  urgent: 'Urgent',
};

const DAMAGE_LABELS = {
  pothole: 'Pothole',
  crack: 'Crack',
  edge_failure: 'Edge Failure',
  surface_wear: 'Surface Defect',
  alligator_cracks: 'Alligator Cracks',
  rutting: 'Rutting',
  other: 'Other',
};

const ROAD_TYPE_LABELS = {
  highway: 'Highway',
  city_road: 'City Road',
  village_road: 'Village Road',
  bridge: 'Bridge',
  other: 'Other',
};

const titleCase = (value = '') =>
  String(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function normalizeReport(report = {}) {
  const status = STATUS_LABELS[report.status] || titleCase(report.status || 'Submitted');
  const severity = SEVERITY_LABELS[report.severity] || titleCase(report.severity || 'Unknown');
  const priority = PRIORITY_LABELS[report.priority] || titleCase(report.priority || 'Low');
  const damageType = DAMAGE_LABELS[report.damage_type] || titleCase(report.damage_type || 'Unknown');
  const roadType = ROAD_TYPE_LABELS[report.road_type] || titleCase(report.road_type || 'Other');
  const submittedDate = report.submitted_date || report.createdAt || report.created_at || new Date().toISOString();
  const latitude = report.latitude ?? null;
  const longitude = report.longitude ?? null;

  return {
    id: report.id || report.report_number || 'N/A',
    reportId: report.report_number || report.id || 'N/A',
    roadName: report.road_name || 'Unnamed Road',
    description: report.description || '',
    roadType,
    address: report.address || '',
    latitude,
    longitude,
    location: report.address
      ? { lat: latitude ?? 0, lng: longitude ?? 0 }
      : null,
    damageType,
    severity,
    priority,
    status,
    confidence: report.confidence ? Math.round(report.confidence * 100) : 0,
    estimatedRepairCost: report.estimated_repair_cost ? Number(report.estimated_repair_cost) : 0,
    createdAt: submittedDate,
    submittedDate: new Date(submittedDate).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    image: getApiAssetUrl(report.image_path),
    imagePath: report.image_path || null,
    reportNumber: report.report_number || report.id,
  };
}

export async function listReports(params = {}) {
  const response = await api.get('/reports', {
    params: {
      page: 1,
      page_size: 100,
      ...params,
    },
  });

  return (response.data || []).map(normalizeReport);
}

export async function createReport(payload) {
  const response = await api.post('/reports', payload);
  return normalizeReport(response.data);
}

export async function getReport(reportId) {
  const response = await api.get(`/reports/${reportId}`);
  return normalizeReport(response.data);
}

export async function updateReportStatus(reportId, status) {
  const response = await api.patch(`/reports/${reportId}/status`, { status });
  return normalizeReport(response.data);
}

export default {
  listReports,
  createReport,
  getReport,
  updateReportStatus,
  normalizeReport,
};
