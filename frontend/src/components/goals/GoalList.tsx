// src/components/goals/GoalList.tsx
import { FC } from 'react';

import { AlertCircle, Calendar, CheckCircle, DollarSign, Edit2 } from 'lucide-react';

import { Goal, GoalType } from '../../types/goal.types';
import { formatCurrency } from '../../utils';

interface GoalListProps {
  goals: Goal[];
  onEditGoal: (goal: Goal) => void;
}

const GoalList: FC<GoalListProps> = ({ goals, onEditGoal }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculatePercentage = (current: number, target: number): number => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const calculateTimePercentage = (start: string, target: string): number => {
    const startDate = new Date(start).getTime();
    const targetDate = new Date(target).getTime();
    const currentDate = new Date().getTime();

    if (currentDate >= targetDate) return 100;

    const totalTime = targetDate - startDate;
    const elapsedTime = currentDate - startDate;

    return Math.min(Math.round((elapsedTime / totalTime) * 100), 100);
  };

  const getTimeRemainingText = (targetDate: string): string => {
    const target = new Date(targetDate);
    const current = new Date();

    if (target < current) return 'Past due';

    const diffTime = Math.abs(target.getTime() - current.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days left`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months left`;

    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;

    if (remainingMonths === 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} left`;
    return `${diffYears} year${
      diffYears > 1 ? 's' : ''
    }, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} left`;
  };

  const getGoalTypeLabel = (type: GoalType): string => {
    switch (type) {
      case 'savings':
        return 'Savings';
      case 'debt':
        return 'Debt Payoff';
      case 'retirement':
        return 'Retirement';
      case 'major_purchase':
        return 'Major Purchase';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  const getGoalStatusElement = (goal: Goal) => {
    const progressPercentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
    const timePercentage = calculateTimePercentage(goal.startDate, goal.targetDate);

    if (progressPercentage >= 100) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-xs">Completed</span>
        </div>
      );
    }

    if (timePercentage > progressPercentage + 10) {
      return (
        <div className="flex items-center text-yellow-600">
          <AlertCircle size={16} className="mr-1" />
          <span className="text-xs">Behind schedule</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-green-600">
        <CheckCircle size={16} className="mr-1" />
        <span className="text-xs">On track</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Goals</h2>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option>Sort by Priority</option>
            <option>Sort by Progress</option>
            <option>Sort by Due Date</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progressPercentage = calculatePercentage(goal.currentAmount, goal.targetAmount);

              return (
                <div key={goal.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center mb-1">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: goal.color }}
                          ></div>
                          <span className="text-xs text-gray-500">
                            {getGoalTypeLabel(goal.type)}
                          </span>
                        </div>
                        <h3 className="font-medium">{goal.name}</h3>
                      </div>

                      <div className="flex items-center">
                        {getGoalStatusElement(goal)}

                        <button
                          className="text-gray-400 hover:text-gray-600 ml-3"
                          onClick={() => onEditGoal(goal)}
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm">
                        {formatCurrency(goal.currentAmount, 'INR')} of{' '}
                        {formatCurrency(goal.targetAmount, 'INR')}
                      </p>
                      <p className="text-sm font-medium">{progressPercentage}%</p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${progressPercentage}%`,
                          backgroundColor: goal.color,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>Due {formatDate(goal.targetDate)}</span>
                      </div>

                      <span>{getTimeRemainingText(goal.targetDate)}</span>
                    </div>

                    {goal.contributionAmount && goal.contributionFrequency && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span>
                          Contributing {formatCurrency(goal.contributionAmount, 'INR')}{' '}
                          {goal.contributionFrequency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No goals found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first financial goal</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalList;
