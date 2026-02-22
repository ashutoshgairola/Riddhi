// src/components/dashboard/GoalsWidget.tsx
import { FC } from 'react';
import { Link } from 'react-router-dom';

import { Calendar } from 'lucide-react';

import { GoalSummary } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils';

interface GoalsWidgetProps {
  goals: GoalSummary[];
  loading?: boolean;
}

interface GoalCardProps {
  goal: GoalSummary;
}

const GoalCard: FC<GoalCardProps> = ({ goal }) => {
  const calculatePercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);

  return (
    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
      <h3 className="font-medium dark:text-gray-100 mb-2">{goal.name}</h3>
      <div className="flex justify-between text-sm mb-2">
        <span className="dark:text-gray-200">{formatCurrency(goal.currentAmount, 'INR')}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {formatCurrency(goal.targetAmount, 'INR')}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: goal.color ?? '#16a34a',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{percentage}% complete</span>
        <div className="flex items-center">
          <Calendar size={12} className="mr-1" />
          <span>Due {formatDate(goal.targetDate)}</span>
        </div>
      </div>
    </div>
  );
};

const GoalsWidget: FC<GoalsWidgetProps> = ({ goals, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100">Financial Goals</h2>
          <Link
            to="/goals"
            className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline"
          >
            Add Goal
          </Link>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="flex justify-between mb-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">
            No active goals yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsWidget;
