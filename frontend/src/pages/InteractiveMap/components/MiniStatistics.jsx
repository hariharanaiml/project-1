import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useCountUp } from '../../../hooks/useCountUp';

const STAT_CARDS = [
  { key: 'total', label: 'Total Reports', icon: MapPin, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/30' },
  { key: 'critical', label: 'Critical Reports', icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-950/30' },
  { key: 'resolved', label: 'Resolved Reports', icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-950/30' },
  { key: 'pending', label: 'Pending Reports', icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-950/30' },
];

/**
 * StatCard - Individual statistic card with animated count-up.
 * Extracted as a separate component so `useCountUp` is called at the top level of a component.
 */
function StatCard({ card, value, delay }) {
  const { count: animatedCount, ref } = useCountUp(value, 1200, 150 + delay);
  const Icon = card.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + delay * 0.06, ease: 'easeOut' }}
      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl ${card.bg} border border-secondary-200 dark:border-dark-700`}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${card.bg} ${card.color}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-secondary-500 dark:text-dark-400">{card.label}</p>
        <p className={`text-lg font-bold tabular-nums ${card.color}`}>{animatedCount}</p>
      </div>
    </motion.div>
  );
}

/**
 * MiniStatistics component - Animated counter cards displayed above the map.
 *
 * @param {Object} props
 * @param {number} props.total - Total reports count
 * @param {number} props.critical - Critical reports count
 * @param {number} props.resolved - Resolved/completed reports count
 * @param {number} props.pending - Pending/submitted reports count
 */
export default function MiniStatistics({ total = 0, critical = 0, resolved = 0, pending = 0 }) {
  const values = useMemo(() => ({ total, critical, resolved, pending }), [total, critical, resolved, pending]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="region" aria-label="Map statistics">
      {STAT_CARDS.map((card, index) => (
        <StatCard key={card.key} card={card} value={values[card.key]} delay={index} />
      ))}
    </div>
  );
}
