// src/components/investments/PortfolioPerformanceChart.tsx
import { FC } from 'react';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils';

interface PerformanceData {
  date: string;
  value: number;
}

interface PortfolioPerformanceChartProps {
  data: PerformanceData[];
}

const PortfolioPerformanceChart: FC<PortfolioPerformanceChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const customTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value?: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && payload[0].value !== undefined) {
      return (
        <div
          className={`p-3 border rounded shadow-sm ${isDark ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
        >
          <p className="font-medium">{formatDate(label ?? '')}</p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {formatCurrency(payload[0].value, 'INR')}
          </p>
        </div>
      );
    }
    return null;
  };

  const gridColor = isDark ? '#374151' : '#E0E0E0';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';
  const axisColor = isDark ? '#4b5563' : '#E0E0E0';

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow h-full`}>
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex justify-between items-center">
          <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Portfolio Performance
          </h2>
          <select
            className={`px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'}`}
          >
            <option>Last 12 months</option>
            <option>Last 6 months</option>
            <option>Last 3 months</option>
            <option>This year</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: tickColor }}
                axisLine={{ stroke: axisColor }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: tickColor }}
                axisLine={{ stroke: axisColor }}
                tickLine={false}
              />
              <Tooltip content={customTooltip} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4CAF50"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformanceChart;
