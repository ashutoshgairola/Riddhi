// src/components/dashboard/BudgetProgressWidget.tsx
import { FC } from 'react';

import { BudgetCategory } from '../../types/budget.types';
import { formatCurrency } from '../../utils';

// Dummy data
const budgetCategories: BudgetCategory[] = [
  {
    id: '1',
    name: 'Housing',
    allocated: 1500,
    spent: 1500,
    categoryId: '1',
    color: '#4CAF50',
  },
  {
    id: '2',
    name: 'Food',
    allocated: 600,
    spent: 450,
    categoryId: '2',
    color: '#2196F3',
  },
  {
    id: '3',
    name: 'Transport',
    allocated: 300,
    spent: 275,
    categoryId: '3',
    color: '#FFC107',
  },
  {
    id: '4',
    name: 'Entertainment',
    allocated: 400,
    spent: 385,
    categoryId: '4',
    color: '#9C27B0',
  },
  {
    id: '5',
    name: 'Utilities',
    allocated: 350,
    spent: 310,
    categoryId: '5',
    color: '#FF5722',
  },
];

const BudgetProgressWidget: FC = () => {
  const calculatePercentage = (spent: number, allocated: number): number => {
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Budget Progress</h2>
          <button className="text-blue-600 text-sm font-medium">Manage</button>
        </div>
      </div>
      <div className="p-6">
        {budgetCategories.map((category) => (
          <div key={category.id} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <p className="font-medium">{category.name}</p>
              <p className="text-sm">
                {formatCurrency(category.spent, 'INR')}{' '}
                <span className="text-gray-500">/ {formatCurrency(category.allocated, 'INR')}</span>
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${calculatePercentage(category.spent, category.allocated)}%`,
                  backgroundColor: category.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetProgressWidget;
