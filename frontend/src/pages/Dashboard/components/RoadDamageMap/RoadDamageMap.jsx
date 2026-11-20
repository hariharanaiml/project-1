import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Loader2, RefreshCw, Filter } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { Select } from '../../../../components/common/Select';
import { Badge } from '../../../../components/common/Badge';
import { getMapInspections } from '../../../../services/dashboardService';
import { createPriorityIcon } from '../../../InteractiveMap/utils/markerIcons';

/** India center fallback when no markers exist yet. */
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

/** Filter option lists (real stored values; "High"/"Urgent" also match critical). */
const DAMAGE_TYPE_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'pothole', label: 'Pothole' },
    { value: 'alligator_crack', label: 'Alligator Crack' },
    { value: 'longitudinal_crack', label: 'Longitudinal Crack' },
    { value: 'transverse_crack', label: 'Transverse Crack' },
    { value: 'lane_line_blur', label: 'Lane Line Blur' },
    { value: 'manhole_cover', label: 'Manhole Cover' },
    { value: 'patchy_road_section', label: 'Patchy Road Section' },
];

const SEVERITY_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const PRIORITY_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const DAMAGE_LABELS = {
    pothole: 'Pothole',
    alligator_crack: 'Alligator Crack',
    longitudinal_crack: 'Longitudinal Crack',
    transverse_crack: 'Transverse Crack',
    lane_line_blur: 'Lane Line Blur',
    manhole_cover: 'Manhole Cover',
    patchy_road_section: 'Patchy Road Section',
};

const titleCase = (value = '') =>
    String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function formatDamageType(value) {
    return DAMAGE_LABELS[value] || titleCase(value || 'Unknown');
}

function formatDate(iso) {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? 'N/A'
        : date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCost(cost) {
    const value = Number(cost);
    if (!Number.isFinite(value) || value <= 0) return 'N/A';
    return `₹${value.toLocaleString('en-IN')}`;
}

/** Keep Leaflet sized correctly inside responsive containers. */
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const container = map.getContainer();
        if (!container) return undefined;
        const frame = requestAnimationFrame(() => map.invalidateSize());
        let observer;
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => map.invalidateSize());
            observer.observe(container);
        }
        return () => {
            cancelAnimationFrame(frame);
            if (observer) observer.disconnect();
        };
    }, [map]);
    return null;
}

/** Fit the map to markers when they change. */
function FitToMarkers({ items }) {
    const map = useMap();
    useEffect(() => {
        if (!items || items.length === 0) return;
        if (items.length === 1) {
            map.setView([items[0].latitude, items[0].longitude], 13);
            return;
        }
        const bounds = items.map((item) => [item.latitude, item.longitude]);
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map, items]);
    return null;
}

/** Marker popup content for one inspection. */
function InspectionPopup({ inspection }) {
    const severityVariant =
        inspection.severity === 'high' || inspection.severity === 'critical'
            ? 'danger'
            : inspection.severity === 'medium'
                ? 'warning'
                : 'success';
    const priorityVariant =
        inspection.priority === 'urgent' || inspection.priority === 'critical'
            ? 'danger'
            : inspection.priority === 'high'
                ? 'warning'
                : inspection.priority === 'medium'
                    ? 'info'
                    : 'success';

    return (
        <div className="min-w-[210px]" role="dialog" aria-label="Inspection details">
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 mb-2">
                {formatDamageType(inspection.damage_type)}
            </h4>
            <dl className="space-y-1 text-xs text-secondary-600 dark:text-dark-300">
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Severity</dt>
                    <dd className="font-medium">{titleCase(inspection.severity || 'Unknown')}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Priority</dt>
                    <dd className="font-medium">{titleCase(inspection.priority || 'Unknown')}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Confidence</dt>
                    <dd className="font-medium tabular-nums">
                        {inspection.confidence != null
                            ? `${Math.round(Number(inspection.confidence) * 100)}%`
                            : 'N/A'}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Est. Cost</dt>
                    <dd className="font-medium">{formatCost(inspection.estimated_cost)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Date</dt>
                    <dd className="font-medium">{formatDate(inspection.inspection_date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Latitude</dt>
                    <dd className="font-medium tabular-nums">
                        {Number(inspection.latitude).toFixed(6)}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-secondary-400">Longitude</dt>
                    <dd className="font-medium tabular-nums">
                        {Number(inspection.longitude).toFixed(6)}
                    </dd>
                </div>
            </dl>
            <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant={severityVariant} size="xs" pill>
                    {titleCase(inspection.severity || 'Unknown')}
                </Badge>
                <Badge variant={priorityVariant} size="xs" pill>
                    {titleCase(inspection.priority || 'Unknown')}
                </Badge>
            </div>
            {inspection.analysis_id && (
                <div className="mt-3 pt-2 border-t border-secondary-100 dark:border-dark-700">
                    <Link
                        to="/ai-analysis"
                        className="block text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-150"
                    >
                        View inspection details →
                    </Link>
                </div>
            )}
        </div>
    );
}

/**
 * RoadDamageMap — Interactive road-damage map fed by real stored inspections
 * that carry GPS coordinates. Includes damage/severity/priority filters,
 * priority-colored markers, rich popups, loading/error/empty states.
 */
export default function RoadDamageMap() {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [filters, setFilters] = useState({ damageType: '', severity: '', priority: '' });

    useEffect(() => {
        setMounted(true);
    }, []);

    const loadInspections = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const items = await getMapInspections(500);
            setInspections(items);
        } catch (err) {
            setError(err?.message || 'Failed to load map inspections.');
            setInspections([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInspections();
    }, [loadInspections]);

    /** Apply filters client-side over real stored data. */
    const filtered = useMemo(
        () =>
            inspections.filter((inspection) => {
                if (
                    filters.damageType &&
                    String(inspection.damage_type || '').toLowerCase() !== filters.damageType
                ) {
                    return false;
                }
                if (filters.severity) {
                    // "High" also matches critical so no stored severity is unreachable.
                    const severity = String(inspection.severity || '').toLowerCase();
                    if (filters.severity === 'high') {
                        if (severity !== 'high' && severity !== 'critical') return false;
                    } else if (severity !== filters.severity) {
                        return false;
                    }
                }
                if (filters.priority) {
                    // "Urgent" also matches critical so no stored priority is unreachable.
                    const priority = String(inspection.priority || '').toLowerCase();
                    if (filters.priority === 'urgent') {
                        if (priority !== 'urgent' && priority !== 'critical') return false;
                    } else if (priority !== filters.priority) {
                        return false;
                    }
                }
                return true;
            }),
        [inspections, filters],
    );

    const hasAnyData = inspections.length > 0;

    return (
        <Card bordered>
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                            Road Damage Map
                        </h3>
                        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                            Inspections with GPS coordinates
                        </p>
                    </div>
                    {!loading && !error && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            leftIcon={RefreshCw}
                            onClick={loadInspections}
                            aria-label="Refresh map inspections"
                        >
                            Refresh
                        </Button>
                    )}
                </div>

                {/* Filters */}
                {!error && !loading && hasAnyData && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <Select
                            id="map-filter-damage"
                            aria-label="Filter by damage type"
                            options={DAMAGE_TYPE_OPTIONS}
                            value={filters.damageType}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, damageType: e.target.value }))
                            }
                        />
                        <Select
                            id="map-filter-severity"
                            aria-label="Filter by severity"
                            options={SEVERITY_OPTIONS}
                            value={filters.severity}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, severity: e.target.value }))
                            }
                        />
                        <Select
                            id="map-filter-priority"
                            aria-label="Filter by priority"
                            options={PRIORITY_OPTIONS}
                            value={filters.priority}
                            onChange={(e) =>
                                setFilters((prev) => ({ ...prev, priority: e.target.value }))
                            }
                        />
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="rounded-lg border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950/30 p-4 text-sm text-danger-700 dark:text-danger-300">
                        <p className="font-medium mb-2">Failed to load the road damage map.</p>
                        <p className="mb-3">{error}</p>
                        <Button type="button" variant="outline" size="sm" leftIcon={RefreshCw} onClick={loadInspections}>
                            Retry
                        </Button>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-secondary-200 dark:border-dark-700">
                        <Loader2 size={28} className="animate-spin text-primary-500" aria-hidden="true" />
                        <p className="text-sm font-medium text-secondary-600 dark:text-dark-300">
                            Loading map inspections...
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && !hasAnyData && (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 rounded-xl border border-dashed border-secondary-200 dark:border-dark-700 text-center px-6">
                        <Filter size={24} className="text-secondary-300 dark:text-dark-500" aria-hidden="true" />
                        <p className="text-sm font-medium text-secondary-700 dark:text-dark-200">
                            No location-based inspections available.
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-dark-400 max-w-sm">
                            Run a road inspection with location access enabled to display it on the map.
                        </p>
                    </div>
                )}

                {/* Filtered-empty state */}
                {!loading && !error && hasAnyData && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 rounded-xl border border-dashed border-secondary-200 dark:border-dark-700 text-center px-6">
                        <p className="text-sm font-medium text-secondary-700 dark:text-dark-200">
                            No inspections match the selected filters.
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters({ damageType: '', severity: '', priority: '' })}
                        >
                            Clear filters
                        </Button>
                    </div>
                )}

                {/* Map */}
                {!loading && !error && filtered.length > 0 && (
                    <div
                        className="relative w-full h-[380px] sm:h-[460px] rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-700"
                        role="application"
                        aria-label="Road damage map"
                    >
                        {mounted && (
                            <MapContainer
                                center={INDIA_CENTER}
                                zoom={DEFAULT_ZOOM}
                                minZoom={3}
                                maxZoom={18}
                                className="absolute inset-0 z-0 w-full h-full"
                                scrollWheelZoom
                                doubleClickZoom
                                touchZoom
                                dragging
                                keyboard
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {filtered.map((inspection) => (
                                    <Marker
                                        key={inspection.id}
                                        position={[inspection.latitude, inspection.longitude]}
                                        icon={createPriorityIcon(inspection.priority)}
                                        aria-label={`Inspection marker: ${formatDamageType(inspection.damage_type)}`}
                                    >
                                        <Popup keepInView autoPan>
                                            <InspectionPopup inspection={inspection} />
                                        </Popup>
                                    </Marker>
                                ))}
                                <FitToMarkers items={filtered} />
                                <MapResizer />
                            </MapContainer>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}