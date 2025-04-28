// src/components/reports/ReportExportControls.tsx
import { FC } from 'react';

import { Download, File, FileSpreadsheet, FileText } from 'lucide-react';

const ReportExportControls: FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">Export Report</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Export your report in various formats for further analysis or record keeping.
            </p>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="export-csv"
                  name="export-format"
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  defaultChecked
                />
                <label htmlFor="export-csv" className="ml-2 flex items-center">
                  <FileText size={16} className="mr-2 text-gray-500" />
                  <span>CSV (Comma Separated Values)</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="export-excel"
                  name="export-format"
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <label htmlFor="export-excel" className="ml-2 flex items-center">
                  <FileSpreadsheet size={16} className="mr-2 text-gray-500" />
                  <span>Excel Spreadsheet</span>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="export-pdf"
                  name="export-format"
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <label htmlFor="export-pdf" className="ml-2 flex items-center">
                  <File size={16} className="mr-2 text-gray-500" />
                  <span>PDF Document</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-4">Choose what to include in your export:</p>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-summary"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  defaultChecked
                />
                <label htmlFor="include-summary" className="ml-2">
                  Summary Data
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-charts"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  defaultChecked
                />
                <label htmlFor="include-charts" className="ml-2">
                  Charts and Visualizations
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-transactions"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  defaultChecked
                />
                <label htmlFor="include-transactions" className="ml-2">
                  Detailed Transactions
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-notes"
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="include-notes" className="ml-2">
                  Notes and Comments
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <Download size={16} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportControls;
