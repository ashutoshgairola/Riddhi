// src/components/budgets/BudgetSummary.tsx
import { FC } from 'react';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Budget } from '../../types/budget.types';

interface BudgetSummaryProps {
  budget: Budget;
}

const BudgetSummary: FC<BudgetSummaryProps> = ({ budget }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculatePercentage = (amount: number, total: number): string => {
    return `${Math.round((amount / total) * 100)}%`;
  };

  const remainingBudget = budget.totalAllocated - budget.totalSpent;
  const remainingIncome = budget.income - budget.totalAllocated;

  // Chart data
  const chartData = [
    { name: 'Spent', value: budget.totalSpent, color: '#F44336' },
    { name: 'Remaining Budget', value: remainingBudget, color: '#4CAF50' },
    { name: 'Unallocated Income', value: remainingIncome, color: '#2196F3' },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">{budget.name} Budget Summary</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget.income)}</p>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Budgeted</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budget.totalAllocated)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculatePercentage(budget.totalAllocated, budget.income)} of income
                  </p>
                </div>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Spent</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(budget.totalSpent)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculatePercentage(budget.totalSpent, budget.totalAllocated)} of budget
                  </p>
                </div>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Remaining Budget</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(remainingBudget)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculatePercentage(remainingBudget, budget.totalAllocated)} of budget
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 md:h-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;
