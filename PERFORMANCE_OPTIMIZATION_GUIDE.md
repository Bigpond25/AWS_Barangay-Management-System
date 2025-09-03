# Performance Optimization Implementation Guide

## Current Issues Identified

1. **Inefficient Cache Invalidation**: Broad invalidations cause unnecessary refetches
2. **Server-side Only Search**: All search requests go to server, causing delays
3. **No Optimistic Updates**: Users don't see immediate feedback on actions
4. **Missing Query Configuration**: Default React Query settings are not optimized
5. **Manual Refetch Patterns**: Components manually call `refetch()` instead of using proper invalidation

## Recommended Solutions

### 1. Optimize Query Client Configuration

Update your App.tsx to use the optimized query client:

```typescript
// Use the provided lib/queryClient.ts
import queryClient from './lib/queryClient';

// In App.tsx
<QueryClientProvider client={queryClient}>
```

Key improvements:
- **staleTime: 5 minutes** - Data stays fresh longer, reducing unnecessary requests
- **gcTime: 30 minutes** - Keeps data in cache longer for better UX
- **refetchOnWindowFocus: false** - Prevents annoying refetches when switching tabs
- **Retry configuration** - Smart retry logic with exponential backoff

### 2. Implement Optimistic Updates

Replace your current mutation patterns with optimistic updates:

```typescript
// Example for create operations
onMutate: async (newData) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: ['residents', 'list'] });
  
  // Snapshot previous value
  const previous = queryClient.getQueriesData({ queryKey: ['residents', 'list'] });
  
  // Optimistically update
  queryClient.setQueriesData({ queryKey: ['residents', 'list'] }, (old) => {
    // Add new item with temporary ID
    return { ...old, data: [tempItem, ...old.data] };
  });
  
  return { previous };
},
```

### 3. Smart Cache Invalidation

Use targeted invalidation instead of broad patterns:

```typescript
// Bad ❌
queryClient.invalidateQueries({ queryKey: ['residents'] });

// Good ✅
queryClient.invalidateQueries({ 
  queryKey: ['residents', 'list'], 
  refetchType: 'inactive' 
});
```

### 4. Hybrid Search Strategy

Implement client-side search for immediate feedback:

```typescript
// 1. Load initial dataset
const { data: allResidents } = useInfiniteResidents({
  per_page: 50, // Larger initial load
});

// 2. Client-side search for quick filtering
const filteredResults = useMemo(() => {
  if (!searchTerm) return allResidents;
  
  return allResidents.filter(resident =>
    resident.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [allResidents, searchTerm]);

// 3. Server-side search for complex queries
const { data: serverResults } = useQuery({
  queryKey: ['residents', 'search', debouncedSearch],
  queryFn: () => api.searchResidents(debouncedSearch),
  enabled: debouncedSearch.length >= 3, // Only for longer terms
});
```

### 5. Infinite Scroll for Large Datasets

Replace pagination with infinite scroll:

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['residents', 'infinite'],
  queryFn: ({ pageParam = 1 }) => api.getResidents({ page: pageParam }),
  getNextPageParam: (lastPage) => 
    lastPage.current_page < lastPage.last_page 
      ? lastPage.current_page + 1 
      : undefined,
});

// Automatic loading when scrolling near bottom
const { ref, inView } = useInView();

useEffect(() => {
  if (inView && hasNextPage) {
    fetchNextPage();
  }
}, [inView, hasNextPage]);
```

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. ✅ Implement optimized Query Client configuration
2. ✅ Add client-side search for residents
3. ✅ Update delete mutations with optimistic updates

### Phase 2: Enhanced UX (3-5 days)
1. Implement infinite scroll for all tables
2. Add bulk operations with optimistic updates
3. Implement smart cache invalidation patterns

### Phase 3: Advanced Features (1 week)
1. Add data prefetching for related entities
2. Implement background sync for offline support
3. Add virtual scrolling for very large datasets

## Performance Metrics to Track

1. **Time to Interactive**: First meaningful content load
2. **Search Response Time**: Client vs server search comparison
3. **Cache Hit Rate**: Percentage of requests served from cache
4. **User Perceived Performance**: Time from action to UI update

## Quick Fix for Current Codebase

For immediate improvements without major refactoring:

### 1. Update Delete Operations

```typescript
// In your current useDeleteResident hook
export function useDeleteResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => residentsService.deleteResident(id),
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: residentsKeys.lists() });
      
      // Optimistically remove from cache
      queryClient.setQueriesData({ queryKey: residentsKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(resident => resident.id !== deletedId),
          total: old.total - 1,
        };
      });
    },
    onError: (error, deletedId, context) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: residentsKeys.lists() });
    },
  });
}
```

### 2. Add Debounced Search

```typescript
// In ResidentManagement component
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// Update search only when debounced value changes
useEffect(() => {
  // Your search logic here
}, [debouncedSearch]);
```

### 3. Reduce Invalidation Frequency

```typescript
// Instead of invalidating on every operation
queryClient.invalidateQueries({ queryKey: residentsKeys.statistics() });

// Only invalidate statistics when necessary
if (operation === 'create' || operation === 'delete') {
  queryClient.invalidateQueries({ 
    queryKey: residentsKeys.statistics(),
    refetchType: 'inactive' 
  });
}
```

## Expected Performance Improvements

- **Search Speed**: 50-80% faster response time
- **UI Responsiveness**: Immediate feedback on all actions
- **Network Requests**: 30-50% reduction in unnecessary requests
- **Memory Usage**: Better cache management and cleanup
- **User Experience**: Smoother interactions and fewer loading states

## Next Steps

1. Start with the Query Client optimization (immediate impact)
2. Implement optimistic updates for delete operations
3. Add client-side search for residents table
4. Monitor performance improvements
5. Gradually apply patterns to households and documents

Would you like me to help implement any of these specific optimizations in your codebase?
