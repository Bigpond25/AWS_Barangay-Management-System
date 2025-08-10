// ============================================================================
// components/helpDesk/HelpDeskManagement/components/TicketAssignments.tsx
// Ticket assignment management for help desk admin
// ============================================================================

import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  activeTickets: number;
  resolvedTickets: number;
  averageResponseTime: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}

interface Assignment {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ticketType: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  dueDate: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

export const TicketAssignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'staff'>('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Mock data for staff members
  const staff: Staff[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@barangay.gov.ph',
      department: 'General Services',
      activeTickets: 5,
      resolvedTickets: 23,
      averageResponseTime: '2.1 hrs',
      status: 'AVAILABLE'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@barangay.gov.ph',
      department: 'Legal Affairs',
      activeTickets: 3,
      resolvedTickets: 18,
      averageResponseTime: '1.8 hrs',
      status: 'BUSY'
    },
    {
      id: '3',
      name: 'Roberto Garcia',
      email: 'roberto@barangay.gov.ph',
      department: 'Health Services',
      activeTickets: 2,
      resolvedTickets: 31,
      averageResponseTime: '1.5 hrs',
      status: 'AVAILABLE'
    }
  ];

  // Mock data for assignments
  const assignments: Assignment[] = [
    {
      id: '1',
      ticketId: 'TKT-001',
      ticketTitle: 'Barangay Clearance Request',
      ticketType: 'APPOINTMENT',
      assignedTo: 'John Doe',
      assignedBy: 'Admin',
      assignedAt: '2024-01-15T08:00:00Z',
      dueDate: '2024-01-16T17:00:00Z',
      status: 'IN_PROGRESS'
    },
    {
      id: '2',
      ticketId: 'TKT-002',
      ticketTitle: 'Noise Complaint Investigation',
      ticketType: 'COMPLAINT',
      assignedTo: 'Maria Santos',
      assignedBy: 'Admin',
      assignedAt: '2024-01-14T14:30:00Z',
      dueDate: '2024-01-17T12:00:00Z',
      status: 'ASSIGNED'
    },
    {
      id: '3',
      ticketId: 'TKT-003',
      ticketTitle: 'Property Dispute Mediation',
      ticketType: 'BLOTTER',
      assignedTo: 'Roberto Garcia',
      assignedBy: 'Admin',
      assignedAt: '2024-01-13T10:15:00Z',
      dueDate: '2024-01-15T16:00:00Z',
      status: 'OVERDUE'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-50';
      case 'BUSY': return 'text-orange-600 bg-orange-50';
      case 'OFFLINE': return 'text-gray-600 bg-gray-50';
      case 'ASSIGNED': return 'text-blue-600 bg-blue-50';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'OVERDUE': return 'text-red-600 bg-red-50';
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.ticketTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'staff'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Staff Management
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={activeTab === 'assignments' ? 'Search assignments...' : 'Search staff...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {activeTab === 'assignments' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'assignments' ? (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Active Assignments</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Assignment
            </button>
          </div>

          {/* Assignments List */}
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{assignment.ticketId}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {assignment.ticketType}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{assignment.ticketTitle}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{assignment.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Assigned {formatDate(assignment.assignedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Due {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors">
                      Reassign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Staff Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Available Staff</p>
                  <p className="text-2xl font-bold text-green-900">
                    {staff.filter(s => s.status === 'AVAILABLE').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Busy Staff</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {staff.filter(s => s.status === 'BUSY').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Active Tickets</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {staff.reduce((sum, s) => sum + s.activeTickets, 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Staff List */}
          <div className="space-y-3">
            {filteredStaff.map((member) => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{member.email} • {member.department}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Active Tickets:</span>
                        <span className="ml-2 font-medium">{member.activeTickets}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolved:</span>
                        <span className="ml-2 font-medium">{member.resolvedTickets}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Response:</span>
                        <span className="ml-2 font-medium">{member.averageResponseTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                      View Profile
                    </button>
                    <button className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors">
                      Assign Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketAssignments;
