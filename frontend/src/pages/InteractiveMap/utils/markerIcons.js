import L from 'leaflet';

/**
 * Severity color mapping.
 * Matches the design system: success (green), warning (yellow/orange), danger (red).
 */
const SEVERITY_COLORS = {
  Minor: '#12b76a',
  Low: '#12b76a',
  Medium: '#fdb022',
  High: '#f97066',
  Critical: '#f04438',
};

const SEVERITY_BG = {
  Minor: '#ecfdf3',
  Low: '#ecfdf3',
  Medium: '#fffaeb',
  High: '#fef3f2',
  Critical: '#fef3f2',
};

/**
 * Create a Leaflet divIcon for a report marker based on severity.
 * Uses a colored circle with a dot indicator.
 *
 * @param {string} severity - Severity level (Minor, Medium, High, Critical)
 * @param {number} [size=32] - Icon size in pixels
 * @returns {L.DivIcon} Leaflet divIcon instance
 */
export function createSeverityIcon(severity, size = 32) {
  const color = SEVERITY_COLORS[severity] || '#98a2b3';
  const bg = SEVERITY_BG[severity] || '#f9fafb';
  const borderColor = severity === 'Critical' ? '#d92d20' : color;

  const html = `
    <div
      style="
        width: ${size}px;
        height: ${size}px;
        background: ${bg};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: transform 0.15s ease;
      "
    >
      <div
        style="
          width: ${size * 0.375}px;
          height: ${size * 0.375}px;
          background: ${color};
          border-radius: 50%;
        "
      ></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'roadsense-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Default marker icon for fallback usage.
 * Returns a Medium (yellow) severity icon.
 */
export function defaultMarkerIcon() {
  return createSeverityIcon('Medium');
}
