// src/components/dashboard/CashFlowWidget.tsx
import { FC } from 'react';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CashFlowPoint } from '../../types/dashboard.types';

interface CashFlowWidgetProps {
  cashFlow: CashFlowPoint[];
  loading?: boolean;
}

const CashFlowWidget: FC<CashFlowWidgetProps> = ({ cashFlow, loading }) => {
  const fmtINR = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100">Cash Flow</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</span>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        ) : cashFlow.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            No cash flow data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v: string) => v.split(' ')[0]}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v: number) => fmtINR(v)}
                  tick={{ fontSize: 11 }}
                  width={70}
                />
                <Tooltip formatter={(value: number) => fmtINR(value)} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#16a34a"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowWidget;
