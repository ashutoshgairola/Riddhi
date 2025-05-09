// src/services/api/categoryService.ts
import { TransactionCategory } from '../../types/transaction.types';
import { ApiResponse, apiClient } from './apiClient';

// DTOs for creating and updating categories
export interface CategoryCreateDTO {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  parentId?: string;
}

export interface CategoryUpdateDTO {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  parentId?: string;
}

// Category service for handling API calls
export const categoryService = {
  // Get all categories
  getAll: (): Promise<ApiResponse<TransactionCategory[]>> => {
    return apiClient.get('/api/transactions/categories');
  },

  // Get a single category by ID
  getById: (id: string): Promise<ApiResponse<TransactionCategory>> => {
    return apiClient.get(`/api/transactions/categories/${id}`);
  },

  // Create a new category
  create: (data: CategoryCreateDTO): Promise<ApiResponse<TransactionCategory>> => {
    return apiClient.post('/api/transactions/categories', data);
  },

  // Update an existing category
  update: (data: CategoryUpdateDTO): Promise<ApiResponse<TransactionCategory>> => {
    const { id, ...updateData } = data;
    return apiClient.put(`/api/transactions/categories/${id}`, updateData);
  },

  // Delete a category
  delete: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/api/transactions/categories/${id}`);
  },
};

export default categoryService;
