// src/pages/Transactions.tsx
import { FC, useCallback, useMemo, useState } from 'react';

import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import AddTransactionCategoryForm from '../components/transactions/AddTransactionCategoryForm';
import AddTransactionForm from '../components/transactions/AddTransactionForm';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionList from '../components/transactions/TransactionList';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { useTransactions } from '../hooks/useTransactions';
import { CategoryCreateDTO, CategoryUpdateDTO } from '../services/api/categoryService';
import {
  TransactionFilters as FilterType,
  RecurringFrequency,
  TransactionCreateDTO,
} from '../types/transaction.types';

const Transactions: FC = () => {
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterType>({
    startDate: undefined,
    endDate: undefined,
    types: undefined,
    searchTerm: '',
    page: 1,
    limit: 10,
    sort: 'date',
    order: 'desc',
  });

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [
      filters.startDate,
      filters.endDate,
      filters.types,
      filters.searchTerm,
      filters.page,
      filters.limit,
      filters.sort,
      filters.order,
      filters.categoryIds,
      filters.status,
      filters.tags,
      filters.minAmount,
      filters.maxAmount,
    ],
  );

  // Get transactions and categories using custom hooks
  const {
    transactions,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(memoizedFilters);

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
  } = useTransactionCategories();

  // Handle filter changes - debounce implemented in TransactionFilters component
  const handleFilterChange = useCallback((newFilters: FilterType) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset to page 1 when filters change
    }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Open add transaction modal
  const handleAddTransaction = useCallback(() => {
    setEditingTransactionId(null);
    setIsAddModalOpen(true);
  }, []);

  // Open edit transaction modal
  const handleEditTransaction = useCallback((id: string) => {
    setEditingTransactionId(id);
    setIsAddModalOpen(true);
  }, []);

  // Handle transaction submission
  const handleTransactionSubmit = useCallback(
    async (data: TransactionCreateDTO) => {
      if (editingTransactionId) {
        await updateTransaction({
          id: editingTransactionId,
          ...data,
        });
      } else {
        await createTransaction(data);
      }

      setIsAddModalOpen(false);
      setEditingTransactionId(null);
    },
    [editingTransactionId, createTransaction, updateTransaction],
  );

  // Handle transaction deletion
  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure you want to delete this transaction?')) {
        await deleteTransaction(id);
      }
    },
    [deleteTransaction],
  );

  // Handle category submission
  const handleCategorySubmit = useCallback(
    async (data: CategoryCreateDTO | CategoryUpdateDTO) => {
      if ('id' in data) {
        // Update existing category
        await updateCategory(data as CategoryUpdateDTO);
      } else {
        // Create new category
        await createCategory(data as CategoryCreateDTO);
      }
    },
    [createCategory, updateCategory],
  );

  // Get the transaction being edited (if any)
  const editingTransaction = editingTransactionId
    ? transactions.find((t) => t.id === editingTransactionId)
    : undefined;

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="View and manage your financial transactions"
        actions={
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsAddCategoryModalOpen(true)}
            >
              Add Category
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleAddTransaction}
            >
              Add Transaction
            </button>
          </div>
        }
      />

      <div className="mt-6">
        <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
          Error loading transactions: {error.message}
        </div>
      )}

      <div className="mt-6">
        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
        />
      </div>

      {/* Add/Edit Transaction Modal */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <AddTransactionForm
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleTransactionSubmit}
            initialData={
              editingTransaction
                ? {
                    ...editingTransaction,
                    recurringDetails: editingTransaction.recurringDetails
                      ? {
                          ...editingTransaction.recurringDetails,
                          frequency: editingTransaction.recurringDetails
                            .frequency as RecurringFrequency,
                        }
                      : undefined,
                  }
                : undefined
            }
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
        </Modal>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <Modal isOpen={isAddCategoryModalOpen} onClose={() => setIsAddCategoryModalOpen(false)}>
          <AddTransactionCategoryForm
            onClose={() => setIsAddCategoryModalOpen(false)}
            onSubmit={handleCategorySubmit}
          />
        </Modal>
      )}
    </div>
  );
};

export default Transactions;
