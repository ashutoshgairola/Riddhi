// src/components/transactions/AddTransactionForm.tsx
import { FC, useEffect, useState } from 'react';

import { isEmpty } from 'lodash';
import { AlertCircle, Clock, X } from 'lucide-react';

import {
  TransactionCategory,
  TransactionCreateDTO,
  TransactionStatus,
  TransactionType,
} from '../../types/transaction.types';
import Spinner from '../common/Spinner';

interface AddTransactionFormProps {
  onClose: () => void;
  onSubmit?: (data: TransactionCreateDTO) => void;
  initialData?: Partial<TransactionCreateDTO>;
  categories: TransactionCategory[];
  categoriesLoading: boolean;
}

const AddTransactionForm: FC<AddTransactionFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  categories,
  categoriesLoading,
}) => {
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);

  const [formData, setFormData] = useState<TransactionCreateDTO>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || 'expense',
    categoryId: initialData?.categoryId || '',
    accountId: initialData?.accountId || '',
    status: initialData?.status || 'cleared',
    notes: initialData?.notes || '',
    tags: initialData?.tags || [],
    isRecurring: initialData?.isRecurring || false,
    recurringDetails: initialData?.recurringDetails || {
      frequency: 'monthly',
      interval: 1,
      endDate: undefined,
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // When initialData changes (e.g. when editing a different transaction)
  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount || 0,
        date: initialData.date || new Date().toISOString().split('T')[0],
        type: initialData.type || 'expense',
        categoryId: initialData.categoryId || '',
        accountId: initialData.accountId || '',
        status: initialData.status || 'cleared',
        notes: initialData.notes || '',
        tags: initialData.tags || [],
        isRecurring: initialData.isRecurring || false,
        recurringDetails: initialData.recurringDetails || {
          frequency: 'monthly',
          interval: 1,
          endDate: undefined,
        },
      });

      setShowRecurringOptions(!!initialData.isRecurring);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
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

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
    });
  };

  const handleStatusChange = (status: TransactionStatus) => {
    setFormData({
      ...formData,
      status,
    });
  };

  const handleRecurringToggle = () => {
    setShowRecurringOptions(!showRecurringOptions);
    setFormData({
      ...formData,
      isRecurring: !showRecurringOptions,
    });
  };

  const handleRecurringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      recurringDetails: {
        ...formData.recurringDetails!,
        [name]: name === 'interval' ? parseInt(value, 10) : value,
      },
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString
      ? tagsString
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    setFormData({
      ...formData,
      tags: tagsArray,
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    if (!formData.accountId) {
      errors.accountId = 'Account is required';
    }

    if (formData.isRecurring) {
      if (!formData.recurringDetails?.frequency) {
        errors.frequency = 'Frequency is required';
      }

      if (!formData.recurringDetails?.interval || formData.recurringDetails.interval < 1) {
        errors.interval = 'Interval must be at least 1';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Process and submit the data
    const submitData: TransactionCreateDTO = {
      ...formData,
      amount: Number(formData.amount),
      // Remove recurringDetails if not recurring
      ...(!formData.isRecurring && { recurringDetails: undefined }),
    };

    if (onSubmit) {
      onSubmit(submitData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-gray-100">
          {initialData ? 'Edit Transaction' : 'Add Transaction'}
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
        <label className="flex justify-center space-x-4 mb-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg flex-1 ${
              formData.type === 'expense'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleTypeChange('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg flex-1 ${
              formData.type === 'income'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleTypeChange('income')}
          >
            Income
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg flex-1 ${
              formData.type === 'transfer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleTypeChange('transfer')}
          >
            Transfer
          </button>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description*
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border ${
            formErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          placeholder="e.g. Grocery shopping, Rent payment"
        />
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.description}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount*
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            ₹
          </span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className={`w-full px-8 py-2 border ${
              formErrors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            placeholder="0.00"
          />
        </div>
        {formErrors.amount && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.amount}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date*
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border ${
              formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          {formErrors.date && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {formErrors.date}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category*
          </label>
          {categoriesLoading ? (
            <div className="flex items-center space-x-2 h-10">
              <Spinner size="sm" />
              <span className="text-gray-500 dark:text-gray-400">Loading categories...</span>
            </div>
          ) : (
            <>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${
                  formErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
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
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Account*
        </label>
        <select
          name="accountId"
          value={formData.accountId}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 border ${
            formErrors.accountId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
        >
          <option value="">Select an account</option>
          <option value="1">Main Checking Account</option>
          <option value="2">Savings Account</option>
          <option value="3">Credit Card</option>
        </select>
        {formErrors.accountId && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {formErrors.accountId}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              formData.status === 'cleared'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleStatusChange('cleared')}
          >
            Cleared
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              formData.status === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleStatusChange('pending')}
          >
            Pending
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              formData.status === 'reconciled'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleStatusChange('reconciled')}
          >
            Reconciled
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-sm ${
              isEmpty(formData.status) || formData.status === 'void'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleStatusChange('void')}
          >
            Void
          </button>
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags?.join(', ')}
          onChange={handleTagsChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter tags separated by commas"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          E.g. food, bills, subscriptions
        </p>
      </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={handleRecurringToggle}
          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          <Clock size={16} className="mr-1" />
          {showRecurringOptions ? 'Remove Recurring Options' : 'Make Recurring Transaction'}
        </button>

        {showRecurringOptions && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency*
                </label>
                <select
                  name="frequency"
                  value={formData.recurringDetails?.frequency}
                  onChange={handleRecurringChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.frequency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {formErrors.frequency && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {formErrors.frequency}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interval*
                </label>
                <input
                  type="number"
                  name="interval"
                  value={formData.recurringDetails?.interval}
                  onChange={handleRecurringChange}
                  min="1"
                  className={`w-full px-3 py-2 border ${
                    formErrors.interval ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  E.g. every 2 weeks, every 3 months
                </p>
                {formErrors.interval && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" /> {formErrors.interval}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.recurringDetails?.endDate || ''}
                  onChange={handleRecurringChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave blank for indefinite recurring
                </p>
              </div>
            </div>
          </div>
        )}
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
          {initialData ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
