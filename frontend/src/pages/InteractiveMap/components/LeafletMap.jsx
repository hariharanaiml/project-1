import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import ReportMarker from './ReportMarker';
import MapControls from './MapControls';
import Legend from './Legend';

/** India center coordinates. */
const INDIA_CENTER = [20.5937, 78.9629];

/** Default zoom level. */
const DEFAULT_ZOOM = 5;

/** Min/max zoom bounds. */
const ZOOM_BOUNDS = [3, 18];

/** Explicit responsive heights so Leaflet always has a measurable container. */
const MAP_HEIGHT_CLASSES = 'h-[400px] sm:h-[500px] lg:h-[600px]';

/**
 * MapResizer - Inner component that keeps the Leaflet map correctly sized when
 * the container resizes (sidebar collapse/expand, viewport changes, responsive
 * breakpoints). Must be rendered inside MapContainer to access the map instance.
 */
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return undefined;

    // Recalculate once on mount to correct any initial sizing issues.
    const frame = requestAnimationFrame(() => map.invalidateSize());

    // Recalculate whenever the container dimensions change.
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

/**
 * LeafletMap component - Interactive Leaflet map with OpenStreetMap tiles.
 *
 * @param {Object} props
 * @param {Array<Object>} props.reports - Filtered report objects to display as markers
 */
export default function LeafletMap({ reports }) {
  // Mount the map only after the initial render so react-leaflet's MapContainer
  // is created exactly once. This prevents the StrictMode dev double-mount from
  // removing the map instance and leaving a blank container.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const markers = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    return reports.map((report) => (
      <ReportMarker key={report.id} report={report} />
    ));
  }, [reports]);

  return (
    <div
      className={`relative w-full ${MAP_HEIGHT_CLASSES} rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-700`}
      role="application"
      aria-label="Interactive damage report map"
    >
      {mounted && (
        <MapContainer
          center={INDIA_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          minZoom={ZOOM_BOUNDS[0]}
          maxZoom={ZOOM_BOUNDS[1]}
          className="absolute inset-0 z-0 w-full h-full"
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          keyboard={true}
        >
          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            aria-label="OpenStreetMap tiles"
          />

          {/* Report markers */}
          {markers}

          {/* Keep the map sized correctly on container/viewport changes */}
          <MapResizer />

          {/* Overlay controls */}
          <MapControls />
          <Legend />
        </MapContainer>
      )}
    </div>
  );
}
