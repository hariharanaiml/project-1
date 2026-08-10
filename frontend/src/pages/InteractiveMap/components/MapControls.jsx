import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Crosshair, RotateCcw, Map as MapIcon, Maximize2 } from 'lucide-react';
import { useMap } from 'react-leaflet';

/** Map default center (India) and zoom. */
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

/**
 * Inner component that uses the Leaflet map context to perform zoom/reset actions.
 * Rendered inside MapContainer so it has access to `useMap()`.
 */
function MapControlActions() {
  const map = useMap();

  const handleZoomIn = useCallback(() => {
    map.zoomIn();
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map.zoomOut();
  }, [map]);

  const handleReset = useCallback(() => {
    map.setView(INDIA_CENTER, DEFAULT_ZOOM, { animate: true });
  }, [map]);

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleZoomIn}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
        aria-label="Zoom in"
      >
        <ZoomIn size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
        aria-label="Zoom out"
      >
        <ZoomOut size={16} aria-hidden="true" />
      </button>
      <div className="h-px bg-secondary-200 dark:bg-dark-700 my-0.5" role="separator" />
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
        aria-label="Reset map view"
      >
        <RotateCcw size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * MapControls component - Overlay control buttons for the interactive map.
 * Includes zoom in/out, locate (UI placeholder), reset, satellite (placeholder), fullscreen (placeholder).
 */
export default function MapControls({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      className={`absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 ${className}`}
      role="toolbar"
      aria-label="Map controls"
    >
      {/* Zoom + Reset */}
      <MapControlActions />

      <div className="h-px bg-secondary-200 dark:bg-dark-700 my-0.5" role="separator" />

      {/* Locate (UI only) */}
      <button
        type="button"
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
        aria-label="Locate my position (coming soon)"
      >
        <Crosshair size={16} aria-hidden="true" />
      </button>

      {/* Toggle Satellite (placeholder) */}
      <button
        type="button"
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
        aria-label="Toggle satellite view (coming soon)"
      >
        <MapIcon size={16} aria-hidden="true" />
      </button>

      {/* Fullscreen (placeholder) */}
      <button
        type="button"
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 shadow-sm"
        aria-label="Toggle fullscreen (coming soon)"
      >
        <Maximize2 size={16} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
