import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Images, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import SectionHeading from './SectionHeading';
import BoundingBoxOverlay from './BoundingBoxOverlay';

/**
 * ImageComparison - Before/After split of original vs AI-annotated image.
 * Zoom + Download buttons are UI only (no real image manipulation).
 *
 * @param {Object} props
 * @param {Array<{id: string, label: string, confidence: number, tone: string, position: string}>} props.boxes - Detection boxes
 */
export default function ImageComparison({ boxes = [] }) {
  const [zoomed, setZoomed] = useState(false);

  const toggleZoom = useCallback(() => setZoomed((prev) => !prev), []);

  return (
    <section aria-label="Image comparison">
      <SectionHeading
        title="Image Comparison"
        description="Original upload vs AI-annotated detection."
        icon={Images}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          bordered
          padding="lg"
          className="relative overflow-hidden bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-success-500/10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original */}
              <figure className="min-w-0">
                <figcaption className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-secondary-700 dark:text-dark-200 uppercase tracking-wider">
                    Before
                  </span>
                  <span className="text-2xs text-secondary-400 dark:text-dark-500">Original Upload</span>
                </figcaption>
                <div
                  className={`relative rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-700 bg-secondary-100 dark:bg-dark-800 aspect-video transition-transform duration-300 ${
                    zoomed ? 'scale-105' : 'scale-100'
                  }`}
                >
                  <RoadMockImage />
                </div>
              </figure>

              {/* AI Annotated */}
              <figure className="min-w-0">
                <figcaption className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-secondary-700 dark:text-dark-200 uppercase tracking-wider">
                    After
                  </span>
                  <span className="text-2xs text-secondary-400 dark:text-dark-500">AI Annotated</span>
                </figcaption>
                <div
                  className={`relative rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-700 bg-secondary-100 dark:bg-dark-800 aspect-video transition-transform duration-300 ${
                    zoomed ? 'scale-105' : 'scale-100'
                  }`}
                >
                  <RoadMockImage />
                  <BoundingBoxOverlay boxes={boxes} />
                </div>
              </figure>
            </div>

            {/* Action buttons (UI only) */}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleZoom}
                aria-pressed={zoomed}
                aria-label={zoomed ? 'Disable zoom on comparison images' : 'Enable zoom on comparison images'}
                leftIcon={zoomed ? ZoomOut : ZoomIn}
              >
                {zoomed ? 'Zoom Out' : 'Zoom In'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Download}
                aria-label="Download annotated image (UI only)"
              >
                Download
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

/**
 * RoadMockImage - Stylized road placeholder used for both panels.
 * CSS-only (no inline styles), responsive via aspect-video container.
 */
function RoadMockImage() {
  return (
    <div
      className="relative w-full h-full"
      role="img"
      aria-label="Mock road surface image with visible pothole and crack damage"
    >
      {/* Asphalt texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary-300 via-secondary-200 to-secondary-300 dark:from-dark-700 dark:via-dark-600 dark:to-dark-700" />
      {/* Road edge lines */}
      <div className="absolute left-[6%] top-0 bottom-0 w-1 bg-warning-300 dark:bg-warning-700/60" aria-hidden="true" />
      <div className="absolute right-[6%] top-0 bottom-0 w-1 bg-warning-300 dark:bg-warning-700/60" aria-hidden="true" />
      {/* Dashed center lane */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-warning-200 dark:bg-warning-600/40" aria-hidden="true" />
      {/* Pothole */}
      <div className="absolute left-[16%] top-[38%] w-[20%] h-[26%] rounded-full bg-secondary-400 dark:bg-dark-950 shadow-inner" aria-hidden="true" />
      {/* Crack */}
      <div className="absolute left-[58%] top-[28%] w-[30%] h-1.5 rotate-[8deg] bg-secondary-400 dark:bg-dark-950 rounded-full" aria-hidden="true" />
    </div>
  );
}

