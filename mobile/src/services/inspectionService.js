/**
 * Inspection service — reuses the EXISTING backend REST APIs.
 *
 * Flow (identical to the web app):
 *   1. uploadRoadImage()   → POST /upload            (stores file)
 *   2. createReport()      → POST /reports           (report + GPS + image_path)
 *   3. predictImage()      → POST /ai/predict        (YOLOv8; persists AIAnalysis
 *                                                     server-side via report_id)
 *   4. Dashboard/history   → GET /dashboard/*        (Stage-4/5 endpoints)
 */
import client, { withPredictTimeout } from './apiClient';

/** Build a RN FormData image part from a local file URI. */
function toImagePart(uri, name = 'road.jpg', mime = 'image/jpeg') {
    return { uri, name, type: mime };
}

/** Step 1 — upload the captured/picked image. Returns upload metadata. */
export async function uploadRoadImage(imageUri) {
    const formData = new FormData();
    // NOTE: Content-Type is NOT set manually — RN/axios adds the multipart boundary.
    formData.append('file', toImagePart(imageUri));
    const response = await client.post('/upload', formData);
    return response.data; // { path, url, filename, ... }
}

/** Step 2 — create the report record (image ref + optional GPS). */
export async function createReport({ roadName, description, roadType, address, latitude, longitude, imagePath }) {
    const payload = {
        road_name: roadName,
        description,
        road_type: roadType || null,
        address: address || null,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        image_path: imagePath || null,
    };
    const response = await client.post('/reports', payload);
    return response.data; // ReportRead
}

/**
 * Step 3 — run real YOLOv8 inference on the image.
 * Passing reportId lets the backend persist the inspection automatically.
 */
export async function predictImage(imageUri, reportId) {
    const formData = new FormData();
    formData.append('file', toImagePart(imageUri));
    if (reportId) formData.append('report_id', reportId);
    const response = await client.post('/ai/predict', formData, withPredictTimeout());
    return normalizeAIResult(response.data);
}

/** Normalize the raw pipeline result into UI-friendly fields. */
export function normalizeAIResult(result = {}) {
    const detections = (result.detections || []).map((det, index) => ({
        id: det.id || index + 1,
        label: det.label || 'unknown',
        confidence: Math.round(Number(det.confidence || 0) * 100),
        bbox: det.bbox || [],
    }));
    const boundingBoxes = (result.bounding_boxes || []).map((box, index) => ({
        id: `box-${index + 1}`,
        label: box.label || 'damage',
        confidence: Math.round(Number(box.confidence || 0) * 100),
        x1: Number(box.x1 || 0),
        y1: Number(box.y1 || 0),
        x2: Number(box.x2 || 0),
        y2: Number(box.y2 || 0),
    }));
    return {
        success: result.success !== false && !result.error,
        damageDetected: result.damage_detected ?? detections.length > 0,
        detectionCount: result.detection_count ?? detections.length,
        primaryDamageType: result.damage_type || 'other',
        severity: result.severity || 'low',
        priority: result.priority || 'low',
        confidence: Math.round(Number(result.confidence || 0) * 100),
        estimatedCost: Number(result.estimated_repair_cost || 0),
        costRange: result.cost_range || null,
        currency: result.currency || 'INR',
        summary: result.summary || '',
        repairMethod: result.repair_method || '',
        expectedDurationDays: result.expected_duration_days || null,
        equipment: result.equipment || [],
        notes: result.notes || '',
        riskScore: Number(result.risk_score || 0),
        overallDamageScore: Number(result.overall_damage_score || 0),
        roadCondition: result.road_condition || '',
        modelVersion: result.model_version || '',
        processingTimeMs: Number(result.processing_time_ms || 0),
        analysisId: result.analysis_id || null,
        reportId: result.report_id || null,
        annotatedImageUrl: result.annotated_image_url || null,
        detections,
        boundingBoxes,
        mock: Boolean(result.mock),
    };
}

/** Home dashboard statistics (real stored inspection data). */
export async function getDashboardStats() {
    const response = await client.get('/dashboard/stats');
    return response.data || {};
}

/** Recent inspections for history list. */
export async function getInspectionHistory(limit = 50) {
    const response = await client.get('/dashboard/recent-inspections', { params: { limit } });
    return (response.data && response.data.items) || [];
}

/** Map markers (inspections with GPS). */
export async function getMapInspections(limit = 500) {
    const response = await client.get('/dashboard/map-inspections', { params: { limit } });
    return (response.data && response.data.items) || [];
}

/** Full detail of one persisted inspection. */
export async function getAnalysisDetail(analysisId) {
    const response = await client.get(`/ai/analyses/${analysisId}`);
    return response.data;
}