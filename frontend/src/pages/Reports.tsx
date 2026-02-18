// src/pages/Reports.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import CategoryComparisonChart from '../components/reports/CategoryComparisonChart';
import MonthlyExpenseChart from '../components/reports/MonthlyExpenseChart';
import ReportExportControls from '../components/reports/ReportExportControls';
import SpendingTrendsChart from '../components/reports/SpendingTrendsChart';
import { ReportTimeframe, ReportType } from '../types/report.types';

// Dummy data for spending trends
const spendingTrendsData = [
  { date: '2025-01', amount: 3800 },
  { date: '2025-02', amount: 3600 },
  { date: '2025-03', amount: 3900 },
  { date: '2025-04', amount: 3310 },
];

// Dummy data for category comparison
const categoryComparisonData = [
  { name: 'Housing', current: 1500, previous: 1500 },
  { name: 'Food', current: 450, previous: 500 },
  { name: 'Transport', current: 275, previous: 300 },
  { name: 'Entertainment', current: 385, previous: 400 },
  { name: 'Utilities', current: 310, previous: 325 },
  { name: 'Shopping', current: 180, previous: 220 },
  { name: 'Health', current: 120, previous: 150 },
  { name: 'Personal Care', current: 90, previous: 110 },
];

// Dummy data for monthly expense breakdown
const monthlyExpenseData = [
  { name: 'Week 1', amount: 1050 },
  { name: 'Week 2', amount: 890 },
  { name: 'Week 3', amount: 750 },
  { name: 'Week 4', amount: 620 },
];

// Continuing src/pages/Reports.tsx
const Reports: FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ReportTimeframe>('month');
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('spending');

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        subtitle="Analyze your financial data"
        actions={
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as ReportTimeframe)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Generate Report
            </button>
          </div>
        }
      />

      {/* Report Type Selection */}
      <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedReportType === 'spending'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedReportType('spending')}
        >
          Spending Report
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedReportType === 'income'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedReportType('income')}
        >
          Income Report
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedReportType === 'net_worth'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedReportType('net_worth')}
        >
          Net Worth Report
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedReportType === 'category'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedReportType('category')}
        >
          Category Report
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            selectedReportType === 'custom'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setSelectedReportType('custom')}
        >
          Custom Report
        </button>
      </div>

      {/* Report Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spending</p>
          <p className="text-2xl font-bold dark:text-gray-100">₹3,310.00</p>
          <p className="text-sm text-green-600">↓ 15.1% vs previous period</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Income</p>
          <p className="text-2xl font-bold dark:text-gray-100">₹5,000.00</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No change vs previous period</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savings</p>
          <p className="text-2xl font-bold dark:text-gray-100">₹1,690.00</p>
          <p className="text-sm text-green-600">↑ 43.2% vs previous period</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Largest Category</p>
          <p className="text-2xl font-bold dark:text-gray-100">Housing</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">₹1,500.00 (45.3% of total)</p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendsChart data={spendingTrendsData} />
        <CategoryComparisonChart data={categoryComparisonData} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <MonthlyExpenseChart data={monthlyExpenseData} />
      </div>

      {/* Export Controls */}
      <div className="mt-6">
        <ReportExportControls />
      </div>
    </div>
  );
};

export default Reports;
