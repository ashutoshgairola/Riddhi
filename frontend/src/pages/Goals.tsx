// src/pages/Goals.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import GoalForm from '../components/goals/GoalForm';
import GoalList from '../components/goals/GoalList';
import GoalProgressChart from '../components/goals/GoalProgressChart';
import { useGoals } from '../hooks/useGoals';
import { useHighlight } from '../hooks/useHighlight';
import { CreateGoalRequest, Goal, UpdateGoalRequest } from '../types/goal.types';

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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

      {/* Add/Edit Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <GoalForm
              onClose={handleCloseForm}
              onSubmit={handleSubmitGoal}
              initialData={editingGoal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
