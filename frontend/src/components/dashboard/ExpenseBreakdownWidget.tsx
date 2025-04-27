// src/components/dashboard/ExpenseBreakdownWidget.tsx
import { FC } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Dummy data for the chart
const expenseData = [
  { name: "Housing", value: 1500, color: "#4CAF50" },
  { name: "Food", value: 450, color: "#2196F3" },
  { name: "Transport", value: 275, color: "#FFC107" },
  { name: "Entertainment", value: 385, color: "#9C27B0" },
  { name: "Utilities", value: 310, color: "#FF5722" },
  { name: "Other", value: 280, color: "#607D8B" },
];

const ExpenseBreakdownWidget: FC = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Expense Breakdown</h2>
          <select className="p-2 border border-gray-200 rounded-md text-sm">
            <option>This month</option>
            <option>Last month</option>
            <option>This year</option>
          </select>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdownWidget;
