// src/components/investments/InvestmentForm.tsx
import { FC, useState } from "react";
import { X } from "lucide-react";
import {
  Investment,
  AssetClass,
  InvestmentType,
} from "../../types/investment.types";

interface InvestmentFormProps {
  onClose: () => void;
  onSubmit?: (data: Investment) => void;
  initialData?: Investment | null;
}

const InvestmentForm: FC<InvestmentFormProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    ticker: initialData?.ticker || "",
    assetClass: initialData?.assetClass || ("stocks" as AssetClass),
    type: initialData?.type || ("etf" as InvestmentType),
    shares: initialData?.shares?.toString() || "",
    purchasePrice: initialData?.purchasePrice?.toString() || "",
    currentPrice: initialData?.currentPrice?.toString() || "",
    purchaseDate:
      initialData?.purchaseDate || new Date().toISOString().split("T")[0],
    accountId: initialData?.accountId || "1",
    notes: initialData?.notes || "",
    dividendYield: initialData?.dividendYield?.toString() || "",
    sector: initialData?.sector || "",
    region: initialData?.region || "",
    currency: initialData?.currency || "USD",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const processedData = {
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      dividendYield: formData.dividendYield
        ? parseFloat(formData.dividendYield)
        : undefined,
    };

    if (onSubmit) {
      onSubmit(processedData);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
        <h2 className="text-xl font-bold">
          {initialData ? "Edit Investment" : "Add New Investment"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Investment Name*
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. S&P 500 ETF, Apple Inc."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ticker Symbol
        </label>
        <input
          type="text"
          name="ticker"
          value={formData.ticker}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. SPY, AAPL"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Class*
          </label>
          <select
            name="assetClass"
            value={formData.assetClass}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investment Type*
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shares/Units*
          </label>
          <input
            type="number"
            name="shares"
            value={formData.shares}
            onChange={handleChange}
            required
            step="0.0001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price*
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Price*
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Date
          </label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account
          </label>
          <select
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="1">Retirement Account</option>
            <option value="2">Brokerage Account</option>
            <option value="3">Roth IRA</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dividend Yield (%)
          </label>
          <input
            type="number"
            name="dividendYield"
            value={formData.dividendYield}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <input
            type="text"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. Technology, Financial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. US, International"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="USD">USD (₹)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="CAD">CAD (₹)</option>
          <option value="AUD">AUD (₹)</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Add any additional details here..."
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2 sticky bottom-0 bg-white pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {initialData ? "Update" : "Add"} Investment
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;
