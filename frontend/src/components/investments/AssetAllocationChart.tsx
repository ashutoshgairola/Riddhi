// src/components/investments/AssetAllocationChart.tsx
import { FC } from 'react';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

import { AssetAllocation } from '../../types/investment.types';

interface AssetAllocationChartProps {
  allocations: AssetAllocation[];
}

const AssetAllocationChart: FC<AssetAllocationChartProps> = ({ allocations }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatAssetClass = (assetClass: string): string => {
    return assetClass
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const customTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">
            {formatAssetClass((data.payload as AssetAllocation).assetClass)}
          </p>
          <p className="text-gray-600">
            {formatCurrency((data.payload as AssetAllocation).amount)}
          </p>
          <p className="text-gray-600">
            {(
              ((data.payload as AssetAllocation).amount /
                allocations.reduce((sum, allocation) => sum + allocation.amount, 0)) *
              100
            ).toFixed(2)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">Asset Allocation</h2>
      </div>

      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocations}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                nameKey="assetClass"
              >
                {allocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend
                formatter={(value) => formatAssetClass(value)}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationChart;
