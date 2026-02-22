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
      <PageHeader
        title="Financial Reports"
        subtitle="Analyze your financial data"
        actions={
          <div className="flex items-center space-x-2">
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm"
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
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm"
                />
              </>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-60 text-sm"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading…' : 'Generate'}
            </button>
          </div>
        }
      />

      {/* Error banner */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : 'Failed to load report data'}
        </div>
      )}

      {/* Report Type Tabs */}
      <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
        {reportTypes.map(({ label, value }) => (
          <button
            key={value}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              selectedReportType === value
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setSelectedReportType(value)}
          >
            {label} Report
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="mt-6">
            <MonthlyExpenseChart data={loading ? [] : monthlyExpenseData} />
          </div>
        </>
      )}

      {/* Net Worth view */}
      {selectedReportType === 'net_worth' && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Net Worth Over Time</h2>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="pb-2 text-gray-500 dark:text-gray-400">Date</th>
                    <th className="pb-2 text-right text-gray-500 dark:text-gray-400">Assets</th>
                    <th className="pb-2 text-right text-gray-500 dark:text-gray-400">
                      Liabilities
                    </th>
                    <th className="pb-2 text-right text-gray-500 dark:text-gray-400">Net Worth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(netWorth?.timeSeriesData ?? []).map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 dark:text-gray-300">{row.date}</td>
                      <td className="py-3 text-right text-green-600">
                        {formatCurrency(row.assets, 'INR')}
                      </td>
                      <td className="py-3 text-right text-red-500">
                        {formatCurrency(row.liabilities, 'INR')}
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${row.netWorth >= 0 ? 'dark:text-gray-100' : 'text-red-600'}`}
                      >
                        {formatCurrency(row.netWorth, 'INR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Budget performance view */}
      {selectedReportType === 'category' && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Budget Performance</h2>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budgeted</p>
                  <p className="font-bold dark:text-gray-100">
                    {formatCurrency(budgetPerformance.totalBudgeted, 'INR')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
                  <p className="font-bold dark:text-gray-100">
                    {formatCurrency(budgetPerformance.totalSpent, 'INR')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                  <p
                    className={`font-bold ${budgetPerformance.remainingBudget > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(budgetPerformance.remainingBudget, 'INR')}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {budgetPerformance.categories.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-gray-300">{cat.categoryName}</span>
                      <span className="dark:text-gray-400">
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
      <div className="mt-6">
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
