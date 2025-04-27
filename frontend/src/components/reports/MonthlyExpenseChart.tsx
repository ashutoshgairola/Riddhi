// src/components/reports/MonthlyExpenseChart.tsx
import { FC } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";

interface ExpenseData {
  name: string;
  amount: number;
}

interface MonthlyExpenseChartProps {
  data: ExpenseData[];
}

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#9C27B0"];

const MonthlyExpenseChart: FC<MonthlyExpenseChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const customTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-600">{formatCurrency(data.amount)}</p>
          <p className="text-gray-600 text-sm">
            {`${((data.amount / data.totalAmount) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total for percentage
  const total = data.reduce((sum, entry) => sum + entry.amount, 0);

  // Add total to each data point for tooltip
  const enhancedData = data.map((item) => ({
    ...item,
    totalAmount: total,
  }));

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">Monthly Expense Breakdown</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enhancedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={customTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full flex flex-col justify-center">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Period</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {enhancedData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="text-right">
                        {((item.amount / total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-3">Total</td>
                    <td className="text-right">{formatCurrency(total)}</td>
                    <td className="text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyExpenseChart;
