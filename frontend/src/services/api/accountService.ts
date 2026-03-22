import { Account, AccountCreateDTO, AccountUpdateDTO } from '../../types/account.types';
import { apiClient } from './apiClient';

// The accounts backend returns the resource directly (no { success, data } wrapper).
const accountService = {
  getAll: async (): Promise<Account[]> => {
    const response = await apiClient.get<{ data: Account[] }>('/api/accounts');
    return response.data;
  },

  getById: (id: string): Promise<Account> => apiClient.get(`/api/accounts/${id}`),

  create: (data: AccountCreateDTO): Promise<Account> =>
    apiClient.post('/api/accounts', data),

  update: (id: string, data: AccountUpdateDTO): Promise<Account> =>
    apiClient.put(`/api/accounts/${id}`, data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/accounts/${id}`),
};

export default accountService;
