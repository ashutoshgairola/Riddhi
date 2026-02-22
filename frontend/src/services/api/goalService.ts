// src/services/api/goalService.ts
import { CreateGoalRequest, GetGoalsQuery, Goal, UpdateGoalRequest } from '../../types/goal.types';
import apiClient from './apiClient';

interface GoalsListResponse {
  data: Goal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class GoalService {
  private baseUrl = '/api/goals';

  public async getAll(query?: GetGoalsQuery): Promise<GoalsListResponse> {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    return apiClient.get<GoalsListResponse>(url);
  }

  public async getById(id: string): Promise<Goal> {
    return apiClient.get<Goal>(`${this.baseUrl}/${id}`);
  }

  public async create(data: CreateGoalRequest): Promise<Goal> {
    return apiClient.post<Goal, CreateGoalRequest>(this.baseUrl, data);
  }

  public async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    return apiClient.put<Goal, UpdateGoalRequest>(`${this.baseUrl}/${id}`, data);
  }

  public async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  public async complete(id: string): Promise<Goal> {
    return apiClient.post<Goal, Record<string, never>>(`${this.baseUrl}/${id}/complete`, {});
  }

  public async pause(id: string): Promise<Goal> {
    return apiClient.post<Goal, Record<string, never>>(`${this.baseUrl}/${id}/pause`, {});
  }

  public async resume(id: string): Promise<Goal> {
    return apiClient.post<Goal, Record<string, never>>(`${this.baseUrl}/${id}/resume`, {});
  }
}

const goalService = new GoalService();
export default goalService;
