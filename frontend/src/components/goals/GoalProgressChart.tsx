// src/components/goals/GoalProgressChart.tsx
import { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressChartData {
  date: string;
  amount: number;
}

interface GoalProgressChartProps {
  data: ProgressChartData[];
  targetAmount: number;
}

const GoalProgressChart: FC<GoalProgressChartProps> = ({
  data,
  targetAmount,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Add projection data points
  const lastDataPoint = data[data.length - 1];
  const lastAmount = lastDataPoint.amount;
  const [lastYear, lastMonth] = lastDataPoint.date.split("-");

  const projectionData = [...data];

  // Assuming a constant growth rate based on the last 3 months
  if (data.length >= 3) {
    const threeMonthsAgo = data[data.length - 3].amount;
    const monthlyGrowth = (lastAmount - threeMonthsAgo) / 3;

    // Project 6 months into the future
    for (let i = 1; i <= 6; i++) {
      const projectionDate = new Date(
        parseInt(lastYear),
        parseInt(lastMonth) - 1 + i
      );
      const projectionYear = projectionDate.getFullYear();
      const projectionMonth = projectionDate.getMonth() + 1;
      const formattedDate = `${projectionYear}-${projectionMonth
        .toString()
        .padStart(2, "0")}`;
      const projectedAmount = lastAmount + monthlyGrowth * i;

      projectionData.push({
        date: formattedDate,
        amount: projectedAmount,
      });
    }
  }

  // Add target line data
  const chartData = projectionData.map((item) => ({
    ...item,
    target: targetAmount,
    formatted: formatDate(item.date),
  }));

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">Progress Tracker</h2>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Combined Goal Target</p>
          <p className="text-2xl font-bold">{formatCurrency(targetAmount)}</p>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formatted" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4CAF50"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#F44336"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center text-sm">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
            <span>Current Progress</span>
          </div>

          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Target Goal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalProgressChart;
