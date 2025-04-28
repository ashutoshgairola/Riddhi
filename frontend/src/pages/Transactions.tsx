// src/pages/Transactions.tsx
import { FC, useState } from 'react';

import PageHeader from '../components/common/PageHeader';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionList from '../components/transactions/TransactionList';
import { TransactionFilters as FilterType, Transaction } from '../types/transaction.types';

// Dummy data
const transactionsData: Transaction[] = [
  {
    id: '1',
    date: '2025-04-22',
    description: 'Grocery Store',
    amount: 89.24,
    type: 'expense',
    categoryId: '1',
    accountId: '1',
    status: 'cleared',
    tags: ['food', 'groceries'],
  },
  {
    id: '2',
    date: '2025-04-21',
    description: 'Monthly Salary',
    amount: 5000,
    type: 'income',
    categoryId: '2',
    accountId: '1',
    status: 'cleared',
    tags: ['salary', 'income'],
  },
  {
    id: '3',
    date: '2025-04-20',
    description: 'Restaurant',
    amount: 64.5,
    type: 'expense',
    categoryId: '3',
    accountId: '1',
    status: 'cleared',
    tags: ['food', 'dining out'],
  },
  {
    id: '4',
    date: '2025-04-18',
    description: 'Electricity Bill',
    amount: 110.33,
    type: 'expense',
    categoryId: '4',
    accountId: '1',
    status: 'cleared',
    tags: ['utilities', 'bills'],
  },
  {
    id: '5',
    date: '2025-04-15',
    description: 'Gym Membership',
    amount: 49.99,
    type: 'expense',
    categoryId: '5',
    accountId: '2',
    status: 'cleared',
    tags: ['fitness', 'subscriptions'],
  },
  {
    id: '6',
    date: '2025-04-14',
    description: 'Client Payment',
    amount: 1200,
    type: 'income',
    categoryId: '6',
    accountId: '1',
    status: 'cleared',
    tags: ['freelance', 'income'],
  },
  {
    id: '7',
    date: '2025-04-10',
    description: 'Internet Bill',
    amount: 75.0,
    type: 'expense',
    categoryId: '4',
    accountId: '1',
    status: 'cleared',
    tags: ['utilities', 'bills'],
  },
  {
    id: '8',
    date: '2025-04-05',
    description: 'Movie Tickets',
    amount: 32.5,
    type: 'expense',
    categoryId: '7',
    accountId: '2',
    status: 'cleared',
    tags: ['entertainment'],
  },
  {
    id: '9',
    date: '2025-04-03',
    description: 'Clothing Store',
    amount: 128.75,
    type: 'expense',
    categoryId: '8',
    accountId: '2',
    status: 'cleared',
    tags: ['shopping', 'clothing'],
  },
  {
    id: '10',
    date: '2025-04-01',
    description: 'Rent Payment',
    amount: 1500,
    type: 'expense',
    categoryId: '1',
    accountId: '1',
    status: 'cleared',
    tags: ['housing', 'bills'],
  },
];

const Transactions: FC = () => {
  const [filters, setFilters] = useState<FilterType>({
    startDate: undefined,
    endDate: undefined,
    types: undefined,
    searchTerm: '',
  });

  // Filter transactions based on current filters
  const filteredTransactions = transactionsData.filter((transaction) => {
    // Filter by search term
    if (
      filters.searchTerm &&
      !transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filter by transaction type
    if (filters.types && filters.types.length > 0 && !filters.types.includes(transaction.type)) {
      return false;
    }

    // Filter by date range
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }

    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="View and manage your financial transactions"
        actions={
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Add Transaction
          </button>
        }
      />

      <div className="mt-6">
        <TransactionFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="mt-6">
        <TransactionList transactions={filteredTransactions} />
      </div>
    </div>
  );
};

export default Transactions;
