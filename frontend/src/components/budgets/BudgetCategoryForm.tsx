// src/components/budgets/BudgetCategoryForm.tsx
import { FC, useEffect, useState } from 'react';

import { AlertCircle, X } from 'lucide-react';

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
    categoryId: initialData?.categoryId || '',
    color: initialData?.color || colorPalette[0],
    notes: initialData?.notes || '',
    rollover: initialData?.rollover || false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        allocated: initialData.allocated,
        categoryId: initialData.categoryId,
        color: initialData.color || colorPalette[0],
        notes: initialData.notes || '',
        rollover: initialData.rollover || false,
      });
    }
  }, [initialData]);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }

    if (!formData.allocated || formData.allocated <= 0) {
      errors.allocated = 'Budget amount must be a positive number';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Please select a transaction category';
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
        <h2 className="text-xl font-bold">{initialData ? 'Edit Category' : 'Add Category'}</h2>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          placeholder="e.g. Housing, Food, Transport"
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount*</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
              formErrors.allocated ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction Category*
        </label>
        {categoriesLoading ? (
          <div className="flex items-center space-x-2 h-10">
            <Spinner size="sm" />
            <span className="text-gray-500">Loading categories...</span>
          </div>
        ) : (
          <>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border ${
                formErrors.categoryId ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Select a transaction category</option>
              {transactionCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" /> {formErrors.categoryId}
              </p>
            )}
          </>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Link this budget category to a transaction category
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <div className="flex flex-wrap gap-2">
          {colorPalette.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
            ></button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="rollover" className="ml-2 block text-sm text-gray-700">
            Roll over unused budget to next month
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          If enabled, any unspent amount will be added to next month's budget for this category
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
