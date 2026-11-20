import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Card } from '../../../../components/common/Card';
import { TOOLTIP_STYLE, GRID_STROKE, AXIS_STROKE } from '../../../../pages/Analytics/components/chartTheme';

const PALETTE = ['#2970ff', '#12b76a', '#f79009', '#f04438', '#7a5af8', '#0ea5e9', '#98a2b3'];

function tooltipFormatter(value) {
    return [`${value} damages`, 'Count'];
}

export default function DamageBreakdown({ data = [] }) {
    const items = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const hasData = items.some((item) => Number(item.value) > 0);
    const chartData = items.filter((item) => Number(item.value) > 0);

    if (!hasData) {
        return (
            <Card bordered className="p-6">
                <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 mb-2">
                    Damage Breakdown
                </h3>
                <p className="text-sm text-secondary-500 dark:text-dark-400">
                    No inspection data available.
                </p>
            </Card>
        );
    }

    return (
        <Card bordered className="h-full">
            <div className="p-4 sm:p-5">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                        Damage Breakdown
                    </h3>
                    <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                        Detected damage categories from real inspections
                    </p>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: AXIS_STROKE }} interval={0} angle={-18} textAnchor="end" height={50} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: AXIS_STROKE }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} cursor={{ fill: 'rgba(41, 112, 255, 0.06)' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={900}>
                                {chartData.map((entry, index) => (
                                    <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
}