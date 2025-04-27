// src/components/reports/SpendingTrendsChart.tsx
import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SpendingData {
  date: string;
  amount: number;
}

interface SpendingTrendsChartProps {
  data: SpendingData[];
}

const SpendingTrendsChart: FC<SpendingTrendsChartProps> = ({ data }) => {
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

  const customTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value?: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && payload[0].value !== undefined) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">
            {label ? formatDate(label) : "Invalid Date"}
          </p>
          <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">Spending Trends</h2>
      </div>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#E0E0E0" }}
                tickLine={false}
              />
              <Tooltip content={customTooltip} />
              <Bar
                dataKey="amount"
                fill="#4CAF50"
                barSize={40}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpendingTrendsChart;
