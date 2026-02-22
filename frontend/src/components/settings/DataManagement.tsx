// src/components/settings/DataManagement.tsx
import { FC, useRef, useState } from 'react';

import { CheckCircle, Loader2, Upload } from 'lucide-react';

import settingsService from '../../services/api/settingsService';

const DATA_TYPES = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'budgets', label: 'Budgets' },
  { key: 'goals', label: 'Goals' },
  { key: 'accounts', label: 'Accounts' },
];

const DataManagement: FC = () => {
  // Export
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState('transactions');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Clear
  const [clearTypes, setClearTypes] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  // --- Export ---
  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(format);
    setExportError(null);
    try {
      const blob = await settingsService.exportData(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `riddhi-export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // --- Import ---
  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const stats = await settingsService.importData(file, importType);
      setImportResult(stats);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setImportError('Import failed. Make sure the file format is correct.');
    } finally {
      setImporting(false);
    }
  };

  // --- Clear ---
  const toggleClearType = (key: string) => {
    setClearTypes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleClear = async () => {
    if (clearTypes.length === 0) {
      setClearError('Please select at least one data type.');
      return;
    }
    if (confirmation !== 'DELETE MY DATA') {
      setClearError('Type "DELETE MY DATA" exactly to confirm.');
      return;
    }
    setClearing(true);
    setClearError(null);
    setClearSuccess(false);
    try {
      await settingsService.clearData({ types: clearTypes, confirmation });
      setClearSuccess(true);
      setClearTypes([]);
      setConfirmation('');
      setTimeout(() => setClearSuccess(false), 4000);
    } catch {
      setClearError('Failed to clear data. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Export */}
      <div>
        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Export Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Download all your financial data in a standard format.
        </p>
        {exportError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{exportError}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-60"
          >
            {exporting === 'csv' && <Loader2 size={14} className="animate-spin" />}
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-60"
          >
            {exporting === 'json' && <Loader2 size={14} className="animate-spin" />}
            Export as JSON
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Import Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Import transactions, budgets, or goals from a CSV or JSON file.
        </p>

        <div className="flex flex-col gap-3 max-w-md">
          <div className="flex gap-3">
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="transactions">Transactions</option>
              <option value="budgets">Budgets</option>
              <option value="goals">Goals</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 text-sm">
              <Upload size={16} />
              Choose File
              <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" />
            </label>
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 w-fit"
          >
            {importing && <Loader2 size={14} className="animate-spin" />}
            Import Data
          </button>

          {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
          {importResult && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle size={16} />
              Imported {importResult.imported}, Skipped {importResult.skipped}, Errors{' '}
              {importResult.errors}
            </div>
          )}
        </div>
      </div>

      {/* Clear */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Clear Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Permanently delete selected categories of data from your account. This action cannot be
          undone.
        </p>

        <div className="space-y-2 mb-4">
          {DATA_TYPES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clearTypes.includes(key)}
                onChange={() => toggleClearType(key)}
                className="h-4 w-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
              />
              <span className="dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        <div className="max-w-sm mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type <span className="font-mono text-red-600">DELETE MY DATA</span> to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE MY DATA"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {clearError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{clearError}</p>}
        {clearSuccess && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-3">
            <CheckCircle size={16} /> Data cleared successfully.
          </div>
        )}

        <button
          onClick={handleClear}
          disabled={clearing}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
        >
          {clearing && <Loader2 size={14} className="animate-spin" />}
          Clear Selected Data
        </button>
      </div>
    </div>
  );
};

export default DataManagement;
