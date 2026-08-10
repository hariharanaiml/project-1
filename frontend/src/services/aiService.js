import api from './api';

export function normalizeAIResult(result = {}) {
  const confidencePercent = Number(result.confidence || 0) * 100;

  const damageType = result.damage_type || result.damageType || 'Unknown';
  const severity = result.severity || result.severityLabel || 'Unknown';
  const priority = result.priority || result.repairPriority || 'Medium';
  const repairRecommendation = result.summary || result.repair_method || result.repairRecommendation || '';

  return {
    damageType: damageType.charAt(0).toUpperCase() + damageType.slice(1).replace(/_/g, ' '),
    severity: severity.charAt(0).toUpperCase() + severity.slice(1),
    confidence: Math.round(confidencePercent),
    confidenceLabel: confidencePercent >= 85 ? 'High' : confidencePercent >= 70 ? 'Medium' : 'Low',
    estimatedRepairCost: Number(result.estimated_repair_cost || result.estimatedRepairCost || 0),
    repairPriority: priority.charAt(0).toUpperCase() + priority.slice(1),
    repairRecommendation,
    recommendedMethod: result.repair_method || result.recommendedMethod || '',
    duration: result.expected_duration_days ? `${result.expected_duration_days} days` : 'N/A',
    equipment: result.equipment || ['Road Patch Kit'],
    safetyNotes: result.notes || '',
    materialCost: result.materialCost || 0,
    laborCost: result.laborCost || 0,
    equipmentCost: result.equipmentCost || 0,
    expectedResponse: result.expected_response || result.expectedResponse || '24-48 hours',
    roadName: result.roadName || '',
    roadType: result.roadType || 'Other',
    location: result.location || result.address || '',
    uploadTime: result.uploadTime || new Date().toISOString(),
    status: result.status || 'Pending Review',
    riskScore: Number(result.risk_score || result.riskScore || 0),
    overallDamageScore: Number(result.overall_damage_score || result.overallDamageScore || 0),
    reportId: result.report_id || result.reportId || '',
    analysisId: result.analysis_id || result.analysisId || '',
    modelVersion: result.model_version || result.modelVersion || 'mock',
  };
}

export async function analyzeReport(payload) {
  const response = await api.post('/ai/analyze', payload);
  return normalizeAIResult(response.data);
}

export async function getLatestAnalysis() {
  const response = await api.get('/ai/analyses/latest');
  return response.data;
}

export async function getAnalysis(analysisId) {
  const response = await api.get(`/ai/analyses/${analysisId}`);
  return response.data;
}

export async function listAnalyses(params = {}) {
  const response = await api.get('/ai/analyses', { params });
  return response.data;
}

export default {
  analyzeReport,
  normalizeAIResult,
  getLatestAnalysis,
  getAnalysis,
  listAnalyses,
};
