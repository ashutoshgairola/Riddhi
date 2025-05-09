// src/components/budgets/CreateBudgetForm.tsx
import { FC, useState } from 'react';

import { AlertCircle, X } from 'lucide-react';

import { BudgetCreateDTO } from '../../types/budget.types';

interface CreateBudgetFormProps {
  onClose: () => void;
  onSubmit: (data: BudgetCreateDTO) => Promise<void>;
}

const CreateBudgetForm: FC<CreateBudgetFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<{
    name: string;
    startDate: string;
    endDate: string;
    income: string;
  }>({
    name: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split('T')[0], // Default to end of current month
    income: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Budget name is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      errors.endDate = 'End date must be after start date';
    }

    if (
      !formData.income ||
      isNaN(parseFloat(formData.income)) ||
      parseFloat(formData.income) <= 0
    ) {
      errors.income = 'Income must be a positive number';
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
      // Prepare the data for submission
      const budgetData: BudgetCreateDTO = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        income: parseFloat(formData.income),
        categories: [], // Start with no categories, they can be added later
      };

      await onSubmit(budgetData);
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
      setFormErrors({
        ...formErrors,
        submit: 'Failed to create budget. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a default budget name based on month and year
  const suggestBudgetName = () => {
    const today = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return `${monthNames[today.getMonth()]} ${today.getFullYear()}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Budget</h2>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={suggestBudgetName()}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              formErrors.startDate ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          {formErrors.startDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {formErrors.startDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              formErrors.endDate ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          {formErrors.endDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {formErrors.endDate}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income*</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            ₹
          </span>
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`w-full px-8 py-2 border ${
              formErrors.income ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>
        {formErrors.income && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.income}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-4">
          After creating your budget, you can add categories to track specific expenses.
        </p>

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
            {isSubmitting ? 'Creating...' : 'Create Budget'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateBudgetForm;
