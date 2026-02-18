// src/components/transactions/TransactionCategorySelect.tsx
import { FC, useState } from 'react';

import { TransactionCategory } from '../../types/transaction.types';

interface TransactionCategorySelectProps {
  categories: TransactionCategory[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
  error?: string;
}

const TransactionCategorySelect: FC<TransactionCategorySelectProps> = ({
  categories,
  selectedCategoryId,
  onChange,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group categories by parent/subcategory
  const categorizedItems = categories.reduce<{
    mainCategories: TransactionCategory[];
    subcategories: Record<string, TransactionCategory[]>;
  }>(
    (acc, category) => {
      if (!category.parentId) {
        acc.mainCategories.push(category);
      } else {
        if (!acc.subcategories[category.parentId]) {
          acc.subcategories[category.parentId] = [];
        }
        acc.subcategories[category.parentId].push(category);
      }
      return acc;
    },
    { mainCategories: [], subcategories: {} },
  );

  // Filter categories based on search term
  const filterCategories = (category: TransactionCategory): boolean => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Get filtered main categories and their subcategories
  const filteredMainCategories = categorizedItems.mainCategories.filter(filterCategories);
  const filteredSubcategories: Record<string, TransactionCategory[]> = {};

  // Include subcategories if they match the search term or their parent does
  categorizedItems.mainCategories.forEach((mainCat) => {
    const subcats = categorizedItems.subcategories[mainCat.id] || [];
    const filteredSubs = subcats.filter(filterCategories);

    if (filteredSubs.length > 0 || (filterCategories(mainCat) && subcats.length > 0)) {
      filteredSubcategories[mainCat.id] = filterCategories(mainCat) ? subcats : filteredSubs;
    }
  });

  const renderCategory = (category: TransactionCategory, isSubcategory = false) => {
    const isSelected = selectedCategoryId === category.id;

    return (
      <div
        key={category.id}
        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
          isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
        } ${isSubcategory ? 'pl-8' : ''}`}
        onClick={() => onChange(category.id)}
      >
        <div
          className={`${isSubcategory ? 'w-3 h-3' : 'w-4 h-4'} rounded-full mr-2`}
          style={{ backgroundColor: category.color || '#9e9e9e' }}
        ></div>
        <div>
          <span className={`dark:text-gray-200 ${isSubcategory ? 'text-sm' : ''}`}>
            {category.name}
          </span>
          {category.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="relative mb-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className={`w-full px-3 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
      </div>

      <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
        {filteredMainCategories.length === 0 && Object.keys(filteredSubcategories).length === 0 ? (
          <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
            No categories found
          </div>
        ) : (
          <>
            {filteredMainCategories.map((category) => (
              <div key={category.id}>
                {renderCategory(category)}
                {filteredSubcategories[category.id]?.map((subcategory) =>
                  renderCategory(subcategory, true),
                )}
              </div>
            ))}

            {/* Show subcategories whose parents don't match the search */}
            {Object.entries(filteredSubcategories).map(([parentId, subcats]) => {
              const parent = categorizedItems.mainCategories.find((cat) => cat.id === parentId);
              if (!parent || filterCategories(parent)) return null;

              return subcats.map((subcategory) => renderCategory(subcategory, true));
            })}
          </>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TransactionCategorySelect;
