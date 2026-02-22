// src/components/budgets/BudgetCategoryList.tsx
import { FC, useState } from 'react';

import {
  AlertTriangle,
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowUpAZ,
  Edit2,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import { BudgetCategory } from '../../types/budget.types';
import { formatCurrency } from '../../utils';
import { getIconComponent } from '../../utils/iconUtils';
import Spinner from '../common/Spinner';

interface BudgetCategoryListProps {
  categories: BudgetCategory[];
  onEditCategory: (category: BudgetCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  readOnly?: boolean;
  loading?: boolean;
}

type SortOption = 'progress' | 'allocated' | 'spent' | 'name';
type SortOrder = 'asc' | 'desc';

const SORT_CYCLES: { sort: SortOption; order: SortOrder }[] = [
  { sort: 'progress', order: 'desc' },
  { sort: 'allocated', order: 'desc' },
  { sort: 'spent', order: 'desc' },
  { sort: 'name', order: 'asc' },
];

const SORT_LABELS: Record<SortOption, string> = {
  progress: 'Progress',
  allocated: 'Budget',
  spent: 'Spent',
  name: 'Name',
};

const BudgetCategoryList: FC<BudgetCategoryListProps> = ({
  categories,
  onEditCategory,
  onDeleteCategory,
  readOnly = false,
  loading = false,
}) => {
  const { categories: transactionCategories } = useTransactionCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const currentSort = SORT_CYCLES[sortIndex];

  const calculatePercentage = (spent: number, allocated: number): number => {
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  const processedCategories = categories
    .filter((c) => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const dir = currentSort.order === 'asc' ? 1 : -1;
      switch (currentSort.sort) {
        case 'progress': {
          const pA = a.allocated ? a.spent / a.allocated : 0;
          const pB = b.allocated ? b.spent / b.allocated : 0;
          return (pA - pB) * dir;
        }
        case 'allocated':
          return (a.allocated - b.allocated) * dir;
        case 'spent':
          return (a.spent - b.spent) * dir;
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        default:
          return 0;
      }
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header with search + sort */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 shrink-0 mr-auto">
          {processedCategories.length} Categor{processedCategories.length !== 1 ? 'ies' : 'y'}
        </span>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-7 py-1.5 w-44 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort cycling button */}
        <button
          title={`Sort: ${SORT_LABELS[currentSort.sort]} ${currentSort.order === 'asc' ? '↑' : '↓'} — click to cycle`}
          onClick={() => setSortIndex((i) => (i + 1) % SORT_CYCLES.length)}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {currentSort.sort === 'name' && currentSort.order === 'asc' && <ArrowUpAZ size={16} />}
          {currentSort.sort === 'name' && currentSort.order === 'desc' && <ArrowDownAZ size={16} />}
          {currentSort.sort !== 'name' && currentSort.order === 'desc' && <ArrowDown10 size={16} />}
          {currentSort.sort !== 'name' && currentSort.order === 'asc' && <ArrowDown01 size={16} />}
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="md" />
          </div>
        ) : processedCategories.length > 0 ? (
          <div className="space-y-4">
            {processedCategories.map((category) => {
              const percentage = calculatePercentage(category.spent, category.allocated);
              const isOverBudget = category.spent > category.allocated;
              const isNearLimit = percentage >= 90 && !isOverBudget;

              return (
                <div
                  key={category.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: category.color || '#9e9e9e' }}
                      ></div>
                      <div>
                        <h3 className="font-medium dark:text-gray-100">{category.name}</h3>
                        {/* Transaction Category Badges */}
                        {category.categoryIds && category.categoryIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {category.categoryIds.map((categoryId) => {
                              const transactionCategory = transactionCategories.find(
                                (cat) => cat.id === categoryId,
                              );
                              if (!transactionCategory) return null;

                              return (
                                <span
                                  key={categoryId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                                >
                                  {transactionCategory.icon ? (
                                    (() => {
                                      const IconComponent = getIconComponent(
                                        transactionCategory.icon,
                                      );
                                      return (
                                        <IconComponent
                                          size={12}
                                          style={{ color: transactionCategory.color || '#6b7280' }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor: transactionCategory.color || '#6b7280',
                                      }}
                                    ></div>
                                  )}
                                  {transactionCategory.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-2"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(category.spent, 'INR')} of{' '}
                      {formatCurrency(category.allocated, 'INR')}
                    </p>
                    <p className="text-sm font-medium dark:text-gray-300">{percentage}%</p>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                      {category.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? (
              <p>No categories match &quot;{searchTerm}&quot;</p>
            ) : (
              <>
                <p>No budget categories found</p>
                {!readOnly && (
                  <p className="mt-2 text-sm">
                    Click &quot;Add Category&quot; to create your first budget category
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCategoryList;
