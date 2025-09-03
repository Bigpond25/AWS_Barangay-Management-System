import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { useDebounce } from '@/hooks/useDebounce';

import {
  useInfiniteDocuments,
} from '@/services/documents/useDocuments';

import type { Document, DocumentParams } from '@/services/documents/documents.types';

import Breadcrumb from '../_global/Breadcrumb';
import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { DocumentTypeBadge } from '../__shared/DocumentTypeBadge';
import { formatDate } from '@/utils/dateUtils';

import { 
  FiEye, 
  FiFileText, 
  FiCalendar, 
  FiMoreVertical,
  FiRefreshCw,
  FiEdit3
} from 'react-icons/fi';

interface DocumentQueueProps {
  onNavigate?: (page: string) => void;
}

const DocumentQueue: React.FC<DocumentQueueProps> = ({ onNavigate: _onNavigate }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  // Local state
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Query parameters for infinite scroll
  const infiniteParams: Omit<DocumentParams, 'page'> = {
    per_page: 25,
    search: debouncedSearchTerm,
    status: statusFilter ? (statusFilter as "PENDING" | "PROCESSING" | "APPROVED" | "RELEASED" | "REJECTED" | "CANCELLED") : undefined,
  };
  
  // Infinite query for documents with optimized pagination
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
    error: infiniteError,
    refetch: refetchInfinite
  } = useInfiniteDocuments(infiniteParams);
  
  // Flatten infinite query data
  const allDocuments = useMemo(() => {
    return infiniteData?.pages.flatMap(page => page.data) ?? [];
  }, [infiniteData]);
  
  // Status counts are calculated from local data
  const _statisticsData = useMemo(() => {
    return { totalDocuments: allDocuments.length };
  }, [allDocuments]);
  
  // Enhanced client-side filtering for immediate feedback
  const filteredDocuments = useMemo(() => {
    if (!searchTerm || searchTerm === debouncedSearchTerm) {
      return allDocuments;
    }
    
    // Immediate client-side filtering while server search is in progress
    const term = searchTerm.toLowerCase();
    return allDocuments.filter(document => {
      const applicantName = document.applicant_name?.toLowerCase() || '';
      const documentNumber = document.document_number?.toLowerCase() || '';
      const type = document.type?.toLowerCase() || '';
      const purpose = document.purpose?.toLowerCase() || '';
      
      return applicantName.includes(term) || 
             documentNumber.includes(term) || 
             type.includes(term) ||
             purpose.includes(term);
    });
  }, [allDocuments, searchTerm, debouncedSearchTerm]);
  
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
  
  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);
  
  const handleView = useCallback((document: Document) => {
    navigate(`/documents/view/${document.id}`);
  }, [navigate]);
  
  const handleEdit = useCallback((document: Document) => {
    navigate(`/documents/edit/${document.id}`);
  }, [navigate]);
  
  const _handleStatusUpdate = useCallback(async (documentId: string, newStatus: string) => {
    try {
      // This would normally use a mutation, for now just show notification
      showNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Document status updated to ${newStatus}`,
        duration: 3000,
        persistent: false
      });
    } catch {
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update document status',
        duration: 3000,
        persistent: false
      });
    }
  }, [showNotification]);

  const handleRefresh = useCallback(() => {
    refetchInfinite();
    showNotification({
      type: 'info',
      title: 'Refreshing Data',
      message: 'Updating document queue...',
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
  const totalLoaded = allDocuments.length;
  const totalAvailable = infiniteData?.pages[0]?.total ?? 0;
  const isFiltering = searchTerm !== debouncedSearchTerm;

  // Status counts for dashboard
  const statusCounts = useMemo(() => {
    const counts = {
      PENDING: 0,
      PROCESSING: 0,
      APPROVED: 0,
      RELEASED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    
    allDocuments.forEach(doc => {
      if (Object.prototype.hasOwnProperty.call(counts, doc.status)) {
        counts[doc.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [allDocuments]);

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
              Document Queue
            </h1>
          </div>
          
          {/* Performance Dashboard */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  infiniteLoading || isFetchingNextPage ? 'bg-blue-400 animate-pulse' : 
                  isFiltering ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                }`} />
                <span className="text-gray-600">
                  {infiniteLoading ? 'Loading...' : 
                   isFetchingNextPage ? 'Loading more...' :
                   isFiltering ? 'Filtering...' : 'Ready'}
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
              <span className="text-gray-600">
                Loaded: {totalLoaded} / {totalAvailable}
              </span>
            </div>
            
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
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
              {infiniteError.message || 'Failed to load documents'}
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

      {/* Status Dashboard */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '300ms' }}>
        <h3 className="text-lg font-semibold text-darktext mb-4 border-l-4 border-smblue-400 pl-4">
          Document Status Overview
        </h3>
        
        <div className="grid grid-cols-6 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                statusFilter === status 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handleStatusFilter(statusFilter === status ? '' : status)}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-darktext">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search and Filters */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '500ms' }}>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by applicant name, document number, type, or purpose..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Search Results Info */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              {searchTerm || statusFilter ? (
                <>
                  Found {filteredDocuments.length} documents
                  {isFiltering && (
                    <span className="text-blue-600 ml-1">(filtering in real-time...)</span>
                  )}
                </>
              ) : (
                `Showing ${filteredDocuments.length} of ${totalAvailable} documents`
              )}
            </span>
            
            {hasNextPage && !searchTerm && !statusFilter && (
              <span className="text-blue-600">
                {isFetchingNextPage ? 'Loading more...' : `${totalAvailable - totalLoaded} more available`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Document List */}
      <section className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '700ms' }}>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-darktext border-l-4 border-smblue-400 pl-4">
            Documents ({filteredDocuments.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {infiniteLoading && totalLoaded === 0 ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <DocumentTypeBadge type={document.type} />
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        document.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        document.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        document.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        document.status === 'RELEASED' ? 'bg-purple-100 text-purple-800' :
                        document.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {document.status}
                      </span>
                      {document.priority === 'URGENT' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          URGENT
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-darktext mb-1">
                      {document.applicant_name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {document.purpose}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <FiCalendar className="w-3 h-3 mr-1" />
                        {formatDate(document.submitted_at)}
                      </span>
                      {document.document_number && (
                        <span>#{document.document_number}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(document)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEdit(document)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit Document"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="More Actions"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Infinite Scroll Trigger */}
        {hasNextPage && !searchTerm && !statusFilter && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? 'Loading more documents...' : 'Load More Documents'}
            </button>
          </div>
        )}
        
        {/* End of Results */}
        {!hasNextPage && totalLoaded > 0 && !searchTerm && !statusFilter && (
          <div className="p-4 border-t border-gray-200 text-center text-gray-500 text-sm">
            You've reached the end. {totalLoaded} documents loaded.
          </div>
        )}
      </section>
    </main>
  );
};

export default DocumentQueue;
