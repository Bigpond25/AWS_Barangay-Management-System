// ============================================================================
// components/helpDesk/HelpDeskManagement/components/HelpDeskAnalytics.tsx
// Analytics dashboard for help desk performance
// ============================================================================

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  Users, 
  Target,
  Calendar,
  Download
} from 'lucide-react';

export const HelpDeskAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7');

  // Mock analytics data
  const analytics = {
    overview: {
      totalTickets: 156,
      resolvedTickets: 89,
      averageResponseTime: '2.3 hours',
      customerSatisfaction: 4.2,
      trends: {
        ticketsChange: 12,
        responseTimeChange: -15,
        satisfactionChange: 8
      }
    },
    byCategory: [
      { type: 'Appointments', count: 45, percentage: 28.8, change: 5 },
      { type: 'Complaints', count: 38, percentage: 24.4, change: -2 },
      { type: 'Blotter', count: 42, percentage: 26.9, change: 8 },
      { type: 'Suggestions', count: 31, percentage: 19.9, change: 1 }
    ],
    byStatus: [
      { status: 'Resolved', count: 89, percentage: 57.1 },
      { status: 'In Progress', count: 35, percentage: 22.4 },
      { status: 'Pending', count: 22, percentage: 14.1 },
      { status: 'Urgent', count: 10, percentage: 6.4 }
    ],
    responseTimeMetrics: [
      { timeRange: '< 1 hour', count: 45, percentage: 28.8 },
      { timeRange: '1-4 hours', count: 68, percentage: 43.6 },
      { timeRange: '4-24 hours', count: 35, percentage: 22.4 },
      { timeRange: '> 24 hours', count: 8, percentage: 5.1 }
    ],
    staffPerformance: [
      { name: 'John Doe', resolved: 23, avgTime: '2.1 hrs', satisfaction: 4.5 },
      { name: 'Maria Santos', resolved: 18, avgTime: '1.8 hrs', satisfaction: 4.3 },
      { name: 'Roberto Garcia', resolved: 31, avgTime: '1.5 hrs', satisfaction: 4.6 },
      { name: 'Ana Cruz', resolved: 17, avgTime: '2.8 hrs', satisfaction: 4.1 }
    ]
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Help Desk Analytics</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(analytics.overview.trends.ticketsChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.overview.trends.ticketsChange)}`}>
                {Math.abs(analytics.overview.trends.ticketsChange)}%
              </span>
            </div>
          </div>
          <h4 className="text-2xl font-bold text-gray-900">{analytics.overview.totalTickets}</h4>
          <p className="text-gray-600">Total Tickets</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                {(analytics.overview.resolvedTickets / analytics.overview.totalTickets * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <h4 className="text-2xl font-bold text-gray-900">{analytics.overview.resolvedTickets}</h4>
          <p className="text-gray-600">Resolved Tickets</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(analytics.overview.trends.responseTimeChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.overview.trends.responseTimeChange)}`}>
                {Math.abs(analytics.overview.trends.responseTimeChange)}%
              </span>
            </div>
          </div>
          <h4 className="text-2xl font-bold text-gray-900">{analytics.overview.averageResponseTime}</h4>
          <p className="text-gray-600">Avg Response Time</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(analytics.overview.trends.satisfactionChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.overview.trends.satisfactionChange)}`}>
                {Math.abs(analytics.overview.trends.satisfactionChange)}%
              </span>
            </div>
          </div>
          <h4 className="text-2xl font-bold text-gray-900">{analytics.overview.customerSatisfaction}</h4>
          <p className="text-gray-600">Customer Rating</p>
        </div>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h4>
          <div className="space-y-4">
            {analytics.byCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{category.type}</span>
                    <span className="text-sm text-gray-600">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-1">
                  {getTrendIcon(category.change)}
                  <span className={`text-xs ${getTrendColor(category.change)}`}>
                    {Math.abs(category.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h4>
          <div className="space-y-4">
            {analytics.byStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{status.status}</span>
                    <span className="text-sm text-gray-600">{status.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.status === 'Resolved' ? 'bg-green-600' :
                        status.status === 'In Progress' ? 'bg-blue-600' :
                        status.status === 'Pending' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-4 text-xs text-gray-500">{status.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response Time Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Time Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {analytics.responseTimeMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="p-4 bg-gray-50 rounded-lg mb-2">
                <div className="text-2xl font-bold text-gray-900">{metric.count}</div>
                <div className="text-sm text-gray-600">{metric.percentage}%</div>
              </div>
              <div className="text-sm font-medium text-gray-700">{metric.timeRange}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Staff Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Resolved Tickets</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Response Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {analytics.staffPerformance.map((staff, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{staff.name}</td>
                  <td className="py-3 px-4 text-gray-600">{staff.resolved}</td>
                  <td className="py-3 px-4 text-gray-600">{staff.avgTime}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{staff.satisfaction}</span>
                      <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(staff.satisfaction))}
                        {'☆'.repeat(5 - Math.floor(staff.satisfaction))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskAnalytics;
