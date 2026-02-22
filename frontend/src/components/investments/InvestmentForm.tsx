// src/components/investments/InvestmentForm.tsx
import { FC, useState } from 'react';

import { X } from 'lucide-react';

import { useTheme } from '../../hooks/useTheme';
import {
  AssetClass,
  CreateInvestmentRequest,
  Investment,
  InvestmentType,
  UpdateInvestmentRequest,
} from '../../types/investment.types';

interface InvestmentFormProps {
  onClose: () => void;
  onSubmit?: (data: CreateInvestmentRequest | UpdateInvestmentRequest) => void;
  initialData?: Investment | null;
}

const InvestmentForm: FC<InvestmentFormProps> = ({ onClose, onSubmit, initialData }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    ticker: initialData?.ticker || '',
    assetClass: initialData?.assetClass || ('stocks' as AssetClass),
    type: initialData?.type || ('etf' as InvestmentType),
    shares: initialData?.shares?.toString() || '',
    purchasePrice: initialData?.purchasePrice?.toString() || '',
    currentPrice: initialData?.currentPrice?.toString() || '',
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split('T')[0],
    accountId: initialData?.accountId || '1',
    notes: initialData?.notes || '',
    dividendYield: initialData?.dividendYield?.toString() || '',
    sector: initialData?.sector || '',
    region: initialData?.region || '',
    currency: initialData?.currency || 'INR',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const processedData: CreateInvestmentRequest = {
      name: formData.name,
      ticker: formData.ticker || undefined,
      assetClass: formData.assetClass,
      type: formData.type,
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      purchaseDate: formData.purchaseDate,
      accountId: formData.accountId,
      notes: formData.notes || undefined,
      dividendYield: formData.dividendYield ? parseFloat(formData.dividendYield) : undefined,
      sector: formData.sector || undefined,
      region: formData.region || undefined,
      currency: formData.currency,
    };

    if (onSubmit) {
      onSubmit(processedData);
    }

    onClose();
  };

  const inputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
      : 'border-gray-300 text-gray-900'
  }`;
  const inputWithPrefixClass = `w-full px-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
      : 'border-gray-300 text-gray-900'
  }`;
  const labelClass = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const prefixClass = `absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <div
        className={`flex justify-between items-center mb-4 sticky top-0 pb-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {initialData ? 'Edit Investment' : 'Add New Investment'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={
            isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
          }
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Investment Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={inputClass}
          placeholder="e.g. S&P 500 ETF, Apple Inc."
        />
      </div>

      <div className="mb-4">
        <label className={labelClass}>Ticker Symbol</label>
        <input
          type="text"
          name="ticker"
          value={formData.ticker}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g. SPY, AAPL"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Asset Class*</label>
          <select
            name="assetClass"
            value={formData.assetClass}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="stocks">Stocks</option>
            <option value="bonds">Bonds</option>
            <option value="cash">Cash</option>
            <option value="alternatives">Alternatives</option>
            <option value="real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Investment Type*</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="etf">ETF</option>
            <option value="individual_stock">Individual Stock</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="bond">Bond</option>
            <option value="crypto">Cryptocurrency</option>
            <option value="options">Options</option>
            <option value="reit">REIT</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className={labelClass}>Shares/Units*</label>
          <input
            type="number"
            name="shares"
            value={formData.shares}
            onChange={handleChange}
            required
            step="0.0001"
            min="0"
            className={inputClass}
            placeholder="0"
          />
        </div>

        <div>
          <label className={labelClass}>Purchase Price*</label>
          <div className="relative">
            <span className={prefixClass}>₹</span>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className={inputWithPrefixClass}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Current Price*</label>
          <div className="relative">
            <span className={prefixClass}>₹</span>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className={inputWithPrefixClass}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>Purchase Date</label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Account</label>
          <select
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="1">Retirement Account</option>
            <option value="2">Brokerage Account</option>
            <option value="3">Roth IRA</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className={labelClass}>Dividend Yield (%)</label>
          <input
            type="number"
            name="dividendYield"
            value={formData.dividendYield}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="100"
            className={inputClass}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className={labelClass}>Sector</label>
          <input
            type="text"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Technology, Financial"
          />
        </div>

        <div>
          <label className={labelClass}>Region</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. US, International"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Currency</label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="CAD">CAD ($)</option>
          <option value="AUD">AUD ($)</option>
        </select>
      </div>

      <div className="mb-6">
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className={inputClass}
          rows={3}
          placeholder="Add any additional details here..."
        />
      </div>

      <div
        className={`flex justify-end space-x-2 sticky bottom-0 pt-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`px-4 py-2 border rounded-lg ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {initialData ? 'Update' : 'Add'} Investment
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;
