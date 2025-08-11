// ============================================================================
// components/agenda/AgendaDetailPage.tsx
// Detailed view and editing interface for individual agendas
// ============================================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit, 
  Save, 
  X, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import Breadcrumb from '@/components/_global/Breadcrumb';
import { useAgenda, useUpdateAgenda } from '@/services/agenda/useAgenda';
import { useNotifications } from '@/components/_global/NotificationSystem';
import { MeetingMinutes } from './MeetingMinutes';
import type { AgendaFormData } from '@/services/agenda/agenda.types';

const AgendaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AgendaFormData>>({});

  // Fetch agenda data
  const { 
    data: agenda, 
    isLoading, 
    error,
    refetch 
  } = useAgenda(id!);

  const updateAgendaMutation = useUpdateAgenda();

  const handleEdit = () => {
    if (agenda) {
      setEditForm({
        title: agenda.title,
        description: agenda.description,
        date: agenda.date,
        time: agenda.time,
        location: agenda.location,
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!agenda || !id) return;

    try {
      await updateAgendaMutation.mutateAsync({
        id,
        data: editForm as AgendaFormData
      });
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Agenda updated successfully.'
      });
      
      setIsEditing(false);
      refetch();
    } catch {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update agenda. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: timeString || date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Calendar className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading agenda details...</p>
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agenda Not Found</h2>
          <p className="text-gray-600 mb-4">The agenda you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/agenda-management')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Agenda Management
          </button>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(agenda.date, agenda.time);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Breadcrumb />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-2xl font-bold text-gray-900 border-0 border-b-2 border-blue-500 bg-transparent focus:outline-none focus:ring-0 w-full"
                    placeholder="Agenda title"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{agenda.title}</h1>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateAgendaMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {updateAgendaMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Agenda
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                {getStatusIcon(agenda.status)}
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(agenda.status)}`}>
                  {agenda.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.date || agenda.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{date}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    {isEditing ? (
                      <input
                        type="time"
                        value={editForm.time || agenda.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <p className="font-medium text-gray-900">{time}</p>
                    )}
                  </div>
                </div>

                {(agenda.location || isEditing) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location || agenda.location || ''}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                          placeholder="Enter location"
                        />
                      ) : (
                        <p className="font-medium text-gray-900">{agenda.location}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </h3>
              {isEditing ? (
                <textarea
                  value={editForm.description || agenda.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter agenda description..."
                />
              ) : (
                <div className="prose max-w-none">
                  {agenda.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{agenda.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided.</p>
                  )}
                </div>
              )}
            </div>

            {/* Meeting Minutes (if completed) */}
            {agenda.status === 'COMPLETED' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <MeetingMinutes 
                  agendaId={agenda.id}
                  agendaTitle={agenda.title}
                  isReadOnly={false}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-4 h-4" />
                  Manage Attendees
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="w-4 h-4" />
                  Add Documents
                </button>
                {agenda.status === 'SCHEDULED' && (
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Mark as Started
                  </button>
                )}
                {agenda.status === 'IN_PROGRESS' && (
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>

            {/* Agenda Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(agenda.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(agenda.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">{agenda.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaDetailPage;
