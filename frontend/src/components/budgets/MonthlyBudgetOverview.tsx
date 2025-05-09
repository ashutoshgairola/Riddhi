// src/components/budgets/MonthlyBudgetOverview.tsx
import { FC } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '../../utils';

interface MonthlyBudgetData {
  name: string;
  income: number;
  expenses: number;
  budget: number;
}

interface MonthlyBudgetOverviewProps {
  data: MonthlyBudgetData[];
}

const MonthlyBudgetOverview: FC<MonthlyBudgetOverviewProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Monthly Overview</h2>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option>Last 6 months</option>
            <option>This year</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number, 'INR')} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#9C27B0" />
              <Bar dataKey="expenses" name="Spent" fill="#F44336" />
              <Bar dataKey="income" name="Income" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBudgetOverview;
