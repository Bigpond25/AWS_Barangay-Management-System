// ============================================================================
// components/agenda/AgendaManagementPage.tsx
// Comprehensive agenda management interface
// ============================================================================

import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

import Breadcrumb from '@/components/_global/Breadcrumb';
import { useAgendas, useCreateAgenda, useDeleteAgenda } from '@/services/agenda/useAgenda';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { AgendaCalendar } from './AgendaCalendar';
import type { Agenda, AgendaFormData } from '@/services/agenda/agenda.types';
import AddAgenda from '../dashboard/AddAgenda';
import { useNavigate } from 'react-router-dom';

type AgendaView = 'calendar' | 'list' | 'upcoming';

const AgendaManagementPage: React.FC = () => {
  const { showNotification } = useNotifications();
  const [currentView, setCurrentView] = useState<AgendaView>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch agendas data
  const { 
    data: agendasResponse, 
    isLoading: agendasLoading,
    refetch: refetchAgendas 
  } = useAgendas();

  const deleteAgendaMutation = useDeleteAgenda();

  // Extract agenda array from paginated response
  const agendas = Array.isArray(agendasResponse) ? agendasResponse : agendasResponse?.data || [];

  // Filter agendas based on search and status
  const filteredAgendas = agendas.filter((agenda: Agenda) => {
    const matchesSearch = agenda.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (agenda.description && agenda.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || agenda.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get upcoming agendas (next 7 days)
  const upcomingAgendas = agendas.filter((agenda: Agenda) => {
    const agendaDate = new Date(agenda.date);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return agendaDate >= now && agendaDate <= nextWeek;
  });

  const handleDeleteAgenda = async (agenda: Agenda) => {
    try {
      await deleteAgendaMutation.mutateAsync(agenda.id);
      showNotification({
        type: 'success',
        title: 'Success',
        message: `Agenda "${agenda.title}" has been deleted successfully.`
      });
      setShowDeleteModal(false);
      setSelectedAgenda(null);
      refetchAgendas();
    } catch {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete agenda. Please try again.'
      });
    }
  };

  const formatDate = (date: string, time?: string) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAgendaStats = () => {
    const totalAgendas = agendas.length;
    const scheduledCount = agendas.filter((a: Agenda) => a.status === 'SCHEDULED').length;
    const completedCount = agendas.filter((a: Agenda) => a.status === 'COMPLETED').length;
    const upcomingCount = upcomingAgendas.length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agendas</p>
              <p className="text-2xl font-bold text-gray-900">{totalAgendas}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{scheduledCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
    );
  };

  const renderViewTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setCurrentView('list')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            currentView === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          All Agendas
        </button>
        <button
          onClick={() => setCurrentView('upcoming')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            currentView === 'upcoming'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            currentView === 'calendar'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Calendar View
        </button>
      </nav>
    </div>
  );


    const createAgendaMutation = useCreateAgenda();
    const { refetch } = useAgendas();

    const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);


    const handleSaveAgenda = async (newAgendaData: AgendaFormData): Promise<void> => {
      try {
        await createAgendaMutation.mutateAsync(newAgendaData);
        // Refetch calendar events after creating a new agenda
        refetch();
        console.log('Agenda saved successfully:', newAgendaData);
      } catch (error) {
        console.error('Error saving agenda:', error);
        // Show error notification to user
        alert('Failed to create agenda. Please try again.');
        throw error; // Re-throw so AddAgenda component can handle it
      }
    };

  const renderSearchAndFilters = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search agendas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-600" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <button onClick={() => setShowAddAgendaModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        New Agendad
      </button>
      <AddAgenda isOpen={showAddAgendaModal} onClose={() => setShowAddAgendaModal(false)} onSave={handleSaveAgenda} />
    </div>
  );

  const navigate = useNavigate();

  const renderAgendaList = (agendasToRender: Agenda[]) => (
    <div className="space-y-4">
      {agendasToRender.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No agendas found matching your criteria.
        </div>
      ) : (
        agendasToRender.map((agenda) => (
          <div key={agenda.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{agenda.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agenda.status)}`}>
                    {agenda.status}
                  </span>
                </div>
                
                {agenda.description && (
                  <p className="text-gray-600 mb-3">{agenda.description}</p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(agenda.date, agenda.time)}</span>
                  </div>
                  {agenda.location && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{agenda.location}</span>
                    </div>
                  )}
                  {agenda.creator && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Created by: {agenda?.creator?.full_name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => navigate(`/agenda/${agenda.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedAgenda(agenda);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCalendarView = () => (
    <AgendaCalendar
      agendas={agendas}
      onAgendaClick={(agenda) => {
        // Navigate to agenda detail page
        console.log('Navigate to agenda:', agenda.id);
      }}
      onDateClick={(date) => {
        // Open new agenda modal for selected date
        console.log('Create agenda for date:', date);
      }}
      onNewAgenda={() => {
        // Open new agenda modal
        console.log('Create new agenda');
      }}
    />
  );

  const renderDeleteModal = () => {
    if (!showDeleteModal || !selectedAgenda) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Agenda</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{selectedAgenda.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedAgenda(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteAgenda(selectedAgenda)}
              disabled={deleteAgendaMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteAgendaMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Breadcrumb />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Agenda Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor all barangay meetings and events
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics */}
        {renderAgendaStats()}

        {/* View Tabs */}
        {renderViewTabs()}

        {/* Search and Filters */}
        {renderSearchAndFilters()}

        {/* Content based on current view */}
        {agendasLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading agendas...</p>
          </div>
        ) : (
          <>
            {currentView === 'list' && renderAgendaList(filteredAgendas)}
            {currentView === 'upcoming' && renderAgendaList(upcomingAgendas)}
            {currentView === 'calendar' && renderCalendarView()}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {renderDeleteModal()}
    </div>
  );
};

export default AgendaManagementPage;
