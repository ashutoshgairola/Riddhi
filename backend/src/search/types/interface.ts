// Search domain types
export type SearchResultType = 'transaction' | 'budget' | 'goal' | 'account' | 'investment';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  amount?: number;
  url: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}
