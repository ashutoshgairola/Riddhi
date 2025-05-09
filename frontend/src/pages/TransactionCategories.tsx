// src/pages/TransactionCategories.tsx
import { FC, useCallback, useState } from 'react';

import { Edit2, Plus, Trash2 } from 'lucide-react';

import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import AddTransactionCategoryForm from '../components/transactions/AddTransactionCategoryForm';
import { useTransactionCategories } from '../hooks/useTransactionCategories';
import { CategoryCreateDTO, CategoryUpdateDTO } from '../services/api/categoryService';
import { TransactionCategory } from '../types/transaction.types';

const TransactionCategories: FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);

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
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          'Are you sure you want to delete this category? This action cannot be undone.',
        )
      ) {
        await deleteCategory(id);
      }
    },
    [deleteCategory],
  );

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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            onClick={handleAddCategory}
          >
            <Plus size={18} />
            Add Category
          </button>
        }
      />

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
          Error loading categories: {error.message}
        </div>
      )}

      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="p-6">
          {categorizedItems.mainCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No categories found</p>
              <p className="mt-2 text-sm">Click "Add Category" to create your first category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorizedItems.mainCategories.map((category) => (
                <div key={category.id}>
                  {/* Main category */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#999' }}
                      >
                        <span className="text-white text-sm">
                          {category.icon
                            ? category.icon.charAt(0).toUpperCase()
                            : category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        onClick={() => handleEditCategory(category)}
                        title="Edit category"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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
                            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: subcategory.color || '#999' }}
                              >
                                <span className="text-white text-xs">
                                  {subcategory.icon
                                    ? subcategory.icon.charAt(0).toUpperCase()
                                    : subcategory.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">{subcategory.name}</h4>
                                {subcategory.description && (
                                  <p className="text-xs text-gray-500">{subcategory.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white"
                                onClick={() => handleEditCategory(subcategory)}
                                title="Edit subcategory"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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
    </div>
  );
};

export default TransactionCategories;
