// src/components/dashboard/FinancialSummaryWidget.tsx
import { FC } from 'react';

import { TrendingDown, TrendingUp } from 'lucide-react';

interface FinancialMetricCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

const FinancialMetricCard: FC<FinancialMetricCardProps> = ({ title, value, change, positive }) => {
  return (
    <div className="p-4 border border-gray-100 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <div className="flex items-center">
        {positive ? (
          <TrendingUp size={16} className="text-green-600 mr-1" />
        ) : (
          <TrendingDown size={16} className="text-red-600 mr-1" />
        )}
        <span className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
        <span className="text-xs text-gray-500 ml-1">vs last month</span>
      </div>
    </div>
  );
};

const FinancialSummaryWidget: FC = () => {
  // Dummy data
  const financialSummary = {
    netWorth: '₹42,500',
    netWorthChange: '+2.4%',
    netWorthPositive: true,
    monthlyIncome: '₹5,000',
    monthlyIncomeChange: '0%',
    monthlyIncomePositive: true,
    monthlyExpenses: '₹3,200',
    monthlyExpensesChange: '-3.2%',
    monthlyExpensesPositive: true,
    savingsRate: '36%',
    savingsRateChange: '+1.8%',
    savingsRatePositive: true,
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Financial Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialMetricCard
          title="Net Worth"
          value={financialSummary.netWorth}
          change={financialSummary.netWorthChange}
          positive={financialSummary.netWorthPositive}
        />
        <FinancialMetricCard
          title="Monthly Income"
          value={financialSummary.monthlyIncome}
          change={financialSummary.monthlyIncomeChange}
          positive={financialSummary.monthlyIncomePositive}
        />
        <FinancialMetricCard
          title="Monthly Expenses"
          value={financialSummary.monthlyExpenses}
          change={financialSummary.monthlyExpensesChange}
          positive={financialSummary.monthlyExpensesPositive}
        />
        <FinancialMetricCard
          title="Savings Rate"
          value={financialSummary.savingsRate}
          change={financialSummary.savingsRateChange}
          positive={financialSummary.savingsRatePositive}
        />
      </div>
    </div>
  );
};

export default FinancialSummaryWidget;
