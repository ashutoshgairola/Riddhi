// src/components/dashboard/RecentTransactionsWidget.tsx
import { FC } from 'react';

import { CreditCard, DollarSign } from 'lucide-react';

import { Transaction, TransactionType } from '../../types/transaction.types';

// Dummy data
const recentTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-04-22',
    description: 'Grocery Store',
    amount: 89.24,
    type: 'expense',
    categoryId: '1',
    accountId: '1',
    status: 'cleared',
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
  },
];

const RecentTransactionsWidget: FC = () => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return <DollarSign size={16} className="text-green-600" />;
      case 'expense':
        return <CreditCard size={16} className="text-red-600" />;
      case 'transfer':
        return <CreditCard size={16} className="text-blue-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <button className="text-blue-600 text-sm font-medium">View All</button>
        </div>
      </div>
      <div className="p-6">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="ml-4">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;
