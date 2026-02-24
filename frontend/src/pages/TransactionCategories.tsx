// src/pages/TransactionCategories.tsx
import { FC, useCallback, useState } from 'react';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import wallet03 from '../assets/empty-states/Wallet 03.svg';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import AddTransactionCategoryForm from '../components/transactions/AddTransactionCategoryForm';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { CategoryCreateDTO, CategoryUpdateDTO } from '../services/api/categoryService';
import { TransactionCategory } from '../types/transaction.types';
import { getIconComponent } from '../utils/iconUtils';

const TransactionCategories: FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { categories, loading, error, createCategory, updateCategory, deleteCategory } =
    useTransactionCategories();

  // Handle adding a new category
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setIsAddModalOpen(true);
  }, []);

  // Handle editing a category
  const handleEditCategory = useCallback((category: TransactionCategory) => {
    setEditingCategory(category);
    setIsAddModalOpen(true);
  }, []);

  // Handle deleting a category
  const handleDeleteCategory = useCallback((id: string) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete action
  const confirmDelete = useCallback(async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, deleteCategory]);

  // Handle category form submission
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

  // Group categories by parent/subcategory
  const categorizedItems = categories.reduce<{
    mainCategories: TransactionCategory[];
    subcategories: Record<string, TransactionCategory[]>;
  }>(
    (acc, category) => {
      if (!category.parentId) {
        acc.mainCategories.push(category);
      } else {
        if (!acc.subcategories[category.parentId]) {
          acc.subcategories[category.parentId] = [];
        }
        acc.subcategories[category.parentId].push(category);
      }
      return acc;
    },
    { mainCategories: [], subcategories: {} },
  );

  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Transaction Categories"
        subtitle="Manage categories for your transactions"
        actions={
          <button
            className="px-4 py-2 min-h-[44px] bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all select-none flex items-center gap-2 text-sm"
            onClick={handleAddCategory}
          >
            <Plus size={18} />
            Add Category
          </button>
        }
      />

      {error && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-400 rounded-md">
          Error loading categories: {error.message}
        </div>
      )}

      <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          {categorizedItems.mainCategories.length === 0 ? (
            <EmptyState
              image={wallet03}
              title="No categories found"
              description='Click "Add Category" to create your first transaction category.'
            />
          ) : (
            <div className="space-y-4">
              {categorizedItems.mainCategories.map((category) => (
                <div key={category.id}>
                  {/* Main category */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#999' }}
                      >
                        {category.icon ? (
                          (() => {
                            const IconComponent = getIconComponent(category.icon);
                            return <IconComponent size={16} className="text-white" />;
                          })()
                        ) : (
                          <span className="text-white text-sm">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-gray-100">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleEditCategory(category)}
                        title="Edit category"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Delete category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {categorizedItems.subcategories[category.id] &&
                    categorizedItems.subcategories[category.id].length > 0 && (
                      <div className="ml-12 mt-2 space-y-2">
                        {categorizedItems.subcategories[category.id].map((subcategory) => (
                          <div
                            key={subcategory.id}
                            className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: subcategory.color || '#999' }}
                              >
                                {subcategory.icon ? (
                                  (() => {
                                    const IconComponent = getIconComponent(subcategory.icon);
                                    return <IconComponent size={12} className="text-white" />;
                                  })()
                                ) : (
                                  <span className="text-white text-xs">
                                    {subcategory.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium dark:text-gray-200">
                                  {subcategory.name}
                                </h4>
                                {subcategory.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {subcategory.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-white dark:hover:bg-gray-600"
                                onClick={() => handleEditCategory(subcategory)}
                                title="Edit subcategory"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteCategory(subcategory.id)}
                                title="Delete subcategory"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <AddTransactionCategoryForm
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleCategorySubmit}
            initialData={editingCategory}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TransactionCategories;
