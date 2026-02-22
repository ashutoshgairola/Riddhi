// src/services/api/searchService.ts
import apiClient from './apiClient';

export type SearchResultType = 'transaction' | 'budget' | 'goal' | 'account' | 'investment';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  amount?: number;
  url: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}

class SearchService {
  async search(query: string): Promise<SearchResponse> {
    return apiClient.get<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

export default new SearchService();
