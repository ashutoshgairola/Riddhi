// src/pages/Budgets.tsx
import { FC, useCallback, useEffect, useState } from 'react';

import wallet04 from '../assets/empty-states/Wallet 04.svg';
import BudgetCategoryForm from '../components/budgets/BudgetCategoryForm';
import BudgetCategoryList from '../components/budgets/BudgetCategoryList';
import BudgetSummary from '../components/budgets/BudgetSummary';
import CreateBudgetForm from '../components/budgets/CreateBudgetForm';
import MonthlyBudgetOverview from '../components/budgets/MonthlyBudgetOverview';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import { useBudget } from '../hooks/useBudget';
import { useHighlight } from '../hooks/useHighlight';
import { BudgetCategory, BudgetCategoryCreateDTO, BudgetCreateDTO } from '../types/budget.types';

// Monthly overview data type
interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
  budget: number;
}

const Budgets: FC = () => {
  // State for UI
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [showCreateBudget, setShowCreateBudget] = useState(false);

  // Use our budget hook to interact with the API
  const {
    currentBudget,
    budgetHistory,
    loading,
    error,
    fetchCurrentBudget,
    createBudget,
    updateBudgetCategory,
    deleteBudgetCategory,
    createBudgetCategory,
  } = useBudget({
    limit: 6, // Last 6 months by default
    page: 1,
  });

  // Highlight budget from search navigation
  useHighlight(loading);

  // When component loads or when budgets change, update the monthly data
  useEffect(() => {
    if (currentBudget) {
      // Set the selected month to the current budget's name
      setSelectedMonth(currentBudget.name);

      // Create monthly data for the chart by combining current budget and history
      const data: MonthlyData[] = [];

      // Add history first (older to newer)
      const sortedHistory = [...budgetHistory].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      sortedHistory.forEach((budget) => {
        // Extract month name (e.g., "Jan", "Feb") from the budget name or date
        const date = new Date(budget.startDate);
        const monthName = date.toLocaleString('default', { month: 'short' });

        data.push({
          name: monthName,
          income: budget.income,
          expenses: budget.totalSpent,
          budget: budget.totalAllocated,
        });
      });

      // Add current budget
      const currentDate = new Date(currentBudget.startDate);
      const currentMonthName = currentDate.toLocaleString('default', { month: 'short' });

      data.push({
        name: currentMonthName,
        income: currentBudget.income,
        expenses: currentBudget.totalSpent,
        budget: currentBudget.totalAllocated,
      });

      // Add future months with zero values if needed to complete 6 months
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      while (data.length < 6) {
        const lastDate =
          data.length > 0
            ? new Date(
                currentDate.getFullYear(),
                monthNames.indexOf(data[data.length - 1].name) + 1,
                1,
              )
            : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

        data.push({
          name: monthNames[lastDate.getMonth()],
          income: 0,
          expenses: 0,
          budget: 0,
        });
      }

      // Keep only the last 6 months
      setMonthlyData(data.slice(-6));
    }
  }, [currentBudget, budgetHistory]);

  // Handle month selection change
  const handleMonthChange = useCallback(
    (month: string) => {
      setSelectedMonth(month);

      // Find the budget corresponding to the selected month
      // In a real app, you'd fetch the specific budget by ID here
      // For now, we just simulate this by checking the name
      const selectedBudget =
        month === currentBudget?.name
          ? currentBudget
          : budgetHistory.find((budget) => budget.name === month);

      if (selectedBudget && selectedBudget.id !== currentBudget?.id) {
        // If a past budget was selected, you'd fetch its details here
        // fetchBudgetById(selectedBudget.id);
      }
    },
    [currentBudget, budgetHistory],
  );

  // Handle opening the category edit modal
  const handleEditCategory = useCallback((category: BudgetCategory) => {
    setEditingCategory(category);
    setShowAddCategory(true);
  }, []);

  // Handle closing the category form
  const handleCloseForm = useCallback(() => {
    setShowAddCategory(false);
    setEditingCategory(null);
  }, []);

  // Handle category form submission
  const handleCategorySubmit = useCallback(
    async (formData: BudgetCategoryCreateDTO) => {
      if (!currentBudget) return;

      if (editingCategory) {
        // Update existing category
        await updateBudgetCategory(currentBudget.id, editingCategory.id, formData);
      } else {
        // Create new category
        await createBudgetCategory(currentBudget.id, formData);
      }

      handleCloseForm();
    },
    [currentBudget, editingCategory, createBudgetCategory, updateBudgetCategory, handleCloseForm],
  );

  // Handle category deletion
  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      if (!currentBudget) return;

      if (window.confirm('Are you sure you want to delete this category?')) {
        await deleteBudgetCategory(currentBudget.id, categoryId);
      }
    },
    [currentBudget, deleteBudgetCategory],
  );

  // Render loading state
  if (loading && !currentBudget) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Render error state
  if (error && !currentBudget) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 p-4 rounded-lg">
        <p>Error loading budget: {error.message}</p>
        <button
          onClick={() => fetchCurrentBudget()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle budget creation
  const handleCreateBudget = async (budgetData: BudgetCreateDTO) => {
    await createBudget(budgetData);
    // After creating, refresh the current budget data
    fetchCurrentBudget();
  };

  // If no current budget, render a button to create one
  if (!currentBudget) {
    return (
      <div className="p-6">
        <PageHeader title="Budgets" />
        <EmptyState
          image={wallet04}
          title="No active budget found"
          description="Create a new budget to start tracking your expenses and stay on top of your finances."
          action={
            <button
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              onClick={() => setShowCreateBudget(true)}
            >
              Create New Budget
            </button>
          }
        />

        {/* Create Budget Modal */}
        {showCreateBudget && (
          <Modal isOpen={showCreateBudget} onClose={() => setShowCreateBudget(false)}>
            <CreateBudgetForm
              onClose={() => setShowCreateBudget(false)}
              onSubmit={handleCreateBudget}
            />
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Budgets"
        subtitle="Plan and track your spending"
        actions={
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            >
              {/* Current budget option */}
              <option value={currentBudget.name}>{currentBudget.name}</option>

              {/* Past budgets options */}
              {budgetHistory.map((budget) => (
                <option key={budget.id} value={budget.name}>
                  {budget.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Category
            </button>
            <button
              onClick={() => setShowCreateBudget(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Budget
            </button>
          </div>
        }
      />

      {/* Budget Summary */}
      <div
        className="mt-6"
        id={`highlight-${(selectedMonth === currentBudget.name ? currentBudget : budgetHistory.find((b) => b.name === selectedMonth) || currentBudget).id}`}
      >
        <BudgetSummary
          budget={
            selectedMonth === currentBudget.name
              ? currentBudget
              : budgetHistory.find((b) => b.name === selectedMonth) || currentBudget
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Categories */}
        <div className="lg:col-span-2">
          <BudgetCategoryList
            categories={
              selectedMonth === currentBudget.name
                ? currentBudget.categories
                : (budgetHistory.find((b) => b.name === selectedMonth) || currentBudget).categories
            }
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            readOnly={selectedMonth !== currentBudget.name} // Past budgets are read-only
            loading={loading}
          />
        </div>

        {/* Monthly Overview */}
        <div className="lg:col-span-1">
          <MonthlyBudgetOverview data={monthlyData} />
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {showAddCategory && (
        <Modal isOpen={showAddCategory} onClose={handleCloseForm}>
          <BudgetCategoryForm
            onClose={handleCloseForm}
            onSubmit={handleCategorySubmit}
            initialData={editingCategory}
          />
        </Modal>
      )}

      {/* Create Budget Modal */}
      {showCreateBudget && (
        <Modal isOpen={showCreateBudget} onClose={() => setShowCreateBudget(false)}>
          <CreateBudgetForm
            onClose={() => setShowCreateBudget(false)}
            onSubmit={handleCreateBudget}
          />
        </Modal>
      )}
    </div>
  );
};

export default Budgets;
