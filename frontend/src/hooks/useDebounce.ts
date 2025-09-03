// ============================================================================
// hooks/useDebounce.ts - Custom debounce hook
// ============================================================================

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced search functionality
 * @param initialValue - Initial search term
 * @param onSearch - Callback function when search term changes (debounced)
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with current search term and setter function
 */
export function useDebouncedSearch(
  initialValue: string = '',
  onSearch: (searchTerm: string) => void,
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm
  };
}