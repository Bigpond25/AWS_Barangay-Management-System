// ============================================================================
// components/helpDesk/HelpDeskManagement/components/HelpDeskOverview.tsx
// Overview dashboard for help desk management
// ============================================================================

import React from 'react';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';

export const HelpDeskOverview: React.FC = () => {
  const recentActivity = [
    { id: 1, type: 'Appointment', action: 'Created', time: '2 minutes ago', priority: 'HIGH' },
    { id: 2, type: 'Complaint', action: 'Resolved', time: '15 minutes ago', priority: 'MEDIUM' },
    { id: 3, type: 'Blotter', action: 'Updated', time: '1 hour ago', priority: 'CRITICAL' },
    { id: 4, type: 'Suggestion', action: 'Reviewed', time: '2 hours ago', priority: 'LOW' },
  ];

  const todayStats = {
    newTickets: 12,
    resolvedTickets: 8,
    pendingTickets: 15,
    averageResponseTime: '2.5 hours',
  };

  return (
    <div className="space-y-6">
      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">New Tickets</p>
              <p className="text-2xl font-bold text-blue-900">{todayStats.newTickets}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Resolved</p>
              <p className="text-2xl font-bold text-green-900">{todayStats.resolvedTickets}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{todayStats.pendingTickets}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Response</p>
              <p className="text-2xl font-bold text-purple-900">{todayStats.averageResponseTime}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.priority === 'CRITICAL' ? 'bg-red-500' :
                  activity.priority === 'HIGH' ? 'bg-orange-500' :
                  activity.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {activity.type} {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                activity.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                activity.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                activity.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {activity.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Appointments</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Complaints</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blotter</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Suggestions</span>
              <span className="font-medium">10%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium text-green-600">↓ 15% faster</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-medium text-green-600">↓ 8% faster</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average</span>
              <span className="font-medium">2.5 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskOverview;
