// src/components/transactions/TransactionList.tsx
import { FC, useState } from 'react';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Edit2, Trash2 } from 'lucide-react';

import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import { Transaction, TransactionCategory } from '../../types/transaction.types';
import Spinner from '../common/Spinner';

// Assuming you have a spinner component

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  toggleDetails: (id: string) => void;
  showDetails: boolean;
  category?: TransactionCategory;
}

const TransactionItem: FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  toggleDetails,
  showDetails,
  category,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <div
        className="p-4 bg-white flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => toggleDetails(transaction.id)}
      >
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
            style={{
              backgroundColor: category?.color ? `${category.color}20` : '#e0e0e0',
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category?.color || '#9e9e9e' }}
            ></span>
          </div>

          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-gray-500">
              {formatDate(transaction.date)} • {category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <p
            className={`font-medium mr-4 ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>

          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction.id);
            }}
          >
            <Edit2 size={18} />
          </button>

          <button
            className="text-gray-400 hover:text-red-600 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
          >
            <Trash2 size={18} />
          </button>

          <div className="ml-2">
            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p>{category?.name || 'Uncategorized'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Account</p>
              <p>{transaction.accountId || 'Unknown Account'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="capitalize">{transaction.status}</p>
            </div>

            {transaction.notes && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p>{transaction.notes}</p>
              </div>
            )}

            {transaction.tags && transaction.tags.length > 0 && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-1">Tags</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {transaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {transaction.isRecurring && transaction.recurringDetails && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 mb-1">Recurring details</p>
                <p>
                  This transaction recurs{' '}
                  {transaction.recurringDetails.interval > 1
                    ? `every ${transaction.recurringDetails.interval} `
                    : ''}
                  {transaction.recurringDetails.frequency}
                  {transaction.recurringDetails.endDate
                    ? ` until ${new Date(transaction.recurringDetails.endDate).toLocaleDateString('en-IN')}`
                    : ' indefinitely'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionList: FC<TransactionListProps> = ({
  transactions,
  loading,
  onEdit,
  onDelete,
  onPageChange,
  currentPage,
  totalPages,
  totalItems,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { categories } = useTransactionCategories();

  // Convert categories array to a map for quick lookup
  const categoriesMap = categories.reduce<Record<string, TransactionCategory>>((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});

  const toggleDetails = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium">{totalItems} Transactions</h2>

        <div className="flex items-center">
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm mr-2">
            <option value="date:desc">Sort by Date (Newest First)</option>
            <option value="date:asc">Sort by Date (Oldest First)</option>
            <option value="amount:desc">Sort by Amount (Highest First)</option>
            <option value="amount:asc">Sort by Amount (Lowest First)</option>
          </select>

          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm">Export</button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : transactions.length > 0 ? (
          <>
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
                toggleDetails={toggleDetails}
                showDetails={expandedId === transaction.id}
                category={categoriesMap[transaction.categoryId]}
              />
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full mr-2 ${
                    currentPage === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded-full ${
                        currentPage === i + 1
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full ml-2 ${
                    currentPage === totalPages ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
