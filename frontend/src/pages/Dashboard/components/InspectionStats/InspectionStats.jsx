import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ClipboardList,
    AlertTriangle,
    AlertOctagon,
    Info,
    IndianRupee,
    ScanSearch,
    Grid3X3,
} from 'lucide-react';
import { useCountUp } from '../../../../hooks/useCountUp';
import { Card } from '../../../../components/common/Card';

/**
 * InspectionStats — Dashboard statistics derived from real stored
 * inspection data (AIAnalysis rows). No fake/mock numbers.
 *
 * @param {Object} props
 * @param {Object} props.stats - Stats from GET /dashboard/stats
 */
const STAT_CARDS = [
    {
        key: 'total_inspections',
        label: 'Total Inspections',
        icon: ClipboardList,
        color: 'text-primary-500',
        bg: 'bg-primary-50 dark:bg-primary-950/30',
        iconBg: 'bg-primary-100 dark:bg-primary-900/30',
    },
    {
        key: 'total_detected_damages',
        label: 'Total Detected Damages',
        icon: ScanSearch,
        color: 'text-info-500',
        bg: 'bg-info-50 dark:bg-info-950/30',
        iconBg: 'bg-info-100 dark:bg-info-900/30',
    },
    {
        key: 'total_potholes',
        label: 'Potholes',
        icon: Grid3X3,
        color: 'text-warning-500',
        bg: 'bg-warning-50 dark:bg-warning-950/30',
        iconBg: 'bg-warning-100 dark:bg-warning-900/30',
    },
    {
        key: 'total_cracks',
        label: 'Cracks',
        icon: AlertTriangle,
        color: 'text-danger-500',
        bg: 'bg-danger-50 dark:bg-danger-950/30',
        iconBg: 'bg-danger-100 dark:bg-danger-900/30',
    },
    {
        key: 'high_priority',
        label: 'High-Priority Issues',
        icon: AlertOctagon,
        color: 'text-danger-500',
        bg: 'bg-danger-50 dark:bg-danger-950/30',
        iconBg: 'bg-danger-100 dark:bg-danger-900/30',
    },
    {
        key: 'medium_priority',
        label: 'Medium-Priority Issues',
        icon: AlertTriangle,
        color: 'text-warning-500',
        bg: 'bg-warning-50 dark:bg-warning-950/30',
        iconBg: 'bg-warning-100 dark:bg-warning-900/30',
    },
    {
        key: 'low_priority',
        label: 'Low-Priority Issues',
        icon: Info,
        color: 'text-success-500',
        bg: 'bg-success-50 dark:bg-success-950/30',
        iconBg: 'bg-success-100 dark:bg-success-900/30',
    },
    {
        key: 'estimated_total_repair_cost',
        label: 'Estimated Total Repair Cost',
        icon: IndianRupee,
        color: 'text-primary-500',
        bg: 'bg-primary-50 dark:bg-primary-950/30',
        iconBg: 'bg-primary-100 dark:bg-primary-900/30',
        format: (value) =>
            Number(value || 0) >= 100000
                ? `₹${(Number(value || 0) / 100000).toFixed(2)}L`
                : `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
];

function StatCard({ card, value, index }) {
    const { count, ref } = useCountUp(value, 1200, 100 + index * 80);
    const Icon = card.icon;
    const display = card.format ? card.format(value) : count.toLocaleString('en-IN');

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 + index * 0.06, ease: 'easeOut' }}
        >
            <Card
                bordered
                className={`h-full ${card.bg}`}
                aria-label={`${card.label}: ${display}`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${card.iconBg} ${card.color}`}
                        aria-hidden="true"
                    >
                        <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-secondary-500 dark:text-dark-400 truncate">
                            {card.label}
                        </p>
                        <p className={`mt-0.5 text-lg font-bold tabular-nums ${card.color} truncate`}>
                            {display}
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

export default function InspectionStats({ stats = {} }) {
    const hasData = useMemo(() => Number(stats.total_inspections || 0) > 0, [stats]);

    if (!hasData) {
        return (
            <Card bordered className="p-6" aria-label="Inspection statistics">
                <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 mb-2">
                    Inspection Statistics
                </h3>
                <p className="text-sm text-secondary-500 dark:text-dark-400">
                    No inspection data available.
                </p>
            </Card>
        );
    }

    return (
        <section aria-label="Inspection statistics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map((card, index) => (
                    <StatCard key={card.key} card={card} value={stats[card.key] ?? 0} index={index} />
                ))}
            </div>
        </section>
    );
}