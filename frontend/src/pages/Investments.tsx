// src/pages/Investments.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import AssetAllocationChart from '../components/investments/AssetAllocationChart';
import InvestmentForm from '../components/investments/InvestmentForm';
import InvestmentList from '../components/investments/InvestmentList';
import PortfolioPerformanceChart from '../components/investments/PortfolioPerformanceChart';
import { AssetAllocation, Investment } from '../types/investment.types';

// Dummy investment data
const investmentsData: Investment[] = [
  {
    id: '1',
    name: 'S&P 500 ETF',
    ticker: 'SPY',
    assetClass: 'stocks',
    type: 'etf',
    shares: 15,
    purchasePrice: 400,
    currentPrice: 445,
    purchaseDate: '2023-06-15',
    accountId: '1',
    dividendYield: 1.5,
    sector: 'Diversified',
    region: 'US',
    currency: 'USD',
  },
  {
    id: '2',
    name: 'Total Bond Market ETF',
    ticker: 'BND',
    assetClass: 'bonds',
    type: 'etf',
    shares: 50,
    purchasePrice: 85,
    currentPrice: 88,
    purchaseDate: '2023-08-10',
    accountId: '1',
    dividendYield: 2.8,
    sector: 'Fixed Income',
    region: 'US',
    currency: 'USD',
  },
  {
    id: '3',
    name: 'Tech Company Stock',
    ticker: 'TECH',
    assetClass: 'stocks',
    type: 'individual_stock',
    shares: 10,
    purchasePrice: 150,
    currentPrice: 200,
    purchaseDate: '2024-01-05',
    accountId: '1',
    dividendYield: 0.5,
    sector: 'Technology',
    region: 'US',
    currency: 'USD',
  },
  {
    id: '4',
    name: 'International Developed Markets ETF',
    ticker: 'VEA',
    assetClass: 'stocks',
    type: 'etf',
    shares: 30,
    purchasePrice: 45,
    currentPrice: 48,
    purchaseDate: '2023-11-12',
    accountId: '1',
    dividendYield: 2.2,
    sector: 'Diversified',
    region: 'International',
    currency: 'USD',
  },
  {
    id: '5',
    name: 'REIT Index Fund',
    ticker: 'VNQ',
    assetClass: 'real_estate',
    type: 'etf',
    shares: 20,
    purchasePrice: 90,
    currentPrice: 95,
    purchaseDate: '2024-02-18',
    accountId: '1',
    dividendYield: 3.8,
    sector: 'Real Estate',
    region: 'US',
    currency: 'USD',
  },
  {
    id: '6',
    name: 'Emerging Markets Fund',
    ticker: 'VWO',
    assetClass: 'stocks',
    type: 'etf',
    shares: 25,
    purchasePrice: 42,
    currentPrice: 40,
    purchaseDate: '2023-09-20',
    accountId: '1',
    dividendYield: 2.5,
    sector: 'Diversified',
    region: 'Emerging Markets',
    currency: 'USD',
  },
];

// Dummy asset allocation data
const assetAllocationData: AssetAllocation[] = [
  { assetClass: 'stocks', percentage: 65, amount: 10650, color: '#4CAF50' },
  { assetClass: 'bonds', percentage: 20, amount: 4400, color: '#2196F3' },
  { assetClass: 'real_estate', percentage: 10, amount: 1900, color: '#FFC107' },
  { assetClass: 'cash', percentage: 5, amount: 700, color: '#9E9E9E' },
];

// Dummy performance data
const performanceData = [
  { date: '2023-05', value: 15000 },
  { date: '2023-06', value: 15300 },
  { date: '2023-07', value: 15800 },
  { date: '2023-08', value: 16200 },
  { date: '2023-09', value: 15900 },
  { date: '2023-10', value: 16400 },
  { date: '2023-11', value: 16800 },
  { date: '2023-12', value: 17300 },
  { date: '2024-01', value: 17600 },
  { date: '2024-02', value: 17400 },
  { date: '2024-03', value: 17900 },
  { date: '2024-04', value: 18250 },
];

const Investments: FC = () => {
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleAddInvestment = () => {
    setEditingInvestment(null);
    setShowAddInvestment(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowAddInvestment(true);
  };

  const handleCloseForm = () => {
    setShowAddInvestment(false);
    setEditingInvestment(null);
  };

  // Filter investments by asset class if activeFilter is set
  const filteredInvestments = activeFilter
    ? investmentsData.filter((investment) => investment.assetClass === activeFilter)
    : investmentsData;

  // Calculate total portfolio value
  const portfolioValue = investmentsData.reduce(
    (total, investment) => total + investment.shares * investment.currentPrice,
    0,
  );

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

      {/* Portfolio summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(portfolioValue)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">30-Day Return</p>
          <p className="text-2xl font-bold text-green-600">+1.95%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">YTD Return</p>
          <p className="text-2xl font-bold text-green-600">+5.72%</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex space-x-2 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeFilter === null ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setActiveFilter(null)}
        >
          All Assets
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeFilter === 'stocks' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setActiveFilter('stocks')}
        >
          Stocks
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeFilter === 'bonds' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setActiveFilter('bonds')}
        >
          Bonds
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeFilter === 'real_estate' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setActiveFilter('real_estate')}
        >
          Real Estate
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeFilter === 'alternatives' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setActiveFilter('alternatives')}
        >
          Alternatives
        </button>
        <button
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeFilter === 'cash' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
          }`}
          onClick={() => setActiveFilter('cash')}
        >
          Cash
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Allocation Chart */}
        <div>
          <AssetAllocationChart allocations={assetAllocationData} />
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <PortfolioPerformanceChart data={performanceData} />
        </div>
      </div>

      {/* Investments List */}
      <div className="mt-6">
        <InvestmentList investments={filteredInvestments} onEditInvestment={handleEditInvestment} />
      </div>

      {/* Add/Edit Investment Modal */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <InvestmentForm onClose={handleCloseForm} initialData={editingInvestment} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;
