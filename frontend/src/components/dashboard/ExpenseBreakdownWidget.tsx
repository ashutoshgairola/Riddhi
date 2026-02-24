// src/components/dashboard/ExpenseBreakdownWidget.tsx
import { FC } from 'react';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ExpenseCategory } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils';

const PALETTE = ['#16a34a', '#4ade80', '#86efac', '#15803d', '#166534', '#bbf7d0'];

interface ExpenseBreakdownWidgetProps {
  expenseBreakdown: ExpenseCategory[];
  loading?: boolean;
}

const ExpenseBreakdownWidget: FC<ExpenseBreakdownWidgetProps> = ({ expenseBreakdown, loading }) => {
  const chartData = expenseBreakdown.map((e, i) => ({
    name: e.categoryName,
    value: e.amount,
    color: e.color || PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full">
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100">Expense Breakdown</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">This month</span>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            No expenses this month
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number, 'INR')} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseBreakdownWidget;
