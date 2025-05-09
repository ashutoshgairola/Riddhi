// src/services/api/budgetService.ts
import {
  Budget,
  BudgetCategory,
  BudgetCreateDTO,
  BudgetFilters,
  BudgetUpdateDTO,
} from '../../types/budget.types';
import { ApiResponse, PaginatedResponse, apiClient } from './apiClient';

// Budget service for handling API calls
const budgetService = {
  // Get current active budget
  getCurrentBudget: (): Promise<ApiResponse<Budget>> => {
    return apiClient.get('/api/budgets/current');
  },

  // Get budget history with optional filters
  getBudgetHistory: (filters?: BudgetFilters): Promise<PaginatedResponse<Budget>> => {
    // Build query string from filters
    const queryParams = new URLSearchParams();

    if (filters?.startDate) {
      queryParams.append('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      queryParams.append('endDate', filters.endDate);
    }

    if (filters?.page) {
      queryParams.append('page', filters.page.toString());
    }

    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    const queryString = queryParams.toString();
    return apiClient.get(`/api/budgets${queryString ? `?${queryString}` : ''}`);
  },

  // Get budget by ID
  getBudgetById: (id: string): Promise<ApiResponse<Budget>> => {
    return apiClient.get(`/api/budgets/${id}`);
  },

  // Create a new budget
  createBudget: (data: BudgetCreateDTO): Promise<ApiResponse<Budget>> => {
    return apiClient.post('/api/budgets', data);
  },

  // Update an existing budget
  updateBudget: (id: string, data: BudgetUpdateDTO): Promise<ApiResponse<Budget>> => {
    return apiClient.put(`/api/budgets/${id}`, data);
  },

  // Delete a budget
  deleteBudget: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/api/budgets/${id}`);
  },

  // Create a new budget category
  createBudgetCategory: (
    budgetId: string,
    data: Omit<BudgetCategory, 'id' | 'spent'>,
  ): Promise<ApiResponse<BudgetCategory>> => {
    return apiClient.post(`/api/budgets/${budgetId}/categories`, data);
  },

  // Update a budget category
  updateBudgetCategory: (
    budgetId: string,
    categoryId: string,
    data: Partial<BudgetCategory>,
  ): Promise<ApiResponse<BudgetCategory>> => {
    return apiClient.put(`/api/budgets/${budgetId}/categories/${categoryId}`, data);
  },

  // Delete a budget category
  deleteBudgetCategory: (budgetId: string, categoryId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/api/budgets/${budgetId}/categories/${categoryId}`);
  },
};

export default budgetService;
