// src/components/budgets/BudgetCategoryList.tsx
import { FC } from 'react';

import { AlertTriangle, Edit2, Trash2 } from 'lucide-react';

import { BudgetCategory } from '../../types/budget.types';
import { formatCurrency } from '../../utils';
import Spinner from '../common/Spinner';

interface BudgetCategoryListProps {
  categories: BudgetCategory[];
  onEditCategory: (category: BudgetCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  readOnly?: boolean;
  loading?: boolean;
}

const BudgetCategoryList: FC<BudgetCategoryListProps> = ({
  categories,
  onEditCategory,
  onDeleteCategory,
  readOnly = false,
  loading = false,
}) => {
  const calculatePercentage = (spent: number, allocated: number): number => {
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  const sortedCategories = [...categories].sort((a, b) => {
    // Sort by percentage spent (descending)
    const percentA = calculatePercentage(a.spent, a.allocated);
    const percentB = calculatePercentage(b.spent, b.allocated);
    return percentB - percentA;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Budget Categories</h2>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option>Sort by Progress</option>
            <option>Sort by Amount</option>
            <option>Sort by Name</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="md" />
          </div>
        ) : sortedCategories.length > 0 ? (
          <div className="space-y-4">
            {sortedCategories.map((category) => {
              const percentage = calculatePercentage(category.spent, category.allocated);
              const isOverBudget = category.spent > category.allocated;
              const isNearLimit = percentage >= 90 && !isOverBudget;

              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: category.color || '#9e9e9e' }}
                      ></div>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>

                    <div className="flex items-center">
                      {isOverBudget && (
                        <div className="text-red-600 mr-2 flex items-center">
                          <AlertTriangle size={16} className="mr-1" />
                          <span className="text-xs">Over budget</span>
                        </div>
                      )}
                      {isNearLimit && (
                        <div className="text-yellow-600 mr-2 flex items-center">
                          <AlertTriangle size={16} className="mr-1" />
                          <span className="text-xs">Near limit</span>
                        </div>
                      )}

                      {!readOnly && (
                        <>
                          <button
                            className="text-gray-400 hover:text-gray-600 mr-2"
                            onClick={() => onEditCategory(category)}
                            title="Edit category"
                          >
                            <Edit2 size={18} />
                          </button>

                          {onDeleteCategory && (
                            <button
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => onDeleteCategory(category.id)}
                              title="Delete category"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-500">
                      {formatCurrency(category.spent, 'INR')} of{' '}
                      {formatCurrency(category.allocated, 'INR')}
                    </p>
                    <p className="text-sm font-medium">{percentage}%</p>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget ? 'bg-red-600' : isNearLimit ? 'bg-yellow-500' : ''
                      }`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: isOverBudget
                          ? undefined
                          : isNearLimit
                            ? undefined
                            : category.color,
                      }}
                    ></div>
                  </div>

                  {category.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">{category.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No budget categories found</p>
            {!readOnly && (
              <p className="mt-2 text-sm">
                Click "Add Category" to create your first budget category
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCategoryList;
