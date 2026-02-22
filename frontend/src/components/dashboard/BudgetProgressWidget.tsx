// src/components/dashboard/BudgetProgressWidget.tsx
import { FC } from 'react';
import { Link } from 'react-router-dom';

import { BudgetCategoryProgress } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils';

interface BudgetProgressWidgetProps {
  budgetProgress: BudgetCategoryProgress[];
  loading?: boolean;
}

const BudgetProgressWidget: FC<BudgetProgressWidgetProps> = ({ budgetProgress, loading }) => {
  const calculatePercentage = (spent: number, allocated: number): number => {
    if (allocated === 0) return 0;
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100">Budget Progress</h2>
          <Link
            to="/budgets"
            className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline"
          >
            Manage
          </Link>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" />
              </div>
            ))}
          </div>
        ) : budgetProgress.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">
            No active budget found
          </p>
        ) : (
          budgetProgress.map((category, idx) => {
            const pct = calculatePercentage(category.spent, category.allocated);
            const overBudget = category.spent > category.allocated;
            return (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium dark:text-gray-200">{category.name}</p>
                  <p className="text-sm dark:text-gray-300">
                    <span className={overBudget ? 'text-red-500' : ''}>
                      {formatCurrency(category.spent, 'INR')}
                    </span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">
                      / {formatCurrency(category.allocated, 'INR')}
                    </span>
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: overBudget ? '#ef4444' : (category.color ?? '#16a34a'),
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetProgressWidget;
