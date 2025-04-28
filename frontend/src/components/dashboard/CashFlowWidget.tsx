// src/components/dashboard/CashFlowWidget.tsx
import { FC } from 'react';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Dummy data for the chart
const cashFlowData = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 2210 },
  { name: 'Mar', income: 5000, expenses: 3290 },
  { name: 'Apr', income: 5000, expenses: 3200 },
  { name: 'May', income: 4000, expenses: 2800 },
  { name: 'Jun', income: 4500, expenses: 3100 },
];

const CashFlowWidget: FC = () => {
  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Cash Flow</h2>
          <select className="p-2 border border-gray-200 rounded-md text-sm">
            <option>Last 6 months</option>
            <option>This year</option>
            <option>Last year</option>
          </select>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(value)
                }
              />
              <Line type="monotone" dataKey="income" stroke="#4CAF50" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="expenses" stroke="#F44336" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CashFlowWidget;
