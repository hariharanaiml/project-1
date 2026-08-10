import { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import ChartCard from './ChartCard';
import {
  SEVERITY_PALETTE,
  TOOLTIP_STYLE,
  AXIS_STROKE,
  GRID_STROKE,
} from './chartTheme';

/**
 * SeverityChart - Bar chart of severity level distribution.
 *
 * @param {Object} props
 * @param {Array<{severity: string, count: number}>} props.data - Severity data
 */
function SeverityChart({ data = [] }) {
  return (
    <ChartCard
      title="Severity Levels"
      subtitle="Reports by severity classification"
      aria-label="Severity level distribution bar chart"
    >
      <div className="h-64 w-full" role="img" aria-label="Bar chart of severity levels">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="severity"
              tick={{ fontSize: 11, fill: '#667085' }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#667085' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              formatter={(value) => [`${value} reports`, 'Count']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1300} animationEasing="ease-out">
              {data.map((entry, index) => (
                <Cell
                  key={entry.severity}
                  fill={SEVERITY_PALETTE[index % SEVERITY_PALETTE.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default memo(SeverityChart);

