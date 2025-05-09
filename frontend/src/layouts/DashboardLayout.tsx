// src/layouts/DashboardLayout.tsx
import { FC, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Plus } from 'lucide-react';

import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import AddTransactionForm from '../components/transactions/AddTransactionForm';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionCreateDTO } from '../types/transaction.types';

const DashboardLayout: FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const { createTransaction } = useTransactions();
  const { categories, loading: categoriesLoading } = useTransactionCategories();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleAddTransaction = useCallback(() => {
    setShowAddTransaction((prev) => !prev);
  }, []);

  const handleTransactionSubmit = useCallback(
    async (data: TransactionCreateDTO) => {
      await createTransaction(data);
      toggleAddTransaction();
    },
    [createTransaction, toggleAddTransaction],
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Transaction Button */}
      <button
        onClick={toggleAddTransaction}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
      >
        <Plus size={24} />
      </button>

      {/* Quick Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* <h2 className="text-xl font-bold mb-4">Add Transaction</h2> */}
            <AddTransactionForm
              onClose={toggleAddTransaction}
              onSubmit={handleTransactionSubmit}
              categories={categories}
              categoriesLoading={categoriesLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
