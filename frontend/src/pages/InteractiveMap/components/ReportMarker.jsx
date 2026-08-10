import { memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createSeverityIcon } from '../utils/markerIcons';
import MapPopup from './MapPopup';

/**
 * ReportMarker component - Leaflet marker with severity-colored icon and popup.
 *
 * @param {Object} props
 * @param {Object} props.report - Report object with id, latitude, longitude, severity, etc.
 */
function ReportMarker({ report }) {
  const { latitude, longitude, severity } = report;

  return (
    <Marker
      position={[latitude, longitude]}
      icon={createSeverityIcon(severity)}
      aria-label={`Report marker for ${report.roadName}`}
    >
      <Popup
        className="roadsense-popup"
        closeButton={true}
        autoPan={true}
        keepInView={true}
      >
        <MapPopup report={report} />
      </Popup>
    </Marker>
  );
}

export default memo(ReportMarker);
