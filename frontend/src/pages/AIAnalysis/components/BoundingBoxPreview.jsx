import { motion } from 'framer-motion';
import { ScanSearch } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import SectionHeading from './SectionHeading';
import BoundingBoxOverlay, { TONE_STYLES } from './BoundingBoxOverlay';

/**
 * BoundingBoxPreview - Actual uploaded image with inference boxes and legend.
 *
 * @param {Object} props
 * @param {string|null} props.imageUrl - URL of the uploaded image.
 * @param {Array<{id: string, label: string, confidence: number, tone: string, position: string}>} props.boxes - Detection boxes
 * @param {Array<{key: string, label: string, swatchClass: string, textClass: string}>} props.legend - Legend entries
 */
export default function BoundingBoxPreview({ imageUrl = null, boxes = [], legend = [] }) {
  return (
    <section aria-label="Bounding box preview">
      <SectionHeading
        title="Bounding Box Preview"
        description="Canvas overlay simulation of YOLOv8 detection boxes."
        icon={ScanSearch}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          bordered
          padding="none"
          className="relative overflow-hidden bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl"
        >
          {/* Detection canvas */}
          <div className="relative overflow-hidden rounded-t-xl border-b border-secondary-200 dark:border-dark-700 bg-dark-800 dark:bg-dark-950">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Uploaded road image with AI bounding boxes"
                  className="block h-auto w-full"
                />
                <BoundingBoxOverlay boxes={boxes} />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-dark-300">
                No uploaded image is available for this analysis.
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="p-4 sm:p-5">
            <p className="text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400 mb-3">
              Detection Legend
            </p>
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
              role="list"
              aria-label="Bounding box color legend"
            >
              {legend.map((item) => {
                const tone = TONE_STYLES[item.key] || TONE_STYLES.primary;
                return (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-50 dark:bg-dark-800"
                  >
                    <span className={`inline-block w-3 h-3 rounded-sm ${tone.swatch}`} aria-hidden="true" />
                    <span className="text-xs text-secondary-700 dark:text-dark-200">{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
