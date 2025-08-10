// ============================================================================
// components/helpDesk/HelpDeskManagement/components/ActiveTickets.tsx
// Active tickets management for help desk admin
// ============================================================================

import React, { useState } from 'react';
import { 
  User, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Filter,
  Eye,
  UserCheck
} from 'lucide-react';
import type { BaseTicket, Priority, Status } from '@/services/helpDesk/helpDesk.type';

interface ActiveTicketsProps {
  tickets?: BaseTicket[];
}

export const ActiveTickets: React.FC<ActiveTicketsProps> = ({ tickets = [] }) => {
  const [filterStatus, setFilterStatus] = useState<Status | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<BaseTicket | null>(null);

  // Mock data for demonstration
  const mockTickets: BaseTicket[] = tickets.length > 0 ? tickets : [
    {
      id: '1',
      type: 'APPOINTMENT',
      title: 'Document Request - Barangay Clearance',
      description: 'Request for barangay clearance for employment purposes',
      status: 'PENDING',
      priority: 'HIGH',
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '09123456789',
      created_at: '2024-01-15T08:00:00Z',
      updated_at: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      type: 'COMPLAINT',
      title: 'Noise Complaint',
      description: 'Loud music from neighbor disrupting sleep',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '09987654321',
      created_at: '2024-01-14T20:30:00Z',
      updated_at: '2024-01-15T09:00:00Z'
    },
    {
      id: '3',
      type: 'BLOTTER',
      title: 'Property Dispute',
      description: 'Boundary dispute with neighboring property',
      status: 'URGENT',
      priority: 'CRITICAL',
      name: 'Roberto Garcia',
      email: 'roberto@example.com',
      phone: '09111222333',
      created_at: '2024-01-13T14:15:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    }
  ];

  const filteredTickets = mockTickets.filter(ticket => {
    const statusMatch = filterStatus === 'ALL' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'ALL' || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'URGENT': return 'text-red-600 bg-red-50';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'CLOSED': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as Status | 'ALL')}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="URGENT">Urgent</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | 'ALL')}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active tickets match your filters.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500 uppercase">
                      {ticket.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{ticket.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-900">
            {filteredTickets.filter(t => t.priority === 'CRITICAL').length}
          </p>
          <p className="text-sm text-red-600">Critical</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {filteredTickets.filter(t => t.priority === 'HIGH').length}
          </p>
          <p className="text-sm text-orange-600">High</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {filteredTickets.filter(t => t.status === 'IN_PROGRESS').length}
          </p>
          <p className="text-sm text-blue-600">In Progress</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {filteredTickets.filter(t => t.status === 'PENDING').length}
          </p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveTickets;
