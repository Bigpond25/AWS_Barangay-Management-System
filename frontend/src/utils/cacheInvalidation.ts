// ============================================================================
// utils/cacheInvalidation.ts - Smart cache invalidation strategies
// ============================================================================

import { QueryClient } from '@tanstack/react-query';

export class SmartCacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate queries with intelligent batching and throttling
   */
  invalidateQueries(
    patterns: string[][],
    options: {
      refetchType?: 'active' | 'inactive' | 'all';
      throttleMs?: number;
      batch?: boolean;
    } = {}
  ) {
    const { refetchType = 'inactive', throttleMs = 100, batch = true } = options;

    if (batch) {
      // Batch invalidations using Promise.all to reduce re-renders
      const invalidations = patterns.map((pattern) =>
        this.queryClient.invalidateQueries({
          queryKey: pattern,
          refetchType,
        })
      );
      
      return Promise.all(invalidations);
    } else {
      patterns.forEach((pattern, index) => {
        setTimeout(() => {
          this.queryClient.invalidateQueries({
            queryKey: pattern,
            refetchType,
          });
        }, throttleMs * index);
      });
    }
  }

  /**
   * Smart invalidation for CRUD operations
   */
  invalidateForCrud(
    entityType: 'residents' | 'households' | 'documents',
    operation: 'create' | 'update' | 'delete',
    entityId?: string
  ) {
    const patterns: string[][] = [];

    switch (entityType) {
      case 'residents':
        patterns.push(['residents', 'list']);
        if (operation === 'create' || operation === 'delete') {
          patterns.push(['residents', 'statistics']);
        }
        if (entityId && operation === 'delete') {
          this.queryClient.removeQueries({ queryKey: ['residents', 'detail', entityId] });
        }
        break;

      case 'households':
        patterns.push(['households', 'list']);
        if (operation === 'create' || operation === 'delete') {
          patterns.push(['households', 'statistics']);
        }
        if (entityId && operation === 'delete') {
          this.queryClient.removeQueries({ queryKey: ['households', 'detail', entityId] });
        }
        break;

      case 'documents':
        patterns.push(['documents', 'list']);
        patterns.push(['documents', 'statistics']);
        if (entityId && operation === 'delete') {
          this.queryClient.removeQueries({ queryKey: ['documents', 'detail', entityId] });
        }
        break;
    }

    this.invalidateQueries(patterns, { refetchType: 'inactive' });
  }

  /**
   * Optimistic update with rollback capability
   */
  optimisticUpdate<T>(
    queryKey: unknown[],
    updater: (old: T | undefined) => T,
    rollbackData?: T
  ) {
    // Cancel any outgoing refetches
    this.queryClient.cancelQueries({ queryKey });

    // Snapshot previous value
    const previousData = this.queryClient.getQueryData<T>(queryKey);

    // Optimistically update
    this.queryClient.setQueryData<T>(queryKey, updater);

    return {
      rollback: () => {
        this.queryClient.setQueryData(queryKey, rollbackData ?? previousData);
      },
      previousData,
    };
  }

  /**
   * Prefetch related data
   */
  prefetchRelated(
    entityType: 'residents' | 'households' | 'documents',
    entityId: string
  ) {
    switch (entityType) {
      case 'residents':
        // Prefetch household data if resident has household_id
        this.queryClient.prefetchQuery({
          queryKey: ['households', 'byResident', entityId],
          staleTime: 5 * 60 * 1000,
        });
        break;

      case 'households':
        // Prefetch members
        this.queryClient.prefetchQuery({
          queryKey: ['residents', 'byHousehold', entityId],
          staleTime: 5 * 60 * 1000,
        });
        break;

      case 'documents':
        // Prefetch related resident data
        this.queryClient.prefetchQuery({
          queryKey: ['residents', 'detail'],
          staleTime: 10 * 60 * 1000,
        });
        break;
    }
  }

  /**
   * Clean up stale cache entries
   */
  cleanup() {
    this.queryClient.getQueryCache().clear();
    this.queryClient.getMutationCache().clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const queries = this.queryClient.getQueryCache().getAll();
    const mutations = this.queryClient.getMutationCache().getAll();

    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      totalMutations: mutations.length,
      pendingMutations: mutations.filter(m => m.state.status === 'pending').length,
    };
  }
}

// Singleton instance
export const cacheManager = new SmartCacheManager(
  // We'll inject the queryClient instance
  {} as QueryClient
);

// Helper function to initialize with queryClient
export function initializeCacheManager(queryClient: QueryClient) {
  Object.assign(cacheManager, { queryClient });
}
