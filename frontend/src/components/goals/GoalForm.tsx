// src/components/goals/GoalForm.tsx
import { FC, useState } from 'react';

import { CreateGoalRequest, Goal, GoalType, UpdateGoalRequest } from '../../types/goal.types';
import { ModalFooter, ModalHeader } from '../common/Modal';

interface GoalFormProps {
  onClose: () => void;
  onSubmit?: (data: CreateGoalRequest | UpdateGoalRequest) => Promise<void>;
  initialData?: Goal | null;
  isLoading?: boolean;
}

// Color palette for goals
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

const GoalForm: FC<GoalFormProps> = ({ onClose, onSubmit, initialData, isLoading = false }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || ('savings' as GoalType),
    targetAmount: initialData?.targetAmount?.toString() || '',
    currentAmount: initialData?.currentAmount?.toString() || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    targetDate: initialData?.targetDate || '',
    color: initialData?.color || colorPalette[0],
    notes: initialData?.notes || '',
    priority: initialData?.priority?.toString() || '3',
    contributionFrequency: initialData?.contributionFrequency || undefined,
    contributionAmount: initialData?.contributionAmount?.toString() || '',
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

  const handleTypeChange = (type: GoalType) => {
    setFormData({
      ...formData,
      type,
    });
  };

  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const processedData: CreateGoalRequest = {
      name: formData.name,
      type: formData.type,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount || '0'),
      startDate: formData.startDate,
      targetDate: formData.targetDate,
      priority: parseInt(formData.priority),
      color: formData.color,
      notes: formData.notes || undefined,
      contributionFrequency:
        (formData.contributionFrequency as CreateGoalRequest['contributionFrequency']) || undefined,
      contributionAmount: formData.contributionAmount
        ? parseFloat(formData.contributionAmount)
        : undefined,
    };

    if (onSubmit) {
      setSubmitting(true);
      try {
        await onSubmit(processedData);
      } finally {
        setSubmitting(false);
      }
    }

    onClose();
  };

  const isBusy = submitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
      <ModalHeader title={initialData ? 'Edit Goal' : 'Add New Goal'} onClose={onClose} />

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Goal Name*
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. Emergency Fund, New Car"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Goal Type*
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-center ${
                formData.type === 'savings'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleTypeChange('savings')}
            >
              Savings
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-center ${
                formData.type === 'debt'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleTypeChange('debt')}
            >
              Debt Payoff
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-center ${
                formData.type === 'major_purchase'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleTypeChange('major_purchase')}
            >
              Major Purchase
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-center ${
                formData.type === 'retirement'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleTypeChange('retirement')}
            >
              Retirement
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target Amount*
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              ₹
            </span>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              required
              step="0.01"
              min="1"
              className="w-full px-8 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              ₹
            </span>
            <input
              type="number"
              name="currentAmount"
              value={formData.currentAmount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-8 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date*
            </label>
            <input
              type="date"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
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
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="1">High</option>
            <option value="2">Medium</option>
            <option value="3">Low</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Regular Contribution
          </label>
          <div className="grid grid-cols-2 gap-4">
            <select
              name="contributionFrequency"
              value={formData.contributionFrequency}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">None</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                name="contributionAmount"
                value={formData.contributionAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                disabled={!formData.contributionFrequency}
                className="w-full px-8 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Add any additional details here..."
          ></textarea>
        </div>
      </div>
      {/* end scrollable body */}

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBusy ? 'Saving...' : initialData ? 'Update' : 'Add'} Goal
        </button>
      </ModalFooter>
    </form>
  );
};

export default GoalForm;
