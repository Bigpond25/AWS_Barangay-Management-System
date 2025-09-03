// ============================================================================
// hooks/useEnhancedSearch.ts - Client-side + Server-side search optimization
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchableItem {
  id: string;
  [key: string]: unknown;
}

interface UseEnhancedSearchOptions<T extends SearchableItem> {
  // All items for client-side search
  items: T[];
  
  // Search function for server-side
  serverSearchFn?: (term: string) => Promise<T[]>;
  
  // Fields to search in client-side
  searchFields: (keyof T)[];
  
  // Minimum characters before server search
  serverSearchThreshold?: number;
  
  // Debounce delay in ms
  debounceDelay?: number;
  
  // Max items to show from client search
  clientSearchLimit?: number;
  
  // Whether to use server search when available
  preferServerSearch?: boolean;
}

export function useEnhancedSearch<T extends SearchableItem>({
  items,
  serverSearchFn,
  searchFields,
  serverSearchThreshold = 3,
  debounceDelay = 300,
  clientSearchLimit = 100,
  preferServerSearch = false,
}: UseEnhancedSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  // Determine search strategy
  const shouldUseServerSearch = useMemo(() => {
    return (
      serverSearchFn &&
      debouncedSearchTerm.length >= serverSearchThreshold &&
      preferServerSearch
    );
  }, [serverSearchFn, debouncedSearchTerm.length, serverSearchThreshold, preferServerSearch]);

  // Server search query
  const {
    data: serverResults,
    isLoading: serverLoading,
    error: serverError,
  } = useQuery({
    queryKey: ['search', 'server', debouncedSearchTerm],
    queryFn: () => serverSearchFn!(debouncedSearchTerm),
    enabled: shouldUseServerSearch,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Client-side search
  const clientResults = useMemo(() => {
    if (shouldUseServerSearch || !debouncedSearchTerm) {
      return items;
    }

    const term = debouncedSearchTerm.toLowerCase();
    const filtered = items.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (typeof value === 'number') {
          return value.toString().includes(term);
        }
        return false;
      });
    });

    return filtered.slice(0, clientSearchLimit);
  }, [items, debouncedSearchTerm, searchFields, shouldUseServerSearch, clientSearchLimit]);

  // Final results
  const results = shouldUseServerSearch ? serverResults || [] : clientResults;
  const isLoading = shouldUseServerSearch ? serverLoading : false;
  const error = shouldUseServerSearch ? serverError : null;

  // Highlight function for search terms
  const highlightMatch = useCallback((text: string, highlight: string) => {
    if (!highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? `<mark key=${index}>${part}</mark>` 
        : part
    ).join('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    results,
    isLoading,
    error,
    isServerSearch: shouldUseServerSearch,
    highlightMatch,
    resultsCount: results.length,
    hasMore: shouldUseServerSearch ? false : items.length > clientSearchLimit,
  };
}

// Specialized hook for residents
export function useResidentSearch() {
  // This would be implemented when you want to add client-side search
  // Return enhanced search with resident-specific configurations
}

// Usage example in your components:
/*
const {
  searchTerm,
  setSearchTerm,
  results,
  isLoading,
  highlightMatch,
} = useEnhancedSearch({
  items: residents,
  searchFields: ['first_name', 'last_name', 'email', 'phone'],
  serverSearchFn: residentsService.searchResidents,
  preferServerSearch: false, // Use client-side first for better UX
});
*/
