// src/components/budgets/BudgetCategoryForm.tsx
import { FC, useEffect, useRef, useState } from 'react';

import { AlertCircle, ChevronDown, Search, X } from 'lucide-react';

import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import { BudgetCategory, BudgetCategoryCreateDTO } from '../../types/budget.types';
import Spinner from '../common/Spinner';

interface BudgetCategoryFormProps {
  onClose: () => void;
  onSubmit?: (data: BudgetCategoryCreateDTO) => void;
  initialData?: BudgetCategory | null;
}

// Color palette for budget categories
const colorPalette = [
  '#4CAF50',
  '#2196F3',
  '#FFC107',
  '#9C27B0',
  '#FF5722',
  '#607D8B',
  '#795548',
  '#009688',
  '#E91E63',
  '#3F51B5',
];

const BudgetCategoryForm: FC<BudgetCategoryFormProps> = ({ onClose, onSubmit, initialData }) => {
  // Fetch transaction categories to link budget categories to them
  const { categories: transactionCategories, loading: categoriesLoading } =
    useTransactionCategories();

  const [formData, setFormData] = useState<BudgetCategoryCreateDTO>({
    name: initialData?.name || '',
    allocated: initialData?.allocated || 0,
    categoryIds: initialData?.categoryId ? [initialData.categoryId] : [],
    color: initialData?.color || colorPalette[0],
    notes: initialData?.notes || '',
    rollover: initialData?.rollover || false,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categoryId ? [initialData.categoryId] : [],
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        allocated: initialData.allocated,
        categoryIds: initialData.categoryId ? [initialData.categoryId] : [],
        color: initialData.color || colorPalette[0],
        notes: initialData.notes || '',
        rollover: initialData.rollover || false,
      });
      setSelectedCategories(initialData.categoryId ? [initialData.categoryId] : []);
    }
  }, [initialData]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color,
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelectedCategories);

    // Update formData with all selected categoryIds
    setFormData({
      ...formData,
      categoryIds: newSelectedCategories,
    });

    // Clear error for this field
    if (formErrors.categoryIds) {
      setFormErrors({
        ...formErrors,
        categoryIds: '',
      });
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setSearchQuery('');
  };

  // Filter categories based on search query
  const filteredCategories = transactionCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }

    if (!formData.allocated || formData.allocated <= 0) {
      errors.allocated = 'Budget amount must be a positive number';
    }

    if (selectedCategories.length === 0) {
      errors.categoryIds = 'Please select at least one transaction category';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100">
          {initialData ? 'Edit Category' : 'Add Category'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category Name*
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border ${
            formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          placeholder="e.g. Housing, Food, Transport"
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Budget Amount*
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            ₹
          </span>
          <input
            type="number"
            name="allocated"
            value={formData.allocated || ''}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className={`w-full px-8 py-2 border ${
              formErrors.allocated ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="0.00"
          />
        </div>
        {formErrors.allocated && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.allocated}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Transaction Categories*
        </label>
        {categoriesLoading ? (
          <div className="flex items-center space-x-2 h-10">
            <Spinner size="sm" />
            <span className="text-gray-500 dark:text-gray-400">Loading categories...</span>
          </div>
        ) : (
          <>
            {/* Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Trigger */}
              <button
                type="button"
                onClick={toggleDropdown}
                className={`w-full px-3 py-2 text-left border ${
                  formErrors.categoryIds ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between`}
              >
                <div className="flex-1 min-w-0">
                  {selectedCategories.length === 0 ? (
                    <span className="text-gray-500 dark:text-gray-400">
                      Select transaction categories
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.map((categoryId) => {
                        const category = transactionCategories.find((cat) => cat.id === categoryId);
                        if (!category) return null;

                        return (
                          <div
                            key={categoryId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded text-xs"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color || '#6b7280' }}
                            ></div>
                            <span className="truncate max-w-20">{category.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ml-2 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2 py-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Category Options */}
                  <div className="py-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategoryToggle(category.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center space-x-3"
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color || '#6b7280' }}
                            ></div>
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              {category.name}
                            </span>
                          </div>
                          {selectedCategories.includes(category.id) && (
                            <div className="text-green-600">✓</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No categories found' : 'No categories available'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {formErrors.categoryIds && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" /> {formErrors.categoryIds}
              </p>
            )}
          </>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Link this budget category to one or more transaction categories
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {colorPalette.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full ${
                formData.color === color
                  ? 'ring-2 ring-offset-2 ring-gray-500 dark:ring-offset-gray-800'
                  : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            ></button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Add any additional details here..."
        ></textarea>
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rollover"
            name="rollover"
            checked={formData.rollover}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
          />
          <label htmlFor="rollover" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Roll over unused budget to next month
          </label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          If enabled, any unspent amount will be added to next month's budget for this category
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {initialData ? 'Update' : 'Add'} Category
        </button>
      </div>
    </form>
  );
};

export default BudgetCategoryForm;
