// src/components/budgets/BudgetCategoryForm.tsx
import { FC, useState } from 'react';

import { X } from 'lucide-react';

import { BudgetCategory } from '../../types/budget.types';

interface BudgetCategoryFormProps {
  onClose: () => void;
  onSubmit?: (data: BudgetCategory) => void;
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
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    allocated: initialData?.allocated?.toString() || '',
    color: initialData?.color || colorPalette[0],
    notes: initialData?.notes || '',
    rollover: initialData?.rollover || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const processedData: BudgetCategory = {
      ...formData,
      allocated: parseFloat(formData.allocated),
      id: initialData?.id || '',
      spent: initialData?.spent || 0,
      categoryId: initialData?.categoryId || '',
    };

    if (onSubmit) {
      onSubmit(processedData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. Housing, Food, Transport"
        />
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
            value={formData.allocated}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>
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
