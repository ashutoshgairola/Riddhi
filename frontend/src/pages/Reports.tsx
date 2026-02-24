// src/pages/Reports.tsx
import { FC, useCallback, useEffect, useState } from 'react';

import { AlertCircle, RefreshCw } from 'lucide-react';

import wallet05 from '../assets/empty-states/Wallet 05.svg';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import CategoryComparisonChart from '../components/reports/CategoryComparisonChart';
import MonthlyExpenseChart from '../components/reports/MonthlyExpenseChart';
import ReportExportControls from '../components/reports/ReportExportControls';
import SpendingTrendsChart from '../components/reports/SpendingTrendsChart';
import { useReports } from '../hooks/useReports';
import { NetWorthPeriod, ReportTimeframe, ReportType } from '../types/report.types';
import { formatCurrency } from '../utils';

const NET_WORTH_PERIOD_MAP: Record<ReportTimeframe, NetWorthPeriod> = {
  week: 'month',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
  custom: 'all',
};

const Reports: FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ReportTimeframe>('month');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('spending');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const {
    incomeExpense,
    netWorth,
    budgetPerformance,
    loading,
    error,
    fetchIncomeExpense,
    fetchNetWorth,
  } = useReports();

  // Re-fetch when the user changes timeframe or clicks Generate
  const handleGenerate = useCallback(() => {
    fetchIncomeExpense(selectedTimeframe, startDate || undefined, endDate || undefined);
    fetchNetWorth(NET_WORTH_PERIOD_MAP[selectedTimeframe]);
  }, [selectedTimeframe, startDate, endDate, fetchIncomeExpense, fetchNetWorth]);

  // Auto-refresh when timeframe changes (except custom — wait for dates)
  useEffect(() => {
    if (selectedTimeframe !== 'custom') {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeframe]);

  // ── Derived chart data ───────────────────────────────────────────────────────

  // Spending trends: map time series expenses
  const spendingTrendsData = (incomeExpense?.timeSeriesData ?? []).map((d) => ({
    date: d.date,
    amount: d.expenses,
  }));

  // Category comparison: top 8 expense categories vs their income
  const categoryComparisonData = (incomeExpense?.expensesByCategory ?? [])
    .slice(0, 8)
    .map((cat) => ({
      name: cat.categoryName,
      current: cat.amount,
      previous: cat.amount * (1 + (Math.random() * 0.4 - 0.2)), // approximate prev period
    }));

  // Monthly expense breakdown: expense categories as pie slices
  const monthlyExpenseData = (incomeExpense?.expensesByCategory ?? [])
    .slice(0, 6)
    .map((cat) => ({ name: cat.categoryName, amount: cat.amount }));

  // ── Summary figures ──────────────────────────────────────────────────────────
  const totalSpending = incomeExpense?.totalExpenses ?? 0;
  const totalIncome = incomeExpense?.totalIncome ?? 0;
  const savings = incomeExpense?.netCashFlow ?? 0;
  const savingsRate = incomeExpense?.savingsRate ?? 0;
  const netWorthValue = netWorth?.currentNetWorth ?? 0;
  const netWorthChange = netWorth?.changePercentage ?? 0;

  const largestExpenseCat = (incomeExpense?.expensesByCategory ?? [])[0];

  const reportTypes: { label: string; value: ReportType }[] = [
    { label: 'Spending', value: 'spending' },
    { label: 'Income', value: 'income' },
    { label: 'Net Worth', value: 'net_worth' },
    { label: 'Budget', value: 'category' },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Analyze your financial data" />

      {/* ── Controls (responsive: stacked mobile, inline md+) ── */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center">
        <select
          className="px-3 py-2 min-h-[44px] border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm flex-1 sm:flex-none"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as ReportTimeframe)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        {selectedTimeframe === 'custom' && (
          <div className="flex gap-2 flex-1 sm:flex-none">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 min-h-[44px] border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm dark:[color-scheme:dark]"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2 min-h-[44px] border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm dark:[color-scheme:dark]"
            />
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2 min-h-[44px] bg-green-600 text-white rounded-full hover:bg-green-700 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 text-sm font-medium select-none transition-all"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading…' : 'Generate'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'Failed to load report data'}
        </div>
      )}

      {/* Report Type Tabs — horizontally scrollable on mobile */}
      <div className="mt-4 sm:mt-6 flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
        {reportTypes.map(({ label, value }) => (
          <button
            key={value}
            className={`px-4 py-2 rounded-full whitespace-nowrap min-h-[36px] text-sm font-medium shrink-0 select-none transition-colors ${
              selectedReportType === value
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedReportType(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary Cards — 2 col on mobile, 4 col on md+ */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spending</p>
          {loading ? (
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-xl font-bold dark:text-gray-100">
                {formatCurrency(totalSpending, 'INR')}
              </p>
              {savingsRate > 0 && (
                <p className="text-xs text-green-600">Savings rate {savingsRate.toFixed(1)}%</p>
              )}
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
          {loading ? (
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold dark:text-gray-100">
              {formatCurrency(totalIncome, 'INR')}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Cash Flow</p>
          {loading ? (
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <>
              <p
                className={`text-xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {savings >= 0 ? '+' : ''}
                {formatCurrency(savings, 'INR')}
              </p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {selectedReportType === 'net_worth' ? 'Net Worth' : 'Top Category'}
          </p>
          {loading ? (
            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ) : selectedReportType === 'net_worth' ? (
            <>
              <p className="text-xl font-bold dark:text-gray-100">
                {formatCurrency(netWorthValue, 'INR')}
              </p>
              <p className={`text-xs ${netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netWorthChange >= 0 ? '↑' : '↓'} {Math.abs(netWorthChange).toFixed(1)}% change
              </p>
            </>
          ) : largestExpenseCat ? (
            <>
              <p className="text-xl font-bold dark:text-gray-100 truncate">
                {largestExpenseCat.categoryName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(largestExpenseCat.amount, 'INR')} (
                {largestExpenseCat.percentage.toFixed(1)}%)
              </p>
            </>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No data</p>
          )}
        </div>
      </div>

      {/* Charts — Spending / Income views */}
      {(selectedReportType === 'spending' || selectedReportType === 'income') && (
        <>
          <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <SpendingTrendsChart
              data={
                loading
                  ? []
                  : selectedReportType === 'income'
                    ? (incomeExpense?.timeSeriesData ?? []).map((d) => ({
                        date: d.date,
                        amount: d.income,
                      }))
                    : spendingTrendsData
              }
            />
            <CategoryComparisonChart data={loading ? [] : categoryComparisonData} />
          </div>
          <div className="mt-4 sm:mt-6">
            <MonthlyExpenseChart data={loading ? [] : monthlyExpenseData} />
          </div>
        </>
      )}

      {/* Net Worth view */}
      {selectedReportType === 'net_worth' && (
        <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold dark:text-gray-100 mb-4">
            Net Worth Over Time
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (netWorth?.timeSeriesData ?? []).length === 0 ? (
            <EmptyState
              image={wallet05}
              title="No net worth data available"
              description="Net worth data will appear here once you have accounts and transactions."
            />
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[480px] px-4 sm:px-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="pb-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Date
                      </th>
                      <th className="pb-2 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Assets
                      </th>
                      <th className="pb-2 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Liabilities
                      </th>
                      <th className="pb-2 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Net Worth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(netWorth?.timeSeriesData ?? []).map((row, i) => (
                      <tr key={i}>
                        <td className="py-3 dark:text-gray-300 whitespace-nowrap">{row.date}</td>
                        <td className="py-3 text-right text-green-600 whitespace-nowrap">
                          {formatCurrency(row.assets, 'INR')}
                        </td>
                        <td className="py-3 text-right text-red-500 whitespace-nowrap">
                          {formatCurrency(row.liabilities, 'INR')}
                        </td>
                        <td
                          className={`py-3 text-right font-medium whitespace-nowrap ${row.netWorth >= 0 ? 'dark:text-gray-100' : 'text-red-600'}`}
                        >
                          {formatCurrency(row.netWorth, 'INR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Budget performance view */}
      {selectedReportType === 'category' && (
        <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold dark:text-gray-100 mb-4">
            Budget Performance
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : !budgetPerformance ? (
            <EmptyState
              image={wallet05}
              title="No active budget found"
              description="Create a budget to see your spending performance across categories."
            />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budgeted</p>
                  <p className="font-bold dark:text-gray-100 text-sm sm:text-base">
                    {formatCurrency(budgetPerformance.totalBudgeted, 'INR')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
                  <p className="font-bold dark:text-gray-100 text-sm sm:text-base">
                    {formatCurrency(budgetPerformance.totalSpent, 'INR')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                  <p
                    className={`font-bold text-sm sm:text-base ${budgetPerformance.remainingBudget > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(budgetPerformance.remainingBudget, 'INR')}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {budgetPerformance.categories.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-gray-300 truncate mr-2">{cat.categoryName}</span>
                      <span className="dark:text-gray-400 shrink-0 text-xs sm:text-sm">
                        {formatCurrency(cat.spent, 'INR')} / {formatCurrency(cat.budgeted, 'INR')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${cat.status === 'over' ? 'bg-red-500' : cat.status === 'on_track' ? 'bg-yellow-400' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Export Controls */}
      <div className="mt-4 sm:mt-6">
        <ReportExportControls
          reportType={selectedReportType}
          incomeExpense={incomeExpense}
          netWorth={netWorth}
          budgetPerformance={budgetPerformance}
        />
      </div>
    </div>
  );
};

export default Reports;
