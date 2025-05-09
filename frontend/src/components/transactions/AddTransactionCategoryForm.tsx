// src/components/transactions/AddTransactionCategoryForm.tsx
import { FC, useState } from 'react';

import { AlertCircle, X } from 'lucide-react';

import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import { CategoryCreateDTO, CategoryUpdateDTO } from '../../services/api/categoryService';
import { TransactionCategory } from '../../types/transaction.types';

interface AddTransactionCategoryFormProps {
  onClose: () => void;
  onSubmit: (data: CategoryCreateDTO | CategoryUpdateDTO) => Promise<void>;
  initialData?: TransactionCategory | null;
}

// Color palette for transaction categories
const colorPalette = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#FF5722', // Deep Orange
  '#607D8B', // Blue Grey
  '#795548', // Brown
  '#009688', // Teal
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#F44336', // Red
  '#00BCD4', // Cyan
];

// Icon options for categories
const iconOptions = [
  { value: 'home', label: 'Home' },
  { value: 'shopping-cart', label: 'Shopping Cart' },
  { value: 'utensils', label: 'Food & Dining' },
  { value: 'car', label: 'Transportation' },
  { value: 'film', label: 'Entertainment' },
  { value: 'dumbbell', label: 'Fitness' },
  { value: 'book', label: 'Education' },
  { value: 'briefcase', label: 'Work' },
  { value: 'heart', label: 'Health' },
  { value: 'wallet', label: 'Finance' },
  { value: 'gift', label: 'Gifts' },
  { value: 'plane', label: 'Travel' },
  { value: 'dollar-sign', label: 'Income' },
  { value: 'zap', label: 'Utilities' },
  { value: 'package', label: 'Subscriptions' },
  { value: 'more-horizontal', label: 'Other' },
];

const AddTransactionCategoryForm: FC<AddTransactionCategoryFormProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  // Fetch all categories to show as parent options
  const { categories } = useTransactionCategories();

  // Filter out subcategories and the current category (to prevent self-referencing)
  const parentCategories = categories.filter((cat) => !cat.parentId && cat.id !== initialData?.id);

  const [formData, setFormData] = useState<CategoryCreateDTO>({
    name: initialData?.name || '',
    color: initialData?.color || colorPalette[0],
    icon: initialData?.icon || 'more-horizontal',
    // description: initialData?.description || '',
    parentId: initialData?.parentId || undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value || undefined, // Convert empty string to undefined for optional fields
    });

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

    if (!formData.color) {
      errors.color = 'Please select a color';
    }

    if (!formData.icon) {
      errors.icon = 'Please select an icon';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData) {
        // Update existing category
        const updateData: CategoryUpdateDTO = {
          id: initialData.id,
          ...formData,
        };
        await onSubmit(updateData);
      } else {
        // Create new category
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting category:', error);
      setFormErrors({
        ...formErrors,
        submit: 'Failed to save category. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {initialData ? 'Edit Transaction Category' : 'Add Transaction Category'}
        </h2>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {formErrors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {formErrors.submit}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Groceries, Entertainment, Transportation"
          className={`w-full px-3 py-2 border ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color*</label>
        <div className="flex flex-wrap gap-2">
          {colorPalette.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-10 h-10 rounded-full border-2 ${
                formData.color === color
                  ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-500'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              title={color}
            />
          ))}
        </div>
        {formErrors.color && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.color}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Icon*</label>
        <select
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            formErrors.icon ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
        >
          <option value="">Select an icon</option>
          {iconOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {formErrors.icon && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.icon}
          </p>
        )}
      </div>
      {/* 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add a description for this category..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div> */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
        <select
          name="parentId"
          value={formData.parentId || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">None (Make this a main category)</option>
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {formData.parentId ? 'This will be a subcategory' : 'This will be a main category'}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add'} Category
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddTransactionCategoryForm;
