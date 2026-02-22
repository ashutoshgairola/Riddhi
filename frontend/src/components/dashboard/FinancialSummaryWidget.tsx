// src/components/dashboard/FinancialSummaryWidget.tsx
import { FC } from 'react';

import { TrendingDown, TrendingUp } from 'lucide-react';

import { DashboardSummary } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils';

interface FinancialMetricCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  loading?: boolean;
}

const FinancialMetricCard: FC<FinancialMetricCardProps> = ({
  title,
  value,
  change,
  positive,
  loading,
}) => {
  if (loading) {
    return (
      <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    );
  }
  return (
    <div className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold dark:text-gray-100 mb-2">{value}</p>
      <div className="flex items-center">
        {positive ? (
          <TrendingUp size={16} className="text-green-600 mr-1" />
        ) : (
          <TrendingDown size={16} className="text-red-600 mr-1" />
        )}
        <span className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
      </div>
    </div>
  );
};

interface FinancialSummaryWidgetProps {
  summary: DashboardSummary | null;
  loading?: boolean;
}

const FinancialSummaryWidget: FC<FinancialSummaryWidgetProps> = ({ summary, loading }) => {
  const fmt = (n: number) => formatCurrency(n, 'INR');
  const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-gray-100">Financial Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialMetricCard
          loading={loading}
          title="Net Worth"
          value={summary ? fmt(summary.netWorth) : '—'}
          change={summary ? pct(summary.netWorthChangePercent) : '0%'}
          positive={!summary || summary.netWorthChangePercent >= 0}
        />
        <FinancialMetricCard
          loading={loading}
          title="Monthly Income"
          value={summary ? fmt(summary.monthlyIncome) : '—'}
          change={summary ? pct(summary.monthlyIncomeChangePercent) : '0%'}
          positive={!summary || summary.monthlyIncomeChangePercent >= 0}
        />
        <FinancialMetricCard
          loading={loading}
          title="Monthly Expenses"
          value={summary ? fmt(summary.monthlyExpenses) : '—'}
          change={summary ? pct(summary.monthlyExpensesChangePercent) : '0%'}
          positive={!summary || summary.monthlyExpensesChangePercent <= 0}
        />
        <FinancialMetricCard
          loading={loading}
          title="Savings Rate"
          value={summary ? `${summary.savingsRate.toFixed(1)}%` : '—'}
          change={
            summary
              ? `${summary.savingsRateChange >= 0 ? '+' : ''}${summary.savingsRateChange.toFixed(1)}pp`
              : '0pp'
          }
          positive={!summary || summary.savingsRateChange >= 0}
        />
      </div>
    </div>
  );
};

export default FinancialSummaryWidget;
