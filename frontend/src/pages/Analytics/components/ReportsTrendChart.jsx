import { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ChartCard from './ChartCard';
import {
  CHART_COLORS,
  TOOLTIP_STYLE,
  AXIS_STROKE,
  GRID_STROKE,
} from './chartTheme';

/**
 * ReportsTrendChart - Monthly reports trend LineChart for the last 12 months.
 *
 * @param {Object} props
 * @param {Array<{month: string, reports: number}>} props.data - Monthly trend data
 */
function ReportsTrendChart({ data = [] }) {
  return (
    <ChartCard
      title="Reports Trend"
      subtitle="Monthly reports for the last 12 months"
      aria-label="Monthly reports trend chart"
    >
      <div className="h-64 w-full" role="img" aria-label="Line chart of monthly reports trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="month"
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
              cursor={{ stroke: CHART_COLORS.secondary, strokeDasharray: '4 4' }}
              formatter={(value) => [`${value} reports`, 'Reports']}
            />
            <Line
              type="monotone"
              dataKey="reports"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 5 }}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default memo(ReportsTrendChart);

