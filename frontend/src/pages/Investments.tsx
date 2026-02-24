// src/pages/Investments.tsx
import { FC, useState } from 'react';

import Modal from '../components/common/Modal';
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
            className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-full hover:bg-green-700 active:scale-95 transition-all select-none"
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

      {/* Portfolio summary — 1 col on mobile, 3 col on md+ */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-3`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Portfolio</p>
          <p
            className={`text-sm sm:text-xl font-bold tabular-nums ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
          >
            {loading ? '—' : formatCurrency(portfolioSummary?.totalValue ?? 0, 'INR')}
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-3`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>30D Return</p>
          <p
            className={`text-sm sm:text-xl font-bold tabular-nums ${
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

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow p-3`}>
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>YTD</p>
          <p
            className={`text-sm sm:text-xl font-bold tabular-nums ${
              (portfolioSummary?.ytdReturnPercent ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {loading
              ? '—'
              : `${(portfolioSummary?.ytdReturnPercent ?? 0) >= 0 ? '+' : ''}${portfolioSummary?.ytdReturnPercent?.toFixed(2) ?? '0.00'}%`}
          </p>
        </div>
      </div>

      {/* Filter tabs — horizontally scrollable on mobile */}
      <div className="mt-4 sm:mt-6 flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filterButtons.map(({ label, value }) => (
          <button
            key={label}
            className={`px-4 py-2 rounded-full whitespace-nowrap min-h-[36px] text-sm font-medium shrink-0 select-none transition-colors ${
              activeFilter === value
                ? 'bg-green-600 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }`}
            onClick={() => setActiveFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Charts — stacked on mobile, side-by-side on lg+ */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
      <div className="mt-4 sm:mt-6">
        <InvestmentList
          investments={filteredInvestments}
          onEditInvestment={handleEditInvestment}
          onDeleteInvestment={handleDeleteInvestment}
          loading={loading}
        />
      </div>

      {/* Add/Edit Investment Modal — uses responsive Modal component */}
      <Modal isOpen={showAddInvestment} onClose={handleCloseForm} size="md">
        <InvestmentForm
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingInvestment}
        />
      </Modal>
    </div>
  );
};

export default Investments;
