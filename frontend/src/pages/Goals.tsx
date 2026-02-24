// src/pages/Goals.tsx
import { FC, useState } from 'react';

import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import GoalForm from '../components/goals/GoalForm';
import GoalList from '../components/goals/GoalList';
import GoalProgressChart from '../components/goals/GoalProgressChart';
import { useGoals } from '../hooks/useGoals';
import { useHighlight } from '../hooks/useHighlight';
import { CreateGoalRequest, Goal, UpdateGoalRequest } from '../types/goal.types';

const FILTER_TABS = [
  { label: 'All', value: null },
  { label: 'Savings', value: 'savings' },
  { label: 'Debt', value: 'debt' },
  { label: 'Purchases', value: 'major_purchase' },
] as const;

const Goals: FC = () => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    pauseGoal,
    resumeGoal,
  } = useGoals();

  // Highlight item from search navigation
  useHighlight(loading);

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

  const handleSubmitGoal = async (data: CreateGoalRequest | UpdateGoalRequest) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data as UpdateGoalRequest);
    } else {
      await createGoal(data as CreateGoalRequest);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  // Filter goals by type if activeFilter is set
  const filteredGoals = activeFilter ? goals.filter((goal) => goal.type === activeFilter) : goals;

  // Build chart data from goals — cumulative currentAmount over time (simplified)
  const progressChartData = goals
    .filter((g) => g.startDate)
    .map((g) => ({
      date: g.startDate.slice(0, 7), // YYYY-MM
      amount: g.currentAmount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div>
      <PageHeader
        title="Financial Goals"
        subtitle="Track progress towards your financial targets"
        actions={
          <button
            onClick={handleAddGoal}
            className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-full hover:bg-green-700 active:scale-95 transition-all select-none"
          >
            Add Goal
          </button>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error.message || 'Failed to load goals. Please try again.'}
        </div>
      )}

      {/* Filter tabs — horizontally scrollable on mobile */}
      <div className="mt-4 sm:mt-6 flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {FILTER_TABS.map(({ label, value }) => (
          <button
            key={label}
            className={`px-4 py-2 rounded-full whitespace-nowrap min-h-[36px] text-sm font-medium select-none shrink-0 transition-colors ${
              activeFilter === value
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">Loading goals...</div>
            </div>
          ) : (
            <GoalList
              goals={filteredGoals}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
              onCompleteGoal={completeGoal}
              onPauseGoal={pauseGoal}
              onResumeGoal={resumeGoal}
            />
          )}
        </div>

        {/* Progress Chart */}
        <div className="lg:col-span-1">
          <GoalProgressChart
            data={
              progressChartData.length > 0
                ? progressChartData
                : [{ date: new Date().toISOString().slice(0, 7), amount: 0 }]
            }
            targetAmount={totalTarget}
          />
        </div>
      </div>

      {/* Add/Edit Goal Modal — uses responsive Modal component */}
      <Modal isOpen={showAddGoal} onClose={handleCloseForm} size="md">
        <GoalForm onClose={handleCloseForm} onSubmit={handleSubmitGoal} initialData={editingGoal} />
      </Modal>
    </div>
  );
};

export default Goals;
