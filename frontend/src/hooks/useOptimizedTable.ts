// ============================================================================
// hooks/useOptimizedTable.ts - Optimized table data management
// ============================================================================

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

interface TableItem {
  id: string;
  [key: string]: unknown;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface UseOptimizedTableOptions<T extends TableItem> {
  queryKey: unknown[];
  queryFn: (params: { page: number; per_page: number; search?: string }) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
  searchDebounceMs?: number;
  _enableVirtualization?: boolean; // Prefix with _ to indicate unused
}

export function useOptimizedTable<T extends TableItem>({
  queryKey,
  queryFn,
  pageSize = 25,
  searchDebounceMs = 500,
  _enableVirtualization = false,
}: UseOptimizedTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchTerm);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDebounceMs]);

  // Infinite query for pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...queryKey, globalFilter],
    queryFn: ({ pageParam = 1 }) =>
      queryFn({
        page: pageParam,
        per_page: pageSize,
        search: globalFilter || undefined,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flattened data
  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // Total count
  const totalCount = data?.pages[0]?.total ?? 0;

  // Virtualization helpers (if enabled)
  const getItemSize = useCallback(() => 60, []); // Default row height

  // Load more handler
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Search handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setGlobalFilter('');
  }, []);

  return {
    // Data
    data: flatData,
    totalCount,
    
    // Search
    searchTerm,
    handleSearchChange,
    clearSearch,
    
    // Pagination
    hasNextPage,
    loadMore,
    isFetchingNextPage,
    
    // States
    isLoading,
    isError,
    error,
    
    // Actions
    refetch,
    
    // Virtualization
    getItemSize,
    
    // Metadata
    currentPageCount: data?.pages.length ?? 0,
    isEmpty: flatData.length === 0,
  };
}
