import { memo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';
import { DAMAGE_TYPE_PALETTE, TOOLTIP_STYLE } from './chartTheme';

/**
 * DamageTypeChart - Pie chart of damage type distribution with legend.
 *
 * @param {Object} props
 * @param {Array<{name: string, value: number}>} props.data - Damage type data
 */
function DamageTypeChart({ data = [] }) {
  return (
    <ChartCard
      title="Damage Types"
      subtitle="Distribution of reported damage categories"
      aria-label="Damage type distribution pie chart"
    >
      <div className="h-64 w-full" role="img" aria-label="Pie chart of damage type distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#ffffff"
              animationDuration={1200}
              animationEasing="ease-out"
              labelLine={false}
              label={({ percent }) => `${Math.round(percent * 100)}%`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={DAMAGE_TYPE_PALETTE[index % DAMAGE_TYPE_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => [`${value} reports`, name]}
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
    </ChartCard>
  );
}

export default memo(DamageTypeChart);

