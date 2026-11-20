import api from './api';

/**
 * Map a raw damage label to a display-friendly title.
 * e.g. "alligator_crack" → "Alligator Crack", "pothole" → "Pothole"
 */
function titleCaseLabel(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Normalize a severity string to Title Case.
 * e.g. "low" → "Low", "critical" → "Critical"
 */
function titleCaseSeverity(value = '') {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

/**
 * Normalize a priority string to Title Case.
 * e.g. "urgent" → "Urgent", "medium" → "Medium"
 */
function titleCasePriority(value = '') {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

/**
 * Format a cost range for display.
 * Returns { min, max, currency, formatted } or null if no range.
 */
function formatCostRange(costRange, currency = 'INR') {
  if (!costRange || typeof costRange !== 'object') return null;
  const min = Number(costRange.min || 0);
  const max = Number(costRange.max || 0);
  if (min === 0 && max === 0) return null;
  return {
    min,
    max,
    currency,
    formatted: `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`,
  };
}

/**
 * Normalize the AI analysis result from either the real YOLO endpoint
 * (/ai/predict) or the mock endpoint (/ai/analyze) into a consistent
 * shape that the frontend components expect.
 *
 * @param {Object} result - Raw API response (already unwrapped by the
 *   axios response interceptor if it was wrapped in { data: ... }).
 * @returns {Object} Normalized result object.
 */
export function normalizeAIResult(result = {}) {
  const isRealAI = result.mock === false || result.model_loaded === true;
  const confidencePercent = Number(result.confidence || 0) * 100;

  // ── Damage type ──────────────────────────────────────────────────────────────
  const rawDamageType = result.damage_type || result.damageType || 'Unknown';
  const damageType = titleCaseLabel(rawDamageType);

  // ── Severity ─────────────────────────────────────────────────────────────────
  const rawSeverity = result.severity || result.severityLabel || 'Unknown';
  const severity = titleCaseSeverity(rawSeverity);

  // ── Priority ─────────────────────────────────────────────────────────────────
  const rawPriority = result.priority || result.repairPriority || 'Medium';
  const repairPriority = titleCasePriority(rawPriority);

  // ── Recommendation ───────────────────────────────────────────────────────────
  const repairRecommendation =
    result.summary || result.repair_method || result.repairRecommendation || '';

  // ── Cost ─────────────────────────────────────────────────────────────────────
  const costRange = formatCostRange(result.cost_range, result.currency || 'INR');
  const estimatedRepairCost = Number(
    result.estimated_repair_cost || result.estimatedRepairCost || 0,
  );

  // ── Cost breakdown ───────────────────────────────────────────────────────────
  const costBreakdown = result.cost_breakdown || {};
  const materialCost = Number(costBreakdown.material || costBreakdown.materialCost || 0);
  const laborCost = Number(costBreakdown.labour || costBreakdown.laborCost || 0);
  const equipmentCost = Number(costBreakdown.equipment || costBreakdown.equipmentCost || 0);

  // ── Detections (per-damage) ──────────────────────────────────────────────────
  const rawDetections = result.detections || [];
  const detections = rawDetections.map((det, index) => {
    const label = det.label || det.damage_type || 'Unknown';
    const conf = Number(det.confidence || 0);
    const bbox = det.bbox || [0, 0, 0, 0];
    return {
      id: det.id || index + 1,
      damageType: titleCaseLabel(label),
      label: titleCaseLabel(label),
      classId: det.class_id,
      confidence: Math.round(conf * 100),
      confidenceRaw: conf,
      boundingBox: bbox,
      bbox: bbox,
      severity: severity,
      severityScore: Number(result.risk_score || result.riskScore || 0),
      estimatedCost: costRange
        ? { min: costRange.min, max: costRange.max, currency: costRange.currency }
        : { min: 0, max: 0, currency: result.currency || 'INR' },
      recommendation: repairRecommendation,
      maintenancePriority: repairPriority,
    };
  });

  // ── Bounding boxes for overlay (normalized 0–1) ──────────────────────────────
  const boundingBoxes = (result.bounding_boxes || []).map((box, index) => ({
    id: `box-${index + 1}`,
    label: titleCaseLabel(box.label || 'Damage'),
    confidence: Math.round(Number(box.confidence || 0) * 100),
    x1: Number(box.x1 || 0),
    y1: Number(box.y1 || 0),
    x2: Number(box.x2 || 0),
    y2: Number(box.y2 || 0),
    left: Number(box.x1 || 0) * 100,
    top: Number(box.y1 || 0) * 100,
    width: Math.max((Number(box.x2 || 0) - Number(box.x1 || 0)) * 100, 1),
    height: Math.max((Number(box.y2 || 0) - Number(box.y1 || 0)) * 100, 1),
  }));

  // ── Duration ───────────────────────────────────────────────────────────────────
  const durationDays = result.expected_duration_days || result.expectedDurationDays;
  const duration = durationDays ? `${durationDays} days` : 'N/A';

  // ── Equipment ──────────────────────────────────────────────────────────────────
  const equipment = result.equipment || [];

  // ── Safety notes ───────────────────────────────────────────────────────────────
  const safetyNotes = result.notes || '';

  // ── Risk / damage scores ───────────────────────────────────────────────────────
  const riskScore = Number(result.risk_score || result.riskScore || 0);
  const overallDamageScore = Number(
    result.overall_damage_score || result.overallDamageScore || 0,
  );

  // ── Processing time ────────────────────────────────────────────────────────────
  const processingTimeMs = Number(result.processing_time_ms || 0);

  // ── Annotated image URL ────────────────────────────────────────────────────────
  const annotatedImageUrl = result.annotated_image_url || null;

  // ── Model info ─────────────────────────────────────────────────────────────────
  const modelVersion = result.model_version || result.modelVersion || 'mock';

  // ── Detection count ────────────────────────────────────────────────────────────
  const detectionCount = result.detection_count || detections.length;

  // ── Damage detected flag ───────────────────────────────────────────────────────
  const damageDetected = result.damage_detected ?? detections.length > 0;

  return {
    // Core fields
    damageType,
    severity,
    confidence: Math.round(confidencePercent),
    confidenceLabel: confidencePercent >= 85
      ? 'High'
      : confidencePercent >= 70
        ? 'Medium'
        : 'Low',
    confidenceRaw: confidencePercent,
    estimatedRepairCost,
    repairPriority,
    repairRecommendation,
    recommendedMethod: result.repair_method || result.recommendedMethod || '',
    duration,
    equipment,
    safetyNotes,
    materialCost,
    laborCost,
    equipmentCost,
    expectedResponse: result.expected_response || result.expectedResponse || '24-48 hours',
    roadName: result.roadName || '',
    roadType: result.roadType || 'Other',
    location: result.location || result.address || '',
    uploadTime: result.uploadTime || new Date().toISOString(),
    status: result.status || 'Pending Review',
    riskScore,
    overallDamageScore,
    reportId: result.report_id || result.reportId || '',
    analysisId: result.analysis_id || result.analysisId || '',
    modelVersion,

    // Real-AI specific fields
    isRealAI,
    mock: result.mock || false,
    detectionCount,
    damageDetected,
    detections,
    boundingBoxes,
    costRange,
    currency: result.currency || 'INR',
    costDisclaimer: result.cost_disclaimer || '',
    annotatedImageUrl,
    processingTimeMs,
    roadCondition: result.road_condition || '',
    modelLoaded: result.model_loaded || false,
    llmAvailable: result.llm_available || false,
    success: result.success !== undefined ? result.success : true,
    error: result.error || null,
  };
}

/**
 * Call the real YOLOv8 prediction endpoint.
 *
 * Sends the image as multipart/form-data to POST /ai/predict.
 * Does NOT manually set Content-Type — the browser/axios sets the
 * correct multipart boundary automatically.
 *
 * @param {File} file - The image file to analyze.
 * @returns {Promise<Object>} Normalized AI result.
 */
export async function predictImage(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (options.reportId) {
    formData.append('report_id', options.reportId);
  }

  const response = await api.post('/ai/predict', formData, {
    // Let the browser set the multipart/form-data Content-Type with boundary.
    timeout: 60000, // 60s — YOLO inference can take a while on CPU
  });

  return normalizeAIResult(response.data);
}

/**
 * Call the mock AI analysis endpoint (fallback).
 *
 * @param {Object} payload - { report_id, image_path }
 * @returns {Promise<Object>} Normalized AI result.
 */
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
  predictImage,
  analyzeReport,
  normalizeAIResult,
  getLatestAnalysis,
  getAnalysis,
  listAnalyses,
};
