import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';

const SEVERITY_COLORS = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
};

const PRIORITY_LABELS = {
    urgent: 'Urgent',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

const DAMAGE_LABELS = {
    pothole: 'Pothole',
    alligator_crack: 'Alligator Crack',
    alligator_cracks: 'Alligator Cracks',
    longitudinal_crack: 'Longitudinal Crack',
    transverse_crack: 'Transverse Crack',
    lane_line_blur: 'Lane Line Blur',
    manhole_cover: 'Manhole Cover',
    patchy_road_section: 'Patchy Road',
    crack: 'Crack',
    surface_wear: 'Surface Wear',
    other: 'Other',
};

const NOT_AVAILABLE = 'N/A';

const titleCase = (value = '') =>
    String(value)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

function formatDate(iso) {
    if (!iso) return NOT_AVAILABLE;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return NOT_AVAILABLE;
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDamageType(value) {
    return DAMAGE_LABELS[value] || titleCase(value || 'Unknown');
}

function formatSeverity(value) {
    return titleCase(value || 'Unknown');
}

function priorityBadge(priority, severity) {
    const label = PRIORITY_LABELS[priority] || titleCase(priority || severity || '');
    const variant = SEVERITY_COLORS[priority] || SEVERITY_COLORS[severity] || 'info';
    return (
        <Badge variant={variant} size="sm" pill>
            {label}
        </Badge>
    );
}

function severityBadge(severity) {
    const variant = SEVERITY_COLORS[severity] || 'info';
    return (
        <Badge variant={variant} size="sm" pill>
            {formatSeverity(severity)}
        </Badge>
    );
}

/**
 * RecentInspections — Most recent AI inspections table.
 *
 * Each row displays date, damage type, severity, priority, and confidence.
 * Rows link to the AI analysis detail page when an analysis id exists.
 *
 * @param {Object} props
 * @param {Array} props.inspections - Recent inspections from GET /dashboard/recent-inspections
 */
export default function RecentInspections({ inspections = [] }) {
    const items = useMemo(() => (Array.isArray(inspections) ? inspections : []), [inspections]);

    if (items.length === 0) {
        return (
            <Card bordered className="p-6">
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                        Recent Inspections
                    </h3>
                </div>
                <p className="text-sm text-secondary-500 dark:text-dark-400">
                    No inspection data available.
                </p>
            </Card>
        );
    }

    return (
        <Card bordered>
            <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                            Recent Inspections
                        </h3>
                        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                            Latest AI analysis results
                        </p>
                    </div>
                    <Link
                        to="/ai-analysis"
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-150"
                    >
                        View all
                    </Link>
                </div>

                <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-secondary-100 dark:border-dark-800">
                                <th className="text-left py-2 pr-4 font-medium text-xs text-secondary-500 dark:text-dark-400">
                                    Date
                                </th>
                                <th className="text-left py-2 pr-4 font-medium text-xs text-secondary-500 dark:text-dark-400">
                                    Damage
                                </th>
                                <th className="text-left py-2 pr-4 font-medium text-xs text-secondary-500 dark:text-dark-400">
                                    Severity
                                </th>
                                <th className="text-left py-2 pr-4 font-medium text-xs text-secondary-500 dark:text-dark-400">
                                    Priority
                                </th>
                                <th className="text-left py-2 font-medium text-xs text-secondary-500 dark:text-dark-400">
                                    Confidence
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((inspection) => {
                                const confidence = inspection.confidence
                                    ? `${Math.round(Number(inspection.confidence) * 100)}%`
                                    : NOT_AVAILABLE;
                                const key = inspection.analysis_id || inspection.report_id || inspection.inspection_date;
                                const damageCell = inspection.analysis_id ? (
                                    <Link
                                        to="/ai-analysis"
                                        className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-150"
                                    >
                                        {formatDamageType(inspection.damage_type)}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-secondary-900 dark:text-dark-100">
                                        {formatDamageType(inspection.damage_type)}
                                    </span>
                                );

                                return (
                                    <tr
                                        key={key}
                                        className="border-b border-secondary-50 dark:border-dark-800/50 hover:bg-secondary-50 dark:hover:bg-dark-800/40 transition-colors duration-150"
                                    >
                                        <td className="py-2.5 pr-4 whitespace-nowrap text-secondary-600 dark:text-dark-300">
                                            {formatDate(inspection.inspection_date)}
                                        </td>
                                        <td className="py-2.5 pr-4">{damageCell}</td>
                                        <td className="py-2.5 pr-4">{severityBadge(inspection.severity)}</td>
                                        <td className="py-2.5 pr-4">
                                            {priorityBadge(inspection.priority, inspection.severity)}
                                        </td>
                                        <td className="py-2.5 whitespace-nowrap text-secondary-600 dark:text-dark-300 tabular-nums">
                                            {confidence}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
}