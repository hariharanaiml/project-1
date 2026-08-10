import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, ThumbsUp } from 'lucide-react';
import { useCountUp } from '../../../hooks/useCountUp';
import { Card } from '../../../components/common/Card';

/** Map icon key to the Lucide component. */
const ICON_MAP = {
  FileText,
  CheckCircle2,
  Clock,
  ThumbsUp,
};

/**
 * AccountStatistics - 4 animated stat cards summarizing account activity.
 *
 * @param {Object} props
 * @param {Array<{key: string, label: string, value: number, icon: string, color: string, bg: string, iconBg: string}>} props.stats - Stat card definitions
 */
export default function AccountStatistics({ stats = [] }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Account statistics"
    >
      {stats.map((stat, index) => {
        const Icon = ICON_MAP[stat.icon] || FileText;
        return <StatCard key={stat.key} stat={stat} Icon={Icon} index={index} />;
      })}
    </div>
  );
}

function StatCard({ stat, Icon, index }) {
  const { count, ref } = useCountUp(stat.value, 1000, 100 + index * 80);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.08, ease: 'easeOut' }}
    >
      <Card bordered className={`h-full ${stat.bg} backdrop-blur-xl`} aria-label={`${stat.label}: ${stat.value}`}>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${stat.iconBg} ${stat.color}`}
            aria-hidden="true"
          >
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-secondary-500 dark:text-dark-400 truncate">
              {stat.label}
            </p>
            <p className={`mt-0.5 text-2xl font-bold tabular-nums ${stat.color}`}>
              {count.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

