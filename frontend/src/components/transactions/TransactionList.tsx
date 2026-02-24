// src/components/transactions/TransactionList.tsx
import { FC, useState } from 'react';

import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Edit2,
  Filter,
  Loader2,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import wallet01 from '../../assets/empty-states/Wallet 01.svg';
import { useTransactionCategories } from '../../hooks/useTransactionCategories';
import {
  TransactionFilters as FilterType,
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from '../../types/transaction.types';
import { formatCurrency } from '../../utils';
import { getIconComponent } from '../../utils/iconUtils';
import EmptyState from '../common/EmptyState';
import Spinner from '../common/Spinner';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  onSortChange: (sort: string, order: 'asc' | 'desc') => void;
  onExport: () => void;
  exporting?: boolean;
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
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      id={`highlight-${transaction.id}`}
      className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2 overflow-hidden"
    >
      <div
        className="p-4 bg-white dark:bg-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 select-none active:bg-gray-50 dark:active:bg-gray-700"
        onClick={() => toggleDetails(transaction.id)}
      >
        <div className="flex items-center min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
            style={{
              backgroundColor: category?.color || '#e0e0e0',
            }}
          >
            {category?.icon ? (
              (() => {
                const IconComponent = getIconComponent(category.icon);
                return <IconComponent size={16} className="text-white" />;
              })()
            ) : (
              <span className="text-white text-sm">
                {category?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-medium dark:text-gray-100 truncate">{transaction.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(transaction.date)}
              </p>
              {category && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[90px] truncate">
                  {category?.icon && (
                    <>
                      {(() => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <IconComponent
                            size={12}
                            className="text-gray-600 dark:text-gray-400 mr-1"
                          />
                        );
                      })()}
                    </>
                  )}
                  {category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0 ml-2">
          <p
            className={`font-medium mr-2 sm:mr-4 text-sm sm:text-base tabular-nums ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount, 'INR')}
          </p>

          <button
            className="p-1.5 -m-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:text-gray-700 transition-colors touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction.id);
            }}
          >
            <Edit2 size={18} />
          </button>

          <button
            className="p-1.5 -m-1 ml-1 text-gray-400 hover:text-red-600 active:text-red-700 transition-colors touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
          >
            <Trash2 size={18} />
          </button>

          <div className="ml-2 dark:text-gray-400">
            {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
              <p className="dark:text-gray-200">{category?.name || 'Uncategorized'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account</p>
              <p className="dark:text-gray-200">{transaction.accountId || 'Unknown Account'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <p className="capitalize dark:text-gray-200">{transaction.status}</p>
            </div>

            {transaction.notes && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="dark:text-gray-200">{transaction.notes}</p>
              </div>
            )}

            {transaction.tags && transaction.tags.length > 0 && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tags</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {transaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {transaction.isRecurring && transaction.recurringDetails && (
              <div className="col-span-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recurring details</p>
                <p className="dark:text-gray-200">
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
  filters,
  onFilterChange,
  onSortChange,
  onExport,
  exporting = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { categories } = useTransactionCategories();

  const categoriesMap = categories.reduce<Record<string, TransactionCategory>>((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});

  const toggleDetails = (id: string) => setExpandedId(expandedId === id ? null : id);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  const handleTypeToggle = (type: TransactionType) => {
    const current = filters.types || [];
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    onFilterChange({ ...filters, types: next.length ? next : undefined, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.types?.length ||
      filters.startDate ||
      filters.endDate ||
      filters.categoryIds?.length ||
      filters.minAmount ||
      filters.maxAmount ||
      filters.tags?.length ||
      filters.status?.length,
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* ── Unified control bar ── */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
        {/* Transaction count */}
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 shrink-0 mr-auto">
          {totalItems} Transactions
        </span>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.searchTerm || ''}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value, page: 1 })}
            className="pl-8 pr-7 py-1.5 w-36 sm:w-52 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:[color-scheme:dark]"
          />
          {filters.searchTerm && (
            <button
              onClick={() => onFilterChange({ ...filters, searchTerm: '', page: 1 })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          title={showFilters || hasActiveFilters ? 'Hide filters' : 'Show filters'}
          onClick={() => setShowFilters((v) => !v)}
          className={`relative p-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter size={16} />
          {hasActiveFilters && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
        </button>

        {/* Sort — cycles through 4 options */}
        <button
          title={`Sort: ${
            filters.sort === 'date' && filters.order === 'desc'
              ? 'Date (Newest First)'
              : filters.sort === 'date' && filters.order === 'asc'
                ? 'Date (Oldest First)'
                : filters.sort === 'amount' && filters.order === 'desc'
                  ? 'Amount (High → Low)'
                  : 'Amount (Low → High)'
          } — click to cycle`}
          onClick={() => {
            const options: Array<[string, 'asc' | 'desc']> = [
              ['date', 'desc'],
              ['date', 'asc'],
              ['amount', 'desc'],
              ['amount', 'asc'],
            ];
            const current = options.findIndex(
              ([s, o]) => s === (filters.sort ?? 'date') && o === (filters.order ?? 'desc'),
            );
            const [s, o] = options[(current + 1) % options.length];
            onSortChange(s, o);
          }}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {filters.sort === 'amount' && filters.order === 'asc' ? (
            <ArrowDown01 size={16} />
          ) : filters.sort === 'amount' && filters.order === 'desc' ? (
            <ArrowDown10 size={16} />
          ) : filters.order === 'asc' ? (
            <ArrowDownAZ size={16} />
          ) : (
            <ArrowUpAZ size={16} />
          )}
        </button>

        {/* Export */}
        <button
          title="Export as CSV"
          onClick={onExport}
          disabled={exporting}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
      </div>

      {/* ── Expandable filter panel ── */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(['income', 'expense', 'transfer'] as TransactionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-2.5 py-1 rounded-full text-xs capitalize transition-colors ${
                      filters.types?.includes(type)
                        ? type === 'income'
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                          : type === 'expense'
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Date Range
              </p>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 dark:[color-scheme:dark]"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, startDate: e.target.value || undefined, page: 1 })
                  }
                />
                <input
                  type="date"
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 dark:[color-scheme:dark]"
                  value={filters.endDate || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, endDate: e.target.value || undefined, page: 1 })
                  }
                />
              </div>
            </div>

            {/* Amount range */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Amount Range
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="pl-5 pr-2 py-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={filters.minAmount ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        minAmount: e.target.value ? +e.target.value : undefined,
                        page: 1,
                      })
                    }
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="pl-5 pr-2 py-1.5 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={filters.maxAmount ?? ''}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        maxAmount: e.target.value ? +e.target.value : undefined,
                        page: 1,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Status + clear */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Status
              </p>
              <div className="flex gap-2 items-start">
                <select
                  className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 dark:[color-scheme:dark]"
                  value={filters.status?.[0] || ''}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      status: e.target.value ? [e.target.value as TransactionStatus] : undefined,
                      page: 1,
                    })
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="cleared">Cleared</option>
                  <option value="reconciled">Reconciled</option>
                  <option value="void">Void</option>
                </select>
                {hasActiveFilters && (
                  <button
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        types: undefined,
                        startDate: undefined,
                        endDate: undefined,
                        categoryIds: undefined,
                        minAmount: undefined,
                        maxAmount: undefined,
                        status: undefined,
                        tags: undefined,
                        page: 1,
                      })
                    }
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── List ── */}
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200'}`}
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Smart pagination: show truncated range on mobile */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | '...')[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push('...');
                      for (
                        let i = Math.max(2, currentPage - 1);
                        i <= Math.min(totalPages - 1, currentPage + 1);
                        i++
                      )
                        pages.push(i);
                      if (currentPage < totalPages - 2) pages.push('...');
                      pages.push(totalPages);
                    }
                    return pages.map((p, idx) =>
                      p === '...' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 text-center text-gray-400 dark:text-gray-500 text-sm select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p as number)}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                            currentPage === p
                              ? 'bg-green-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    );
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center transition-colors ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            image={wallet01}
            title="No transactions found"
            description="Your transactions will appear here once you add them."
          />
        )}
      </div>
    </div>
  );
};

export default TransactionList;
