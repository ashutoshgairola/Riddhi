// src/components/dashboard/GoalsWidget.tsx
import { FC } from "react";
import { Calendar } from "lucide-react";
import { Goal } from "../../types/goal.types";

// Dummy data
const financialGoals: Goal[] = [
  {
    id: "1",
    name: "Emergency Fund",
    type: "savings",
    targetAmount: 15000,
    currentAmount: 10000,
    startDate: "2024-01-01",
    targetDate: "2025-12-31",
    priority: 1,
    status: "active",
    color: "#4CAF50",
  },
  {
    id: "2",
    name: "Vacation",
    type: "savings",
    targetAmount: 5000,
    currentAmount: 2500,
    startDate: "2025-01-01",
    targetDate: "2025-08-15",
    priority: 2,
    status: "active",
    color: "#2196F3",
  },
  {
    id: "3",
    name: "New Car",
    type: "major_purchase",
    targetAmount: 30000,
    currentAmount: 7500,
    startDate: "2024-06-01",
    targetDate: "2026-06-30",
    priority: 3,
    status: "active",
    color: "#FFC107",
  },
];

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: FC<GoalCardProps> = ({ goal }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculatePercentage = (current: number, target: number): number => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);

  return (
    <div className="p-4 border border-gray-100 rounded-lg">
      <h3 className="font-medium mb-2">{goal.name}</h3>
      <div className="flex justify-between text-sm mb-2">
        <span>{formatCurrency(goal.currentAmount)}</span>
        <span className="text-gray-500">
          {formatCurrency(goal.targetAmount)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: goal.color,
          }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{percentage}% complete</span>
        <div className="flex items-center">
          <Calendar size={12} className="mr-1" />
          <span>Due {formatDate(goal.targetDate)}</span>
        </div>
      </div>
    </div>
  );
};

const GoalsWidget: FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Financial Goals</h2>
          <button className="text-blue-600 text-sm font-medium">
            Add Goal
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {financialGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalsWidget;
