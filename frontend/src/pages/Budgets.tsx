// src/pages/Budgets.tsx
import { FC, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import BudgetSummary from "../components/budgets/BudgetSummary";
import BudgetCategoryList from "../components/budgets/BudgetCategoryList";
import MonthlyBudgetOverview from "../components/budgets/MonthlyBudgetOverview";
import BudgetCategoryForm from "../components/budgets/BudgetCategoryForm";
import { Budget, BudgetCategory } from "../types/budget.types";

// Dummy budget data
const currentBudget: Budget = {
  id: "1",
  name: "April 2025",
  startDate: "2025-04-01",
  endDate: "2025-04-30",
  categories: [
    {
      id: "1",
      name: "Housing",
      allocated: 1500,
      spent: 1500,
      categoryId: "1",
      color: "#4CAF50",
    },
    {
      id: "2",
      name: "Food",
      allocated: 600,
      spent: 450,
      categoryId: "2",
      color: "#2196F3",
    },
    {
      id: "3",
      name: "Transport",
      allocated: 300,
      spent: 275,
      categoryId: "3",
      color: "#FFC107",
    },
    {
      id: "4",
      name: "Entertainment",
      allocated: 400,
      spent: 385,
      categoryId: "4",
      color: "#9C27B0",
    },
    {
      id: "5",
      name: "Utilities",
      allocated: 350,
      spent: 310,
      categoryId: "5",
      color: "#FF5722",
    },
    {
      id: "6",
      name: "Shopping",
      allocated: 250,
      spent: 180,
      categoryId: "6",
      color: "#607D8B",
    },
    {
      id: "7",
      name: "Health",
      allocated: 200,
      spent: 120,
      categoryId: "7",
      color: "#795548",
    },
    {
      id: "8",
      name: "Personal Care",
      allocated: 150,
      spent: 90,
      categoryId: "8",
      color: "#009688",
    },
  ],
  totalAllocated: 3750,
  totalSpent: 3310,
  income: 5000,
};

// Monthly overview data
const monthlyBudgetData = [
  { name: "Jan", income: 4800, expenses: 3900, budget: 4200 },
  { name: "Feb", income: 4800, expenses: 3800, budget: 4200 },
  { name: "Mar", income: 5000, expenses: 3900, budget: 4200 },
  { name: "Apr", income: 5000, expenses: 3310, budget: 3750 },
  { name: "May", income: 0, expenses: 0, budget: 4200 },
  { name: "Jun", income: 0, expenses: 0, budget: 4200 },
];

const Budgets: FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("April 2025");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null
  );

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setShowAddCategory(true);
  };

  const handleCloseForm = () => {
    setShowAddCategory(false);
    setEditingCategory(null);
  };

  return (
    <div>
      <PageHeader
        title="Budgets"
        subtitle="Plan and track your spending"
        actions={
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            >
              <option>April 2025</option>
              <option>March 2025</option>
              <option>February 2025</option>
              <option>January 2025</option>
            </select>
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Category
            </button>
          </div>
        }
      />

      {/* Budget Summary */}
      <div className="mt-6">
        <BudgetSummary budget={currentBudget} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Categories */}
        <div className="lg:col-span-2">
          <BudgetCategoryList
            categories={currentBudget.categories}
            onEditCategory={handleEditCategory}
          />
        </div>

        {/* Monthly Overview */}
        <div className="lg:col-span-1">
          <MonthlyBudgetOverview data={monthlyBudgetData} />
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <BudgetCategoryForm
              onClose={handleCloseForm}
              initialData={editingCategory}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
