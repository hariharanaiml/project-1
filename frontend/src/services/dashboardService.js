import api from './api';

/**
 * Fetch real dashboard inspection statistics.
 * Backend: GET /dashboard/stats
 * Returns { total_inspections, total_detected_damages, total_potholes,
 *           total_cracks, high_priority, medium_priority, low_priority,
 *           estimated_total_repair_cost }
 */
export async function getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data || {};
}

/**
 * Fetch the damage category breakdown of real stored inspections.
 * Backend: GET /dashboard/damage-breakdown
 * Returns [{ name: 'Pothole', value: N }, ...]
 */
export async function getDamageBreakdown() {
    const response = await api.get('/dashboard/damage-breakdown');
    return (response.data && response.data.items) || [];
}

/**
 * Fetch the most recent AI inspections.
 * Backend: GET /dashboard/recent-inspections?limit=N
 * Returns [{ analysis_id, report_id, report_number, road_name,
 *            inspection_date, damage_type, severity, priority,
 *            confidence, estimated_repair_cost }, ...]
 */
export async function getRecentInspections(limit = 10) {
    const response = await api.get('/dashboard/recent-inspections', { params: { limit } });
    return (response.data && response.data.items) || [];
}

/**
 * Fetch inspections that have GPS coordinates for the road damage map.
 * Backend: GET /dashboard/map-inspections?limit=N
 * Returns [{ id, report_id, report_number, road_name, latitude, longitude,
 *            damage_type, severity, priority, confidence,
 *            estimated_cost, inspection_date }, ...]
 */
export async function getMapInspections(limit = 500) {
    const response = await api.get('/dashboard/map-inspections', { params: { limit } });
    return (response.data && response.data.items) || [];
}

export default {
    getDashboardStats,
    getDamageBreakdown,
    getRecentInspections,
    getMapInspections,
};
