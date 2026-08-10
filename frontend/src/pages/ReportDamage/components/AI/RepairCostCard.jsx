import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wrench, Users, Truck } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import SectionHeader from '../Shared/SectionHeader';
import { useCountUp } from '../../../../hooks/useCountUp';

/** Cost breakdown items config */
const COST_ITEMS = [
  { key: 'materialCost', label: 'Material Cost', icon: Wrench, color: 'text-primary-500' },
  { key: 'laborCost', label: 'Labor Cost', icon: Users, color: 'text-success-500' },
  { key: 'equipmentCost', label: 'Equipment Cost', icon: Truck, color: 'text-warning-500' },
];

/** Format a number as USD currency. */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * RepairCostCard component - Displays cost breakdown for the repair.
 *
 * @param {Object} props
 * @param {number} [props.estimatedRepairCost=0] - Total estimated cost
 * @param {number} [props.materialCost=0] - Material cost portion
 * @param {number} [props.laborCost=0] - Labor cost portion
 * @param {number} [props.equipmentCost=0] - Equipment cost portion
 */
export default function RepairCostCard({
  estimatedRepairCost = 0,
  materialCost = 0,
  laborCost = 0,
  equipmentCost = 0,
}) {
  const costBreakdown = useMemo(() => {
    const values = { materialCost, laborCost, equipmentCost };
    return COST_ITEMS.map((item) => ({ ...item, value: values[item.key] || 0 }));
  }, [materialCost, laborCost, equipmentCost]);

  const { count: animatedCost, ref } = useCountUp(estimatedRepairCost, 1400, 300);

  return (
    <section aria-label="Repair cost estimate">
      <SectionHeader
        title="Estimated Repair Cost"
        description="AI-generated cost breakdown for the recommended repair."
        delay={0.2}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-4">
            {/* Total cost */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              ref={ref}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-500">
                <DollarSign size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-secondary-500 dark:text-dark-400">Total Estimated Cost</p>
                <p className="text-xl font-bold text-secondary-900 dark:text-dark-100 tabular-nums">
                  {formatCurrency(animatedCost)}
                </p>
              </div>
            </motion.div>

            {/* Cost breakdown */}
            <div className="space-y-2">
              {costBreakdown.map((item, index) => {
                const Icon = item.icon;
                const maxTotal = Math.max(estimatedRepairCost, 1);
                const percentage = Math.round((item.value / maxTotal) * 100);

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800"
                  >
                    <Icon size={16} className={`shrink-0 ${item.color}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-secondary-600 dark:text-dark-300">{item.label}</span>
                        <span className="text-xs font-medium text-secondary-900 dark:text-dark-100 tabular-nums">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary-200 dark:bg-dark-700 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: 0.4 + index * 0.05, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    <span className="text-2xs text-secondary-400 dark:text-dark-500 tabular-nums w-8 text-right">
                      {percentage}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

