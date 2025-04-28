// src/components/transactions/TransactionCategorySelect.tsx
import { FC, useState } from 'react';

import { TransactionCategory } from '../../types/transaction.types';

interface TransactionCategorySelectProps {
  categories: TransactionCategory[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
}

const TransactionCategorySelect: FC<TransactionCategorySelectProps> = ({
  categories,
  selectedCategoryId,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full">
      <div className="relative mb-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                selectedCategoryId === category.id ? 'bg-green-50' : ''
              }`}
              onClick={() => onChange(category.id)}
            >
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: category.color || '#9e9e9e' }}
              ></div>
              <span>{category.name}</span>
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-center text-gray-500">No categories found</div>
        )}
      </div>
    </div>
  );
};

export default TransactionCategorySelect;
