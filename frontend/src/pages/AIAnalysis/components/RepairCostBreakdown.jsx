import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wallet } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../../../components/common/Card';
import SectionHeading from './SectionHeading';
import { useCountUp } from '../../../hooks/useCountUp';
import { TOOLTIP_STYLE } from '../../Analytics/components/chartTheme';

/** Pie palette (matches cost categories). */
const COST_PALETTE = ['#2970ff', '#12b76a', '#f79009'];

/** Cost row definitions. */
const COST_ROWS = [
  { key: 'materialCost', label: 'Material Cost', color: 'text-primary-600 dark:text-primary-400' },
  { key: 'laborCost', label: 'Labor Cost', color: 'text-success-600 dark:text-success-400' },
  { key: 'equipmentCost', label: 'Equipment Cost', color: 'text-warning-600 dark:text-warning-400' },
];

/** Format a number as USD currency (no cents). */
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * RepairCostBreakdown - Cost breakdown with animated total + Recharts pie chart.
 *
 * @param {Object} props
 * @param {number} [props.materialCost=0] - Material cost
 * @param {number} [props.laborCost=0] - Labor cost
 * @param {number} [props.equipmentCost=0] - Equipment cost
 * @param {number} [props.totalEstimatedCost=0] - Total estimated cost
 * @param {Array<{name: string, value: number}>} [props.items=[]] - Pie chart items
 */
export default function RepairCostBreakdown({
  materialCost = 0,
  laborCost = 0,
  equipmentCost = 0,
  totalEstimatedCost = 0,
  items = [],
}) {
  const { count, ref } = useCountUp(totalEstimatedCost, 1400, 250);

  const rows = useMemo(
    () => [
      { ...COST_ROWS[0], value: materialCost },
      { ...COST_ROWS[1], value: laborCost },
      { ...COST_ROWS[2], value: equipmentCost },
    ],
    [materialCost, laborCost, equipmentCost]
  );

  return (
    <section aria-label="Repair cost breakdown">
      <SectionHeading
        title="Repair Cost Breakdown"
        description="AI-generated cost estimate for the recommended repair."
        icon={Wallet}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          bordered
          padding="lg"
          className="relative overflow-hidden bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl h-full"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-success-500/10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Total */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800"
            >
              <span
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 shrink-0"
                aria-hidden="true"
              >
                <DollarSign size={20} />
              </span>
              <div>
                <p className="text-2xs text-secondary-500 dark:text-dark-400 uppercase tracking-wider">
                  Total Estimated Cost
                </p>
                <p className="text-xl font-bold text-secondary-900 dark:text-dark-100 tabular-nums">
                  {formatCurrency(count)}
                </p>
              </div>
            </motion.div>

            {/* Cost rows */}
            <div className="mt-4 space-y-2">
              {rows.map((row, index) => (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary-50/80 dark:bg-dark-800/60"
                >
                  <span className="text-xs text-secondary-600 dark:text-dark-300">{row.label}</span>
                  <span className={`text-sm font-semibold tabular-nums ${row.color}`}>
                    {formatCurrency(row.value)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Pie chart */}
            <div className="mt-5 h-52 w-full" role="img" aria-label="Pie chart of repair cost distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={44}
                    outerRadius={70}
                    paddingAngle={2}
                    strokeWidth={2}
                    stroke="#ffffff"
                    animationDuration={1200}
                    animationEasing="ease-out"
                    labelLine={false}
                    label={({ percent }) => `${Math.round(percent * 100)}%`}
                  >
                    {items.map((entry, index) => (
                      <Cell key={entry.name} fill={COST_PALETTE[index % COST_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
                    formatter={(value) => (
                      <span className="text-secondary-600 dark:text-dark-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

