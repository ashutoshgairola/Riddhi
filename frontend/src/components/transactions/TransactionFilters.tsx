// src/components/transactions/TransactionFilters.tsx
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import debounce from 'lodash/debounce';
import { Filter, Search, X } from 'lucide-react';

import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import {
  TransactionFilters as FilterType,
  TransactionStatus,
  TransactionType,
} from '../../types/transaction.types';

interface TransactionFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

const TransactionFilters: FC<TransactionFiltersProps> = ({ filters, onFilterChange }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);
  const { categories } = useTransactionCategories();

  // Create a reference to store the previous filters for comparison
  const prevFiltersRef = useRef<FilterType>(filters);

  // Create a memoized debounced filter change function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFilterChange = useCallback(
    debounce((newFilters: FilterType) => {
      onFilterChange(newFilters);
    }, 500),
    [onFilterChange],
  );

  // Update local filters when parent filters change
  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current)) {
      setLocalFilters(filters);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Apply filters when local filters change
  useEffect(() => {
    // Don't trigger on initial render if filters are empty
    if (JSON.stringify(localFilters) !== JSON.stringify(prevFiltersRef.current)) {
      debouncedFilterChange(localFilters);
      prevFiltersRef.current = localFilters;
    }

    // Cleanup debounced function on unmount
    return () => {
      debouncedFilterChange.cancel();
    };
  }, [localFilters, debouncedFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };

  const handleTypeChange = (type: TransactionType) => {
    const currentTypes = localFilters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    setLocalFilters((prev) => ({
      ...prev,
      types: newTypes.length > 0 ? newTypes : undefined,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategories = Array.from(e.target.selectedOptions).map((option) => option.value);

    setLocalFilters((prev) => ({
      ...prev,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    }));
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;

    setLocalFilters((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: e.target.value ? [e.target.value as TransactionStatus] : undefined,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setLocalFilters((prev) => ({
      ...prev,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: undefined,
      endDate: undefined,
      types: undefined,
      categoryIds: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      searchTerm: '',
      tags: undefined,
      status: undefined,
      page: 1,
      limit: filters.limit,
      sort: filters.sort,
      order: filters.order,
    };

    setLocalFilters(clearedFilters);
    // Apply changes immediately for clear filters
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Boolean(
    localFilters.types?.length ||
      localFilters.startDate ||
      localFilters.endDate ||
      localFilters.categoryIds?.length ||
      localFilters.minAmount ||
      localFilters.maxAmount ||
      localFilters.tags?.length ||
      localFilters.status?.length ||
      localFilters.searchTerm,
  );

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={localFilters.searchTerm || ''}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg border ${
              showAdvancedFilters
                ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500'
                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            } transition-colors flex items-center gap-2`}
            onClick={toggleAdvancedFilters}
            type="button"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              onClick={handleClearFilters}
              type="button"
            >
              <X size={18} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilters.types?.includes('income')
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                  onClick={() => handleTypeChange('income')}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilters.types?.includes('expense')
                      ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                  onClick={() => handleTypeChange('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilters.types?.includes('transfer')
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}
                  onClick={() => handleTypeChange('transfer')}
                >
                  Transfer
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
                <input
                  type="date"
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="pl-7 pr-3 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={localFilters.minAmount || ''}
                    onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="pl-7 pr-3 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={localFilters.maxAmount || ''}
                    onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categories
              </label>
              <select
                className="px-3 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                multiple
                size={3}
                value={localFilters.categoryIds || []}
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="px-3 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={localFilters.status?.[0] || ''}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="cleared">Cleared</option>
                <option value="reconciled">Reconciled</option>
                <option value="void">Void</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <input
                type="text"
                placeholder="food, bills, etc."
                className="px-3 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={localFilters.tags?.join(', ') || ''}
                onChange={handleTagsChange}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate tags with commas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;
