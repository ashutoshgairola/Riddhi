// src/pages/Goals.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import GoalForm from '../components/goals/GoalForm';
import GoalList from '../components/goals/GoalList';
import GoalProgressChart from '../components/goals/GoalProgressChart';
import { Goal } from '../types/goal.types';

// Dummy goals data
const goalsData: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    type: 'savings',
    targetAmount: 15000,
    currentAmount: 10000,
    startDate: '2024-01-01',
    targetDate: '2025-12-31',
    priority: 1,
    status: 'active',
    color: '#4CAF50',
    notes: 'Save 6 months of expenses for emergencies',
  },
  {
    id: '2',
    name: 'Vacation to Europe',
    type: 'savings',
    targetAmount: 5000,
    currentAmount: 2500,
    startDate: '2025-01-01',
    targetDate: '2025-08-15',
    priority: 2,
    status: 'active',
    color: '#2196F3',
    notes: 'Summer vacation to France and Italy',
  },
  {
    id: '3',
    name: 'New Car',
    type: 'major_purchase',
    targetAmount: 30000,
    currentAmount: 7500,
    startDate: '2024-06-01',
    targetDate: '2026-06-30',
    priority: 3,
    status: 'active',
    color: '#FFC107',
    contributionFrequency: 'monthly',
    contributionAmount: 1000,
  },
  {
    id: '4',
    name: 'Home Down Payment',
    type: 'major_purchase',
    targetAmount: 60000,
    currentAmount: 15000,
    startDate: '2023-01-01',
    targetDate: '2027-01-01',
    priority: 1,
    status: 'active',
    color: '#9C27B0',
    contributionFrequency: 'monthly',
    contributionAmount: 1200,
  },
  {
    id: '5',
    name: 'Pay off Student Loan',
    type: 'debt',
    targetAmount: 18000,
    currentAmount: 12000,
    startDate: '2023-05-01',
    targetDate: '2026-05-01',
    priority: 2,
    status: 'active',
    color: '#FF5722',
    contributionFrequency: 'monthly',
    contributionAmount: 500,
  },
];

// Dummy chart data
const progressChartData = [
  { date: '2024-10', amount: 29000 },
  { date: '2024-11', amount: 32000 },
  { date: '2024-12', amount: 35500 },
  { date: '2025-01', amount: 39000 },
  { date: '2025-02', amount: 42000 },
  { date: '2025-03', amount: 45000 },
  { date: '2025-04', amount: 47000 },
];

const Goals: FC = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setShowAddGoal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowAddGoal(true);
  };

  const handleCloseForm = () => {
    setShowAddGoal(false);
    setEditingGoal(null);
  };

  // Filter goals by type if activeFilter is set
  const filteredGoals = activeFilter
    ? goalsData.filter((goal) => goal.type === activeFilter)
    : goalsData;

  return (
    <div>
      <PageHeader
        title="Financial Goals"
        subtitle="Track progress towards your financial targets"
        actions={
          <button
            onClick={handleAddGoal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Goal
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="mt-6 flex space-x-2">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFilter === null
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveFilter(null)}
        >
          All Goals
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'savings'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveFilter('savings')}
        >
          Savings
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'debt'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveFilter('debt')}
        >
          Debt Payoff
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeFilter === 'major_purchase'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveFilter('major_purchase')}
        >
          Major Purchases
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2">
          <GoalList goals={filteredGoals} onEditGoal={handleEditGoal} />
        </div>

        {/* Progress Chart */}
        <div className="lg:col-span-1">
          <GoalProgressChart
            data={progressChartData}
            targetAmount={128000} // Sum of all goals target amounts
          />
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <GoalForm onClose={handleCloseForm} initialData={editingGoal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
