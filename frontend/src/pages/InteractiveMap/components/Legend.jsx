import { motion } from 'framer-motion';

const LEGEND_ITEMS = [
  { label: 'Minor', color: '#12b76a', bg: '#ecfdf3' },
  { label: 'Medium', color: '#fdb022', bg: '#fffaeb' },
  { label: 'High', color: '#f97066', bg: '#fef3f2' },
  { label: 'Critical', color: '#f04438', bg: '#fef3f2' },
];

/**
 * Legend component - Severity color legend for the map markers.
 * Positioned as an overlay on the map.
 */
export default function Legend() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
      className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 shadow-lg p-3"
      role="region"
      aria-label="Map legend"
    >
      <p className="text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400 mb-2">
        Severity
      </p>
      <ul className="space-y-1.5" role="list">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: item.bg,
                borderColor: item.color,
              }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-secondary-700 dark:text-dark-200">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
