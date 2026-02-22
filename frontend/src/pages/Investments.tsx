// src/pages/Investments.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import AssetAllocationChart from '../components/investments/AssetAllocationChart';
import InvestmentForm from '../components/investments/InvestmentForm';
import InvestmentList from '../components/investments/InvestmentList';
import PortfolioPerformanceChart from '../components/investments/PortfolioPerformanceChart';
import { useHighlight } from '../hooks/useHighlight';
import { useInvestments } from '../hooks/useInvestments';
import { useTheme } from '../hooks/useTheme';
import {
  AssetClass,
  CreateInvestmentRequest,
  Investment,
  UpdateInvestmentRequest,
} from '../types/investment.types';
import { formatCurrency } from '../utils';

const Investments: FC = () => {
  const { isDark } = useTheme();
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [activeFilter, setActiveFilter] = useState<AssetClass | null>(null);

  const {
    investments,
    portfolioSummary,
    allocations,
    performance,
    loading,
    error,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestments();

  // Highlight investment from search navigation
  useHighlight(loading);

  const handleAddInvestment = (): void => {
    setEditingInvestment(null);
    setShowAddInvestment(true);
  };

  const handleEditInvestment = (investment: Investment): void => {
    setEditingInvestment(investment);
    setShowAddInvestment(true);
  };

  const handleCloseForm = (): void => {
    setShowAddInvestment(false);
    setEditingInvestment(null);
  };

  const handleFormSubmit = async (
    data: CreateInvestmentRequest | UpdateInvestmentRequest,
  ): Promise<void> => {
    if (editingInvestment) {
      await updateInvestment(editingInvestment.id, data as UpdateInvestmentRequest);
    } else {
      await createInvestment(data as CreateInvestmentRequest);
    }
    handleCloseForm();
  };

  const handleDeleteInvestment = async (id: string): Promise<void> => {
    await deleteInvestment(id);
  };

  const filteredInvestments = activeFilter
    ? investments.filter((inv) => inv.assetClass === activeFilter)
    : investments;

  const filterButtons: { label: string; value: AssetClass | null }[] = [
    { label: 'All Assets', value: null },
    { label: 'Stocks', value: 'stocks' },
    { label: 'Bonds', value: 'bonds' },
    { label: 'Real Estate', value: 'real_estate' },
    { label: 'Alternatives', value: 'alternatives' },
    { label: 'Cash', value: 'cash' },
  ];

  return (
    <div>
      <PageHeader
        title="Investment Portfolio"
        subtitle="Track and manage your investments"
        actions={
          <button
            onClick={handleAddInvestment}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Investment
          </button>
        }
      />

      {error && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm border ${isDark ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}
        >
          {error.message}
        </div>
      )}

      {/* Portfolio summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Portfolio Value
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {loading ? '—' : formatCurrency(portfolioSummary?.totalValue ?? 0, 'INR')}
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            30-Day Return
          </p>
          <p
            className={`text-2xl font-bold ${
              (portfolioSummary?.thirtyDayReturnPercent ?? 0) >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}
          >
            {loading
              ? '—'
              : `${(portfolioSummary?.thirtyDayReturnPercent ?? 0) >= 0 ? '+' : ''}${portfolioSummary?.thirtyDayReturnPercent?.toFixed(2) ?? '0.00'}%`}
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>YTD Return</p>
          <p
            className={`text-2xl font-bold ${
              (portfolioSummary?.ytdReturnPercent ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {loading
              ? '—'
              : `${(portfolioSummary?.ytdReturnPercent ?? 0) >= 0 ? '+' : ''}${portfolioSummary?.ytdReturnPercent?.toFixed(2) ?? '0.00'}%`}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
        {filterButtons.map(({ label, value }) => (
          <button
            key={label}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeFilter === value
                ? 'bg-green-600 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Allocation Chart */}
        <div>
          <AssetAllocationChart allocations={allocations} />
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <PortfolioPerformanceChart data={performance} />
        </div>
      </div>

      {/* Investments List */}
      <div className="mt-6">
        <InvestmentList
          investments={filteredInvestments}
          onEditInvestment={handleEditInvestment}
          onDeleteInvestment={handleDeleteInvestment}
          loading={loading}
        />
      </div>

      {/* Add/Edit Investment Modal */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}
          >
            <InvestmentForm
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
              initialData={editingInvestment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;
