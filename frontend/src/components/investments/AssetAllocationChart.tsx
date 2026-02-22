// src/components/investments/AssetAllocationChart.tsx
import { FC } from 'react';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';

import { useTheme } from '../../hooks/useTheme';
import { AssetAllocation } from '../../types/investment.types';
import { formatCurrency } from '../../utils';

interface AssetAllocationChartProps {
  allocations: AssetAllocation[];
}

const AssetAllocationChart: FC<AssetAllocationChartProps> = ({ allocations }) => {
  const { isDark } = useTheme();
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
        <div
          className={`p-3 border rounded shadow-sm ${isDark ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
        >
          <p className="font-medium">
            {formatAssetClass((data.payload as AssetAllocation).assetClass)}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {formatCurrency((data.payload as AssetAllocation).amount, 'INR')}
          </p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow h-full`}>
      <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          Asset Allocation
        </h2>
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
                formatter={(value) => (
                  <span style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                    {formatAssetClass(value)}
                  </span>
                )}
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
