import { FC, useState } from 'react';

import { X } from 'lucide-react';

import { TransactionType } from '../../types/transaction.types';

interface AddTransactionFormProps {
  onClose: () => void;
  onSubmit?: (data: {
    description: string;
    amount: number;
    date: string;
    type: TransactionType;
    categoryId: string;
    accountId: string;
    notes: string;
    tags: string[];
  }) => void;
  initialData?: {
    description?: string;
    amount?: string | number;
    date?: string;
    type?: TransactionType;
    categoryId?: string;
    accountId?: string;
    notes?: string;
    tags?: string[];
  };
}

const categories = {
  1: { id: '1', name: 'Food' },
  2: { id: '2', name: 'Rent' },
  3: { id: '3', name: 'Utilities' },
};

const AddTransactionForm: FC<AddTransactionFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || ('expense' as TransactionType),
    categoryId: initialData?.categoryId || '',
    accountId: initialData?.accountId || '',
    notes: initialData?.notes || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process tags
    const processedData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      amount: parseFloat(formData.amount as string),
    };

    // Handle form submission
    if (onSubmit) {
      onSubmit(processedData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {initialData ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTypeChange('transfer')}
          >
            Transfer
          </button>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. Grocery shopping, Rent payment"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount*</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
            className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select a category</option>
            {Object.values(categories).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
        <select
          name="accountId"
          value={formData.accountId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select an account</option>
          <option value="1">Main Checking Account</option>
          <option value="2">Savings Account</option>
          <option value="3">Credit Card</option>
        </select>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter tags separated by commas"
        />
        <p className="text-xs text-gray-500 mt-1">E.g. food, bills, subscriptions</p>
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
          {initialData ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

export default AddTransactionForm;
