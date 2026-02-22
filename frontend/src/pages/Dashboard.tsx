// src/pages/Dashboard.tsx
import { FC } from 'react';

import PageHeader from '../components/common/PageHeader';
import BudgetProgressWidget from '../components/dashboard/BudgetProgressWidget';
import CashFlowWidget from '../components/dashboard/CashFlowWidget';
import ExpenseBreakdownWidget from '../components/dashboard/ExpenseBreakdownWidget';
import FinancialSummaryWidget from '../components/dashboard/FinancialSummaryWidget';
import GoalsWidget from '../components/dashboard/GoalsWidget';
import RecentTransactionsWidget from '../components/dashboard/RecentTransactionsWidget';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard: FC = () => {
  const { data, loading } = useDashboard();

  const currentMonth = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your financial overview"
        actions={
          <span className="p-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm">
            {currentMonth}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Financial Summary Widget */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <FinancialSummaryWidget summary={data?.summary ?? null} loading={loading} />
        </div>

        {/* Cash Flow Widget */}
        <div className="col-span-1 lg:col-span-2">
          <CashFlowWidget cashFlow={data?.cashFlow ?? []} loading={loading} />
        </div>

        {/* Expense Breakdown Widget */}
        <div className="col-span-1">
          <ExpenseBreakdownWidget
            expenseBreakdown={data?.expenseBreakdown ?? []}
            loading={loading}
          />
        </div>

        {/* Recent Transactions */}
        <div className="col-span-1 lg:col-span-2">
          <RecentTransactionsWidget
            transactions={data?.recentTransactions ?? []}
            loading={loading}
          />
        </div>

        {/* Budget Progress */}
        <div className="col-span-1">
          <BudgetProgressWidget budgetProgress={data?.budgetProgress ?? []} loading={loading} />
        </div>

        {/* Financial Goals */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <GoalsWidget goals={data?.goals ?? []} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
