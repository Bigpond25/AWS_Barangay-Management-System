// ============================================================================
// lib/queryClient.ts - Optimized React Query configuration
// ============================================================================

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache data for 30 minutes before garbage collection
      gcTime: 30 * 60 * 1000,
      
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      
      // Retry failed requests 2 times
      retry: 2,
      
      // Use exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode online only
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Network mode online only
      networkMode: 'online',
    },
  },
});

// Export singleton instance
export default queryClient;
