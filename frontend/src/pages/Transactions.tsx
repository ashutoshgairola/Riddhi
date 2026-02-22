// src/pages/Transactions.tsx
import { FC, useCallback, useState } from 'react';

import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import AddTransactionCategoryForm from '../components/transactions/AddTransactionCategoryForm';
import AddTransactionForm from '../components/transactions/AddTransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import { useHighlight } from '../hooks/useHighlight';
import { useToast } from '../hooks/useToast';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { useTransactions } from '../hooks/useTransactions';
import { CategoryCreateDTO, CategoryUpdateDTO } from '../services/api/categoryService';
import transactionService from '../services/api/transactionService';
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
  const [exporting, setExporting] = useState(false);

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

  // Get transactions and categories using custom hooks
  const {
    transactions,
    loading,
    totalItems,
    totalPages,
    currentPage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(filters);

  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    updateCategory,
  } = useTransactionCategories();

  const { warning, success, error: toastError } = useToast();

  // Highlight item from search navigation
  useHighlight(loading);

  // Handle filter changes - debounce implemented in TransactionFilters component
  const handleFilterChange = useCallback((newFilters: FilterType) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  // Handle sort change from TransactionList header
  const handleSortChange = useCallback((sort: string, order: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sort, order, page: 1 }));
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await transactionService.exportTransactions('csv', {
        startDate: filters.startDate,
        endDate: filters.endDate,
        types: filters.types,
        categoryIds: filters.categoryIds,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        searchTerm: filters.searchTerm,
        tags: filters.tags,
        status: filters.status,
        sort: filters.sort,
        order: filters.order,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success('Transactions exported successfully.');
    } catch {
      toastError('Failed to export transactions.');
    } finally {
      setExporting(false);
    }
  }, [filters, success, toastError]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Open add transaction modal
  const handleAddTransaction = useCallback(() => {
    if (!categoriesLoading && categories.length === 0) {
      warning('Please create a category first before adding a transaction.', 'No categories');
      return;
    }
    setEditingTransactionId(null);
    setIsAddModalOpen(true);
  }, [categories.length, categoriesLoading, warning]);

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
        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onExport={handleExport}
          exporting={exporting}
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
