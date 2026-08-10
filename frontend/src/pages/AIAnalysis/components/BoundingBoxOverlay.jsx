import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Tone → box border + label styles.
 * Shared by BoundingBoxOverlay and the color legend in BoundingBoxPreview.
 */
export const TONE_STYLES = {
  danger: {
    border: 'border-danger-400 dark:border-danger-500',
    label: 'bg-danger-500 text-white',
    swatch: 'bg-danger-500',
    text: 'text-danger-600 dark:text-danger-400',
  },
  warning: {
    border: 'border-warning-400 dark:border-warning-500',
    label: 'bg-warning-500 text-white',
    swatch: 'bg-warning-500',
    text: 'text-warning-600 dark:text-warning-400',
  },
  success: {
    border: 'border-success-400 dark:border-success-500',
    label: 'bg-success-500 text-white',
    swatch: 'bg-success-500',
    text: 'text-success-600 dark:text-success-400',
  },
  info: {
    border: 'border-info-400 dark:border-info-500',
    label: 'bg-info-500 text-white',
    swatch: 'bg-info-500',
    text: 'text-info-600 dark:text-info-400',
  },
  primary: {
    border: 'border-primary-400 dark:border-primary-500',
    label: 'bg-primary-500 text-white',
    swatch: 'bg-primary-500',
    text: 'text-primary-600 dark:text-primary-400',
  },
};

/**
 * BoundingBoxOverlay - Renders YOLO-style detection boxes over a relative image/canvas.
 * Boxes may carry either a Tailwind `position` class string (static data) or
 * numeric `left`/`top`/`width`/`height` percentages (runtime API data, applied
 * as inline styles since Tailwind arbitrary classes are not compiled at runtime).
 *
 * @param {Object} props
 * @param {Array<{id: string, label: string, confidence: number, tone: string, position?: string, left?: number, top?: number, width?: number, height?: number}>} props.boxes - Detection boxes
 */
function BoundingBoxOverlay({ boxes = [] }) {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {boxes.map((box, index) => {
        const tone = TONE_STYLES[box.tone] || TONE_STYLES.primary;
        const inlineStyle =
          typeof box.left === 'number'
            ? { left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }
            : undefined;

        return (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.25 + index * 0.1, ease: 'easeOut' }}
            className={`absolute border-2 rounded-sm ${box.position || ''} ${tone.border}`}
            style={inlineStyle}
          >
            <span
              className={`absolute -top-6 left-0 px-1.5 py-0.5 text-2xs font-semibold rounded ${tone.label}`}
            >
              {box.label} {box.confidence}%
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default memo(BoundingBoxOverlay);

