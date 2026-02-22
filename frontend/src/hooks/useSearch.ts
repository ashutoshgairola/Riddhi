// src/hooks/useSearch.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import searchService, { SearchResult } from '../services/api/searchService';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  clear: () => void;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    latestQueryRef.current = trimmed;

    if (trimmed.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      const issued = trimmed;
      try {
        const response = await searchService.search(issued);
        // Ignore stale responses
        if (latestQueryRef.current !== issued) return;
        setResults(response.results);
      } catch {
        if (latestQueryRef.current !== issued) return;
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        if (latestQueryRef.current === issued) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { query, setQuery, results, loading, error, clear };
}
