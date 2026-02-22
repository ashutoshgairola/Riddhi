// src/components/reports/CategoryComparisonChart.tsx
import { FC } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '../../utils';

interface CategoryData {
  name: string;
  current: number;
  previous: number;
}

interface CategoryComparisonChartProps {
  data: CategoryData[];
}

const CategoryComparisonChart: FC<CategoryComparisonChartProps> = ({ data }) => {
  const customTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (
      active &&
      payload &&
      payload.length &&
      payload[0].value !== undefined &&
      payload[1].value !== undefined
    ) {
      return (
        <div className="bg-white dark:bg-gray-700 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-sm">
          <p className="font-medium dark:text-gray-100">{label}</p>
          <p className="text-green-600">Current: {formatCurrency(payload[0].value, 'INR')}</p>
          <p className="text-blue-600">Previous: {formatCurrency(payload[1].value, 'INR')}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {payload[0].value > payload[1].value
              ? `Increased by ${formatCurrency(payload[0].value - payload[1].value, 'INR')}`
              : `Decreased by ${formatCurrency(payload[1].value - payload[0].value, 'INR')}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-gray-100">Category Comparison</h2>
      </div>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => `${value}`}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              <Bar dataKey="current" name="Current Period" fill="#4CAF50" barSize={10} />
              <Bar dataKey="previous" name="Previous Period" fill="#2196F3" barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CategoryComparisonChart;
