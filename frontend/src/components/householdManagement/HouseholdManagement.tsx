import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { useDebounce } from '@/hooks/useDebounce';

import {
  useInfiniteHouseholds,
  useDeleteHousehold,
  useHouseholdStatistics,
} from '@/services/households/useHouseholds';

import type { HouseholdParams } from '@/services/households/households.types';

import Breadcrumb from '../_global/Breadcrumb';
import { HouseholdStatistics } from './_components/HouseholdStatistics';
import { HouseholdSearch } from './_components/HouseholdSearch';
import HouseholdTable from './_components/HouseholdTable';

const HouseholdManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  
  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHouseholds, setSelectedHouseholds] = useState<Set<string>>(new Set());
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Query parameters for infinite scroll
  const infiniteParams: Omit<HouseholdParams, 'page'> = {
    per_page: 25,
    search: debouncedSearchTerm,
  };
  
  // Infinite query for households with optimized pagination
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
    error: infiniteError,
    refetch: refetchInfinite
  } = useInfiniteHouseholds(infiniteParams);
  
  // Statistics query
  const { data: statistics, isLoading: statisticsLoading } = useHouseholdStatistics();
  
  // Delete mutation with optimistic updates
  const deleteHousehold = useDeleteHousehold();
  
  // Flatten infinite query data
  const allHouseholds = useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.data) ?? [];
  }, [infiniteData]);
  
  // Enhanced client-side filtering for immediate feedback
  const filteredHouseholds = useMemo(() => {
    if (!searchTerm || searchTerm === debouncedSearchTerm) {
      return allHouseholds;
    }
    
    // Immediate client-side filtering while server search is in progress
    const term = searchTerm.toLowerCase();
    return allHouseholds.filter(household => {
      const householdNumber = household.household_number?.toLowerCase() || '';
      const headName = household.head_resident?.first_name?.toLowerCase() || '';
      const address = household.complete_address?.toLowerCase() || '';
      const barangay = household.barangay?.toLowerCase() || '';
      
      return householdNumber.includes(term) || 
             headName.includes(term) || 
             address.includes(term) ||
             barangay.includes(term);
    });
  }, [allHouseholds, searchTerm, debouncedSearchTerm]);
  
  // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Handlers with enhanced UX
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  const handleAddNew = useCallback(() => {
    navigate('/household/add');
  }, [navigate]);
  
  const handleView = useCallback((id: string) => {
    navigate(`/household/view/${id}`);
  }, [navigate]);
  
  const handleEdit = useCallback((id: string) => {
    navigate(`/household/edit/${id}`);
  }, [navigate]);
  
  const handleDelete = useCallback((id: string, householdNumber: string) => {
    if (window.confirm(t('households.messages.deleteConfirm'))) {
      deleteHousehold.mutate(id, {
        onSuccess: () => {
          showNotification({
            type: 'success',
            title: t('households.messages.deleteSuccess'),
            message: `Household ${householdNumber} has been deleted`,
            duration: 3000,
            persistent: false
          });
        },
        onError: () => {
          showNotification({
            type: 'error',
            title: t('households.messages.deleteError'),
            message: t('households.messages.deleteError'),
            duration: 3000,
            persistent: false
          });
        }
      });
    }
  }, [deleteHousehold, showNotification, t]);

          // Enhanced bulk selection handlers
  const handleHouseholdSelect = useCallback((id: string, selected: boolean) => {
    setSelectedHouseholds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedHouseholds(new Set(filteredHouseholds.map(h => h.id)));
    } else {
      setSelectedHouseholds(new Set());
    }
  }, [filteredHouseholds]);

  // Enhanced bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (selectedHouseholds.size === 0) return;
    
    if (window.confirm(`Delete ${selectedHouseholds.size} selected households?`)) {
      try {
        // Process deletions in batches of 3 to avoid overwhelming the server
        const householdIds = Array.from(selectedHouseholds);
        const batchSize = 3;
        
        for (let i = 0; i < householdIds.length; i += batchSize) {
          const batch = householdIds.slice(i, i + batchSize);
          await Promise.all(
            batch.map(id => deleteHousehold.mutateAsync(id))
          );
          
          // Small delay between batches
          if (i + batchSize < householdIds.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        setSelectedHouseholds(new Set());
        showNotification({
          type: 'success',
          title: 'Bulk Delete Successful',
          message: `${selectedHouseholds.size} households deleted successfully`,
          duration: 4000,
        });
      } catch {
        showNotification({
          type: 'error',
          title: 'Bulk Delete Failed',
          message: 'Some households could not be deleted. Please try again.',
          duration: 4000,
        });
      }
    }
  }, [selectedHouseholds, deleteHousehold, showNotification]);

  const handleRefresh = useCallback(() => {
    refetchInfinite();
    showNotification({
      type: 'info',
      title: 'Refreshing Data',
      message: 'Updating household information...',
      duration: 2000,
    });
  }, [refetchInfinite, showNotification]);

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Performance stats
  const totalLoaded = allHouseholds.length;
  const totalAvailable = infiniteData?.pages[0]?.total ?? 0;
  const isFiltering = searchTerm !== debouncedSearchTerm;

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Enhanced Page Header */}
      <div className={`mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-darktext">
              {t('households.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all household registrations, view member details, and maintain household relationships within the barangay
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {infiniteError && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">
              {infiniteError.message || 'Failed to load households'}
            </p>
            <button
              onClick={handleRefresh}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overview */}
      <HouseholdStatistics 
        statistics={statistics}
        isLoading={statisticsLoading}
        isLoaded={isLoaded} 
      />

      {/* Enhanced Households Section */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '850ms' }}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">
              Households ({filteredHouseholds.length})
            </h3>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Enhanced Search */}
          <HouseholdSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddNew={handleAddNew}
            isLoading={infiniteLoading}
          />
          
          {/* Search Results Info */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>
                {searchTerm ? (
                  <>
                    Found {filteredHouseholds.length} households
                    {isFiltering && (
                      <span className="text-blue-600 ml-1">(filtering in real-time...)</span>
                    )}
                  </>
                ) : (
                  `Showing ${filteredHouseholds.length} of ${totalAvailable} households`
                )}
              </span>
              
              {hasNextPage && !searchTerm && (
                <span className="text-blue-600">
                  {isFetchingNextPage ? 'Loading more...' : `${totalAvailable - totalLoaded} more available`}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-smblue-400 hover:text-smblue-600"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Table with Infinite Scroll */}
        <div className="relative">
          <HouseholdTable
            households={filteredHouseholds}
            isLoading={infiniteLoading && totalLoaded === 0}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deleteHousehold.isPending ? deleteHousehold.variables : undefined}
            currentPage={1}
            onPageChange={() => {}}
            isDeleting={deleteHousehold.isPending}
            selectedHouseholds={selectedHouseholds}
            onHouseholdSelect={handleHouseholdSelect}
            onSelectAll={handleSelectAll}
          />
          
          {/* Infinite Scroll Trigger */}
          {hasNextPage && !searchTerm && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? 'Loading more households...' : 'Load More Households'}
              </button>
            </div>
          )}
          
          {/* End of Results */}
          {!hasNextPage && totalLoaded > 0 && !searchTerm && (
            <div className="p-4 border-t border-gray-200 text-center text-gray-500 text-sm">
              You've reached the end. {totalLoaded} households loaded.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default HouseholdManagement;
