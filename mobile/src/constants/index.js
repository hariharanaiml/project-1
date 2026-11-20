/**
 * RoadSense Mobile constants — design tokens, damage labels, storage keys.
 * Clean government / smart-city style palette with dark & light support.
 */

export const COLORS = {
    primary: '#2970ff',
    primaryDark: '#1a56db',
    success: '#12b76a',
    warning: '#f79009',
    danger: '#f04438',
    critical: '#d92d20',
    info: '#0ea5e9',
    neutral: '#98a2b3',
};

/** Marker / badge colors per priority (reuses web design-system colors). */
export const PRIORITY_COLORS = {
    urgent: COLORS.critical,
    critical: COLORS.danger,
    high: '#f97066',
    medium: COLORS.warning,
    low: COLORS.success,
};

export const SEVERITY_COLORS = {
    low: COLORS.success,
    medium: COLORS.warning,
    high: '#f97066',
    critical: COLORS.danger,
};

/** Damage type display labels (canonical YOLO classes + legacy). */
export const DAMAGE_LABELS = {
    pothole: 'Pothole',
    alligator_crack: 'Alligator Crack',
    longitudinal_crack: 'Longitudinal Crack',
    transverse_crack: 'Transverse Crack',
    lane_line_blur: 'Lane Line Blur',
    manhole_cover: 'Manhole Cover',
    patchy_road_section: 'Patchy Road Section',
    crack: 'Crack',
    surface_wear: 'Surface Wear',
    other: 'Other',
};

/** AsyncStorage keys. */
export const STORAGE_KEYS = {
    offlineQueue: '@roadsense/offline_queue',
    themePreference: '@roadsense/theme_preference',
};

/** Upload constraints mirroring backend limits. */
export const MAX_IMAGE_MB = 10;

/** AI processing stage labels shown while analyzing. */
export const ANALYSIS_STAGES = [
    'Uploading image…',
    'Running YOLOv8 detection…',
    'Classifying severity…',
    'Estimating repair cost…',
    'Generating recommendation…',
];