// src/components/goals/GoalList.tsx
import { FC, useState } from 'react';

import {
  AlertCircle,
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit2,
  Pause,
  Play,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import wallet02 from '../../assets/empty-states/Wallet 02.svg';
import { Goal, GoalType } from '../../types/goal.types';
import { formatCurrency } from '../../utils';
import EmptyState from '../common/EmptyState';

interface GoalListProps {
  goals: Goal[];
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal?: (id: string) => void;
  onCompleteGoal?: (id: string) => void;
  onPauseGoal?: (id: string) => void;
  onResumeGoal?: (id: string) => void;
}

type SortOption = 'priority' | 'progress' | 'dueDate' | 'name';
type SortOrder = 'asc' | 'desc';

const SORT_CYCLES: { sort: SortOption; order: SortOrder }[] = [
  { sort: 'priority', order: 'asc' },
  { sort: 'dueDate', order: 'asc' },
  { sort: 'progress', order: 'desc' },
  { sort: 'name', order: 'asc' },
];

const SORT_LABELS: Record<SortOption, string> = {
  priority: 'Priority',
  progress: 'Progress',
  dueDate: 'Due Date',
  name: 'Name',
};

const GoalList: FC<GoalListProps> = ({
  goals,
  onEditGoal,
  onDeleteGoal,
  onCompleteGoal,
  onPauseGoal,
  onResumeGoal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const currentSort = SORT_CYCLES[sortIndex];

  const filteredGoals = goals
    .filter(
      (g) =>
        !searchTerm ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.notes ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const dir = currentSort.order === 'asc' ? 1 : -1;
      switch (currentSort.sort) {
        case 'priority':
          return (a.priority - b.priority) * dir;
        case 'progress': {
          const pA = a.targetAmount ? a.currentAmount / a.targetAmount : 0;
          const pB = b.targetAmount ? b.currentAmount / b.targetAmount : 0;
          return (pA - pB) * dir;
        }
        case 'dueDate':
          return (new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()) * dir;
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        default:
          return 0;
      }
    });
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header with search + sort */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 shrink-0 mr-auto">
          {filteredGoals.length} Goal{filteredGoals.length !== 1 ? 's' : ''}
        </span>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-7 py-1.5 w-44 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort cycling button */}
        <button
          title={`Sort: ${SORT_LABELS[currentSort.sort]} ${currentSort.order === 'asc' ? '↑' : '↓'} — click to cycle`}
          onClick={() => setSortIndex((i) => (i + 1) % SORT_CYCLES.length)}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {currentSort.sort === 'name' && currentSort.order === 'asc' && <ArrowUpAZ size={16} />}
          {currentSort.sort === 'name' && currentSort.order === 'desc' && <ArrowDownAZ size={16} />}
          {currentSort.sort !== 'name' && currentSort.order === 'desc' && <ArrowDown10 size={16} />}
          {currentSort.sort !== 'name' && currentSort.order === 'asc' && <ArrowDown01 size={16} />}
        </button>
      </div>

      <div className="p-6">
        {filteredGoals.length > 0 ? (
          <div className="space-y-4">
            {filteredGoals.map((goal) => {
              const progressPercentage = calculatePercentage(goal.currentAmount, goal.targetAmount);

              return (
                <div
                  key={goal.id}
                  id={`highlight-${goal.id}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center mb-1">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: goal.color }}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getGoalTypeLabel(goal.type)}
                          </span>
                        </div>
                        <h3 className="font-medium dark:text-gray-100">{goal.name}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        {getGoalStatusElement(goal)}

                        {goal.status === 'active' && onPauseGoal && (
                          <button
                            title="Pause goal"
                            className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 ml-2"
                            onClick={() => onPauseGoal(goal.id)}
                          >
                            <Pause size={16} />
                          </button>
                        )}

                        {goal.status === 'paused' && onResumeGoal && (
                          <button
                            title="Resume goal"
                            className="text-gray-400 hover:text-green-500 dark:hover:text-green-400 ml-2"
                            onClick={() => onResumeGoal(goal.id)}
                          >
                            <Play size={16} />
                          </button>
                        )}

                        {goal.status !== 'completed' && onCompleteGoal && (
                          <button
                            title="Mark as completed"
                            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 ml-1"
                            onClick={() => onCompleteGoal(goal.id)}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {goal.status !== 'completed' && (
                          <button
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1"
                            onClick={() => onEditGoal(goal)}
                            title="Edit goal"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {onDeleteGoal && (
                          <button
                            title="Delete goal"
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1"
                            onClick={() => onDeleteGoal(goal.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm dark:text-gray-300">
                        {formatCurrency(goal.currentAmount, 'INR')} of{' '}
                        {formatCurrency(goal.targetAmount, 'INR')}
                      </p>
                      <p className="text-sm font-medium dark:text-gray-300">
                        {progressPercentage}%
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${progressPercentage}%`,
                          backgroundColor: goal.color,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>Due {formatDate(goal.targetDate)}</span>
                      </div>

                      <span>{getTimeRemainingText(goal.targetDate)}</span>
                    </div>

                    {goal.contributionAmount && goal.contributionFrequency && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
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
          <EmptyState
            image={wallet02}
            title={searchTerm ? 'No matching goals' : 'No goals found'}
            description={
              searchTerm
                ? `No goals match "${searchTerm}". Try a different search term.`
                : 'Create your first financial goal and start working towards it.'
            }
          />
        )}
      </div>
    </div>
  );
};

export default GoalList;
