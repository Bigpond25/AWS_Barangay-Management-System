import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useResidents,
  useDeleteResident,
} from '@/services/residents/useResidents';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { type Resident, type ResidentParams } from '@/services/residents/residents.types';
import { useDebounce } from '@/hooks/useDebounce';
import Breadcrumb from '../_global/Breadcrumb';
import { ResidentStatistics } from './_components/ResidentStatistics';
import { ResidentSearch } from './_components/ResidentSearch';
import { ResidentTable } from './_components/ResidentTable';

const ResidentManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showNotification } = useNotifications();
  
  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResidents, setSelectedResidents] = useState<Set<string>>(new Set());
  
  // Debounced search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Query parameters
  const queryParams: ResidentParams = {
    page: currentPage,
    per_page: 25,
    search: debouncedSearchTerm,
  };
  
  // Queries and mutations
  const {
    data: residentsData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useResidents(queryParams);
  
  const deleteResident = useDeleteResident();
  
  // Client-side filtering for immediate feedback
  const residents = useMemo(() => {
    const data = residentsData?.data || [];
    
    // If user is still typing (searchTerm !== debouncedSearchTerm),
    // provide immediate client-side filtering for better UX
    if (searchTerm && searchTerm !== debouncedSearchTerm && data.length > 0) {
      const term = searchTerm.toLowerCase();
      return data.filter(resident => {
        const fullName = `${resident.first_name} ${resident.last_name}`.toLowerCase();
        const email = resident.email_address?.toLowerCase() || '';
        const mobile = resident.mobile_number || '';
        const address = resident.complete_address?.toLowerCase() || '';
        
        return fullName.includes(term) || 
               email.includes(term) || 
               mobile.includes(term) ||
               address.includes(term);
      });
    }
    
    return data;
  }, [residentsData?.data, searchTerm, debouncedSearchTerm]);
  
    // Animation trigger on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Reset to first page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);
  

  
  // Prepare data with enhanced pagination
  const pagination = residentsData ? {
    current_page: residentsData.current_page,
    last_page: residentsData.last_page,
    per_page: residentsData.per_page,
    total: residentsData.total,
  } : {
    current_page: 1,
    last_page: 1,
    per_page: 25,
    total: 0,
  };
  
  // Handlers with enhanced UX
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, [setSearchTerm]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleAddNew = useCallback(() => {
    navigate('/residents/add');
  }, [navigate]);
  
  const handleView = useCallback((resident: Resident) => {
    navigate(`/residents/view/${resident.id}`);
  }, [navigate]);
  
  const handleEdit = useCallback((resident: Resident) => {
    navigate(`/residents/edit/${resident.id}`);
  }, [navigate]);
  
  const handleDelete = useCallback(async (resident: Resident) => {
    if (window.confirm(t('residents.messages.deleteConfirm'))) {
      try {
        // Optimistic update - user sees immediate feedback
        await deleteResident.mutateAsync(resident.id);
        showNotification({
          type: 'success',
          title: t('residents.messages.deleteSuccess'),
          message: `${resident.first_name} ${resident.last_name} has been deleted`,
          duration: 3000,
          persistent: false
        });
        refetch(); // Refresh the data
      } catch {
        showNotification({
          type: 'error',
          title: t('residents.messages.deleteError'),
          message: t('residents.messages.deleteError'),
          duration: 3000,
          persistent: false
        });
      }
    }
  }, [deleteResident, t, showNotification, refetch]);

  // Enhanced bulk operations (future enhancement)
  // const handleSelectResident = useCallback((residentId: string, selected: boolean) => {
  //   setSelectedResidents(prev => {
  //     const newSelection = new Set(prev);
  //     if (selected) {
  //       newSelection.add(residentId);
  //     } else {
  //       newSelection.delete(residentId);
  //     }
  //     return newSelection;
  //   });
  // }, []);

  // const handleSelectAll = useCallback(() => {
  //   setSelectedResidents(prev => {
  //     if (prev.size === filteredResidents.length) {
  //       return new Set();
  //     } else {
  //       return new Set(filteredResidents.map(r => r.id));
  //     }
  //   });
  // }, [filteredResidents]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedResidents.size === 0) return;
    
    if (window.confirm(`Delete ${selectedResidents.size} selected residents?`)) {
      try {
        // Process deletions in batches of 3 to avoid overwhelming the server
        const residentIds = Array.from(selectedResidents);
        const batchSize = 3;
        
        for (let i = 0; i < residentIds.length; i += batchSize) {
          const batch = residentIds.slice(i, i + batchSize);
          await Promise.all(
            batch.map(id => deleteResident.mutateAsync(id))
          );
          
          // Small delay between batches
          if (i + batchSize < residentIds.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        setSelectedResidents(new Set());
        showNotification({
          type: 'success',
          title: 'Bulk Delete Successful',
          message: `${selectedResidents.size} residents deleted successfully`,
          duration: 4000,
        });
      } catch {
        showNotification({
          type: 'error',
          title: 'Bulk Delete Failed',
          message: 'Some residents could not be deleted. Please try again.',
          duration: 4000,
        });
      }
    }
  }, [selectedResidents, deleteResident, showNotification]);



  
  const handleRefresh = useCallback(() => {
    refetch();
    showNotification({
      type: 'info',
      title: 'Refreshing',
      message: 'Updating resident data...',
      duration: 2000,
    });
  }, [refetch, showNotification]);

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
              {t('residents.title')}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage resident records, household information, and community member data for the barangay
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{error.message}</p>
            <button
              onClick={handleRefresh}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overview with Loading State */}
      <ResidentStatistics isLoaded={isLoaded} />

      {/* Enhanced Residents Section */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '850ms' }}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
            {t('residents.title')}
          </h3>

          {/* Enhanced Search with Real-time Feedback */}
          <ResidentSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddNew={handleAddNew}
            isLoading={isLoading || isFetching}
          />
          
          {/* Search Results Info */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>
                {searchTerm ? (
                  <>
                    Found {residents.length} residents
                    {searchTerm !== debouncedSearchTerm && (
                      <span className="text-blue-600 ml-1">(filtering in real-time...)</span>
                    )}
                  </>
                ) : (
                  `Showing ${residents.length} of ${pagination.total} residents`
                )}
              </span>
            </div>
            
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
        
        {/* Enhanced Table with Optimistic Updates */}
        <ResidentTable
          residents={residents}
          isLoading={isLoading && !residents.length}
          searchTerm={searchTerm}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deleteResident.isPending ? deleteResident.variables : null}
        />
        
        {/* Enhanced Pagination */}
        {residents.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} residents
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1 || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default ResidentManagement;
