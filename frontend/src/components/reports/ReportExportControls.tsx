// src/components/reports/ReportExportControls.tsx
import { FC, useState } from 'react';

import { Download, File, FileSpreadsheet, FileText } from 'lucide-react';

import {
  BudgetPerformanceResponse,
  IncomeExpenseResponse,
  NetWorthResponse,
  ReportType,
} from '../../types/report.types';

type ExportFormat = 'csv' | 'json';

interface ReportExportControlsProps {
  reportType: ReportType;
  incomeExpense: IncomeExpenseResponse | null;
  netWorth: NetWorthResponse | null;
  budgetPerformance: BudgetPerformanceResponse | null;
}

// ── helpers ────────────────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows: Record<string, string | number | boolean | null | undefined>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')),
  ];
  return lines.join('\n');
}

function buildRows(
  reportType: ReportType,
  incomeExpense: IncomeExpenseResponse | null,
  netWorth: NetWorthResponse | null,
  budgetPerformance: BudgetPerformanceResponse | null,
  includeSummary: boolean,
  includeTransactions: boolean,
): Record<string, string | number | boolean | null | undefined>[] {
  const rows: Record<string, string | number | boolean | null | undefined>[] = [];

  if (reportType === 'net_worth' && netWorth) {
    if (includeSummary) {
      rows.push({
        section: 'summary',
        currentNetWorth: netWorth.currentNetWorth,
        changeAmount: netWorth.changeAmount,
        changePercentage: netWorth.changePercentage,
      });
    }
    (netWorth.timeSeriesData ?? []).forEach((d) =>
      rows.push({
        section: 'history',
        date: d.date,
        assets: d.assets,
        liabilities: d.liabilities,
        netWorth: d.netWorth,
      }),
    );
    return rows;
  }

  if (reportType === 'category' && budgetPerformance) {
    if (includeSummary) {
      rows.push({
        section: 'summary',
        budgetName: budgetPerformance.budgetName,
        totalBudgeted: budgetPerformance.totalBudgeted,
        totalSpent: budgetPerformance.totalSpent,
        remainingBudget: budgetPerformance.remainingBudget,
        overBudgetAmount: budgetPerformance.overBudgetAmount,
      });
    }
    (budgetPerformance.categories ?? []).forEach((c) =>
      rows.push({
        section: 'category',
        name: c.categoryName,
        budgeted: c.budgeted,
        spent: c.spent,
        remaining: c.remaining,
        percentUsed: c.percentUsed,
        status: c.status,
      }),
    );
    return rows;
  }

  // spending / income / custom
  if (incomeExpense) {
    if (includeSummary) {
      rows.push({
        section: 'summary',
        totalIncome: incomeExpense.totalIncome,
        totalExpenses: incomeExpense.totalExpenses,
        netCashFlow: incomeExpense.netCashFlow,
        savingsRate: incomeExpense.savingsRate,
      });
    }
    (incomeExpense.timeSeriesData ?? []).forEach((d) =>
      rows.push({ section: 'timeSeries', date: d.date, income: d.income, expenses: d.expenses }),
    );
    if (includeTransactions) {
      (incomeExpense.expensesByCategory ?? []).forEach((c) =>
        rows.push({
          section: 'expenseCategory',
          name: c.categoryName,
          amount: c.amount,
          percentage: c.percentage,
        }),
      );
      (incomeExpense.incomeByCategory ?? []).forEach((c) =>
        rows.push({
          section: 'incomeCategory',
          name: c.categoryName,
          amount: c.amount,
          percentage: c.percentage,
        }),
      );
    }
  }

  return rows;
}

// ── component ──────────────────────────────────────────────────────────────────

const ReportExportControls: FC<ReportExportControlsProps> = ({
  reportType,
  incomeExpense,
  netWorth,
  budgetPerformance,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);

  const hasData = !!(incomeExpense || netWorth || budgetPerformance);

  const handleExport = (): void => {
    const rows = buildRows(
      reportType,
      incomeExpense,
      netWorth,
      budgetPerformance,
      includeSummary,
      includeTransactions,
    );

    if (rows.length === 0) return;

    const timestamp = new Date().toISOString().slice(0, 10);
    const baseName = `riddhi-${reportType}-report-${timestamp}`;

    if (format === 'csv') {
      downloadFile(`${baseName}.csv`, toCSV(rows), 'text/csv');
    } else {
      const payload = {
        reportType,
        exportedAt: new Date().toISOString(),
        options: { includeSummary, includeCharts, includeTransactions, includeNotes },
        data: rows,
      };
      downloadFile(`${baseName}.json`, JSON.stringify(payload, null, 2), 'application/json');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-gray-100">Export Report</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format selection */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Export your report in various formats for further analysis or record keeping.
            </p>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="export-format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 focus:ring-green-500"
                />
                <span className="ml-2 flex items-center dark:text-gray-300">
                  <FileText size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  CSV (Comma Separated Values)
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="export-format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 focus:ring-green-500"
                />
                <span className="ml-2 flex items-center dark:text-gray-300">
                  <FileSpreadsheet size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  JSON (Raw Data)
                </span>
              </label>

              <label className="flex items-center cursor-pointer opacity-50 select-none">
                <input
                  type="radio"
                  name="export-format"
                  disabled
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 focus:ring-green-500"
                />
                <span className="ml-2 flex items-center dark:text-gray-300">
                  <File size={16} className="mr-2 text-gray-500 dark:text-gray-400" />
                  PDF Document (coming soon)
                </span>
              </label>
            </div>
          </div>

          {/* Include options */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose what to include in your export:
            </p>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="ml-2 dark:text-gray-300">Summary Data</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="ml-2 dark:text-gray-300">Charts and Visualizations</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTransactions}
                  onChange={(e) => setIncludeTransactions(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="ml-2 dark:text-gray-300">Detailed Transactions</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                />
                <span className="ml-2 dark:text-gray-300">Notes and Comments</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {!hasData && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Generate a report first to enable export.
            </p>
          )}
          <button
            onClick={handleExport}
            disabled={!hasData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportControls;
