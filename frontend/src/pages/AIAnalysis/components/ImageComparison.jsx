import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Images, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import SectionHeading from './SectionHeading';
import BoundingBoxOverlay from './BoundingBoxOverlay';

/**
 * ImageComparison - Original upload and its AI-annotated counterpart.
 *
 * @param {Object} props
 * @param {string|null} props.imageUrl - URL of the uploaded image.
 * @param {string|null} props.annotatedImageUrl - URL of the annotated image.
 * @param {Array<{id: string, label: string, confidence: number, tone: string, position: string}>} props.boxes - Detection boxes
 */
export default function ImageComparison({
  imageUrl = null,
  annotatedImageUrl = null,
  boxes = [],
}) {
  const [zoomed, setZoomed] = useState(false);
  const downloadUrl = annotatedImageUrl || imageUrl;

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
                  className={`relative overflow-hidden rounded-xl border border-secondary-200 dark:border-dark-700 bg-secondary-100 dark:bg-dark-800 transition-transform duration-300 ${
                    zoomed ? 'scale-105' : 'scale-100'
                  }`}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Original uploaded road image"
                      className="block h-auto w-full"
                    />
                  ) : (
                    <ImageUnavailable />
                  )}
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
                  className={`relative overflow-hidden rounded-xl border border-secondary-200 dark:border-dark-700 bg-secondary-100 dark:bg-dark-800 transition-transform duration-300 ${
                    zoomed ? 'scale-105' : 'scale-100'
                  }`}
                >
                  {annotatedImageUrl ? (
                    <img
                      src={annotatedImageUrl}
                      alt="Road image annotated with actual YOLO detections"
                      className="block h-auto w-full"
                    />
                  ) : imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Uploaded road image with detection boxes"
                        className="block h-auto w-full"
                      />
                      <BoundingBoxOverlay boxes={boxes} />
                    </>
                  ) : (
                    <ImageUnavailable />
                  )}
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
                disabled={!downloadUrl}
                onClick={() => {
                  if (!downloadUrl) return;
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = 'roadsense-analysis.jpg';
                  link.click();
                }}
                aria-label="Download annotated image"
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

function ImageUnavailable() {
  return (
    <div className="flex h-full min-h-48 items-center justify-center text-sm text-secondary-500 dark:text-dark-400">
      No uploaded image is available for this analysis.
    </div>
  );
}
