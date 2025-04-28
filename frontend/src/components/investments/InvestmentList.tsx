// src/components/investments/InvestmentList.tsx
import { FC } from 'react';

import { Edit2, Trash2 } from 'lucide-react';

import { AssetClass, Investment, InvestmentType } from '../../types/investment.types';

interface InvestmentListProps {
  investments: Investment[];
  onEditInvestment: (investment: Investment) => void;
}

const InvestmentList: FC<InvestmentListProps> = ({ investments, onEditInvestment }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const formatAssetClass = (assetClass: AssetClass): string => {
    return assetClass
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatInvestmentType = (type: InvestmentType): string => {
    switch (type) {
      case 'individual_stock':
        return 'Stock';
      case 'etf':
        return 'ETF';
      case 'mutual_fund':
        return 'Mutual Fund';
      case 'bond':
        return 'Bond';
      case 'crypto':
        return 'Cryptocurrency';
      case 'options':
        return 'Options';
      case 'reit':
        return 'REIT';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  const calculateTotalValue = (investment: Investment): number => {
    return investment.shares * investment.currentPrice;
  };

  const calculateGainLoss = (investment: Investment): number => {
    const costBasis = investment.shares * investment.purchasePrice;
    const currentValue = investment.shares * investment.currentPrice;
    return currentValue - costBasis;
  };

  const calculatePercentageGainLoss = (investment: Investment): number => {
    const costBasis = investment.shares * investment.purchasePrice;
    const currentValue = investment.shares * investment.currentPrice;
    return ((currentValue - costBasis) / costBasis) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Investments</h2>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option>Sort by Value</option>
            <option>Sort by Performance</option>
            <option>Sort by Name</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {investments.map((investment) => {
              const gainLoss = calculateGainLoss(investment);
              const percentageGainLoss = calculatePercentageGainLoss(investment);
              const isPositive = gainLoss >= 0;

              return (
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{investment.name}</div>
                        <div className="text-sm text-gray-500">{investment.ticker}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{investment.shares}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(investment.currentPrice)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cost: {formatCurrency(investment.purchasePrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(calculateTotalValue(investment))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(gainLoss)}
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(percentageGainLoss)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {formatInvestmentType(investment.type)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAssetClass(investment.assetClass)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditInvestment(investment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {investments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No investments found</p>
          <p className="text-sm text-gray-400 mt-1">Add your first investment</p>
        </div>
      )}
    </div>
  );
};

export default InvestmentList;
