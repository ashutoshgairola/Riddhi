// src/components/dashboard/RecentTransactionsWidget.tsx
import { FC } from 'react';
import { Link } from 'react-router-dom';

import { ArrowLeftRight, CreditCard, DollarSign } from 'lucide-react';

import { RecentTransaction } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils';

interface RecentTransactionsWidgetProps {
  transactions: RecentTransaction[];
  loading?: boolean;
}

const RecentTransactionsWidget: FC<RecentTransactionsWidgetProps> = ({ transactions, loading }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getTransactionIcon = (type: RecentTransaction['type']) => {
    if (type === 'income') return <DollarSign size={16} className="text-green-600" />;
    if (type === 'transfer') return <ArrowLeftRight size={16} className="text-blue-500" />;
    return <CreditCard size={16} className="text-red-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full">
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-gray-100">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">
            No transactions yet
          </p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:mb-0 last:pb-0"
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : transaction.type === 'transfer'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="ml-4">
                  <p className="font-medium dark:text-gray-100">{transaction.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.categoryName} · {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, 'INR')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;
