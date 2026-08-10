import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useCountUp } from '../../../hooks/useCountUp';
import { Card } from '../../../components/common/Card';

/** Stat card definitions with icon + color. */
const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Reports',
    icon: FileText,
    color: 'text-primary-500',
    bg: 'bg-primary-50 dark:bg-primary-950/30',
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
  },
  {
    key: 'resolved',
    label: 'Resolved Reports',
    icon: CheckCircle2,
    color: 'text-success-500',
    bg: 'bg-success-50 dark:bg-success-950/30',
    iconBg: 'bg-success-100 dark:bg-success-900/30',
  },
  {
    key: 'pending',
    label: 'Pending Reports',
    icon: Clock,
    color: 'text-warning-500',
    bg: 'bg-warning-50 dark:bg-warning-950/30',
    iconBg: 'bg-warning-100 dark:bg-warning-900/30',
  },
  {
    key: 'critical',
    label: 'Critical Reports',
    icon: AlertTriangle,
    color: 'text-danger-500',
    bg: 'bg-danger-50 dark:bg-danger-950/30',
    iconBg: 'bg-danger-100 dark:bg-danger-900/30',
  },
];

/** Individual stat card with animated counter. */
function StatCard({ card, value, index }) {
  const { count, ref } = useCountUp(value, 1200, 100 + index * 80);
  const Icon = card.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.08, ease: 'easeOut' }}
    >
      <Card
        bordered
        className={`h-full ${card.bg}`}
        aria-label={`${card.label}: ${value}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${card.iconBg} ${card.color}`}
            aria-hidden="true"
          >
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-secondary-500 dark:text-dark-400 truncate">
              {card.label}
            </p>
            <p className={`mt-0.5 text-2xl font-bold tabular-nums ${card.color}`}>
              {count.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * OverviewCards - 4 animated statistic cards (Total, Resolved, Pending, Critical).
 *
 * @param {Object} props
 * @param {number} props.total - Total reports count
 * @param {number} props.resolved - Resolved reports count
 * @param {number} props.pending - Pending reports count
 * @param {number} props.critical - Critical reports count
 */
export default function OverviewCards({ total = 0, resolved = 0, pending = 0, critical = 0 }) {
  const values = useMemo(
    () => ({ total, resolved, pending, critical }),
    [total, resolved, pending, critical]
  );

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Analytics overview statistics"
    >
      {STAT_CARDS.map((card, index) => (
        <StatCard key={card.key} card={card} value={values[card.key]} index={index} />
      ))}
    </div>
  );
}

