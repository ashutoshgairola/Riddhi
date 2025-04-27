// src/pages/Dashboard.tsx
import { FC, useState } from "react";
import FinancialSummaryWidget from "../components/dashboard/FinancialSummaryWidget";
import RecentTransactionsWidget from "../components/dashboard/RecentTransactionsWidget";
import BudgetProgressWidget from "../components/dashboard/BudgetProgressWidget";
import GoalsWidget from "../components/dashboard/GoalsWidget";
import CashFlowWidget from "../components/dashboard/CashFlowWidget";
import ExpenseBreakdownWidget from "../components/dashboard/ExpenseBreakdownWidget";
import PageHeader from "../components/common/PageHeader";

const Dashboard: FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("April 2025");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your financial overview"
        actions={
          <select
            className="p-2 border border-gray-200 rounded-md text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option>April 2025</option>
            <option>March 2025</option>
            <option>February 2025</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Financial Summary Widget */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <FinancialSummaryWidget />
        </div>

        {/* Cash Flow Widget */}
        <div className="col-span-1 lg:col-span-2">
          <CashFlowWidget />
        </div>

        {/* Expense Breakdown Widget */}
        <div className="col-span-1">
          <ExpenseBreakdownWidget />
        </div>

        {/* Recent Transactions */}
        <div className="col-span-1 lg:col-span-2">
          <RecentTransactionsWidget />
        </div>

        {/* Budget Progress */}
        <div className="col-span-1">
          <BudgetProgressWidget />
        </div>

        {/* Financial Goals */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <GoalsWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
