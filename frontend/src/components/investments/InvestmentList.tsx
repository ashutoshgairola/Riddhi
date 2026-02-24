// src/components/investments/InvestmentList.tsx
import { FC, useState } from 'react';

import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowUpAZ,
  Edit2,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import wallet05 from '../../assets/empty-states/Wallet 05.svg';
import { useTheme } from '../../hooks/useTheme';
import { AssetClass, Investment, InvestmentType } from '../../types/investment.types';
import { formatCurrency } from '../../utils';
import EmptyState from '../common/EmptyState';

interface InvestmentListProps {
  investments: Investment[];
  onEditInvestment: (investment: Investment) => void;
  onDeleteInvestment: (id: string) => Promise<void>;
  loading?: boolean;
}

type SortOption = 'value' | 'performance' | 'name' | 'gainLoss';
type SortOrder = 'asc' | 'desc';

const SORT_CYCLES: { sort: SortOption; order: SortOrder }[] = [
  { sort: 'value', order: 'desc' },
  { sort: 'performance', order: 'desc' },
  { sort: 'gainLoss', order: 'desc' },
  { sort: 'name', order: 'asc' },
];

const SORT_LABELS: Record<SortOption, string> = {
  value: 'Value',
  performance: 'Performance',
  gainLoss: 'Gain/Loss',
  name: 'Name',
};

const InvestmentList: FC<InvestmentListProps> = ({
  investments,
  onEditInvestment,
  onDeleteInvestment,
  loading = false,
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortIndex, setSortIndex] = useState(0);
  const currentSort = SORT_CYCLES[sortIndex];

  const filteredInvestments = investments
    .filter(
      (inv) =>
        !searchTerm ||
        inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.ticker ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.assetClass.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const dir = currentSort.order === 'asc' ? 1 : -1;
      switch (currentSort.sort) {
        case 'value':
          return (calculateTotalValue(a) - calculateTotalValue(b)) * dir;
        case 'performance':
          return (calculatePercentageGainLoss(a) - calculatePercentageGainLoss(b)) * dir;
        case 'gainLoss':
          return (calculateGainLoss(a) - calculateGainLoss(b)) * dir;
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        default:
          return 0;
      }
    });
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
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
      {/* Header with search + sort */}
      <div
        className={`px-4 py-3 border-b flex flex-wrap items-center gap-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <span
          className={`text-base font-semibold shrink-0 mr-auto ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
        >
          {filteredInvestments.length} Investment{filteredInvestments.length !== 1 ? 's' : ''}
        </span>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search investments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-7 py-1.5 w-48 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort cycling button */}
        <button
          title={`Sort: ${SORT_LABELS[currentSort.sort]} ${currentSort.order === 'asc' ? '↑' : '↓'} — click to cycle`}
          onClick={() => setSortIndex((i) => (i + 1) % SORT_CYCLES.length)}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {currentSort.sort === 'name' && currentSort.order === 'asc' && <ArrowUpAZ size={16} />}
          {currentSort.sort === 'name' && currentSort.order === 'desc' && <ArrowDownAZ size={16} />}
          {currentSort.sort !== 'name' && currentSort.order === 'desc' && <ArrowDown10 size={16} />}
          {currentSort.sort !== 'name' && currentSort.order === 'asc' && <ArrowDown01 size={16} />}
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-10 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              />
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Investment
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Shares
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Price
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Value
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Gain/Loss
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Type
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}
            >
              {filteredInvestments.map((investment) => {
                const gainLoss = calculateGainLoss(investment);
                const percentageGainLoss = calculatePercentageGainLoss(investment);
                const isPositive = gainLoss >= 0;

                return (
                  <tr
                    key={investment.id}
                    id={`highlight-${investment.id}`}
                    className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div
                            className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                          >
                            {investment.name}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {investment.ticker}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {investment.shares}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {formatCurrency(investment.currentPrice, 'INR')}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Cost: {formatCurrency(investment.purchasePrice, 'INR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {formatCurrency(calculateTotalValue(investment), 'INR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(gainLoss, 'INR')}
                      </div>
                      <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercentage(percentageGainLoss)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {formatInvestmentType(investment.type)}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatAssetClass(investment.assetClass)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEditInvestment(investment)}
                        className={`p-1.5 touch-manipulation ${isDark ? 'text-indigo-400 hover:text-indigo-300 active:text-indigo-200' : 'text-indigo-600 hover:text-indigo-900 active:text-indigo-700'} transition-colors`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteInvestment(investment.id)}
                        className={`p-1.5 touch-manipulation transition-colors ${
                          isDark
                            ? 'text-red-400 hover:text-red-300 active:text-red-200'
                            : 'text-red-600 hover:text-red-900 active:text-red-700'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filteredInvestments.length === 0 && !loading && (
        <EmptyState
          image={wallet05}
          title={searchTerm ? 'No matching investments' : 'No investments yet'}
          description={
            searchTerm
              ? `No investments match "${searchTerm}". Try a different search term.`
              : 'Add your first investment to start tracking your portfolio.'
          }
        />
      )}
    </div>
  );
};

export default InvestmentList;
