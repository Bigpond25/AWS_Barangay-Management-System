// ============================================================================
// components/helpDesk/HelpDeskManagement/HelpDeskManagementPage.tsx 
// Admin interface for managing all help desk tickets
// ============================================================================

import React, { useState } from 'react';
import { Plus, Settings, BarChart3, Users, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/components/_global/Breadcrumb';
import { StatCard } from '@/components/__shared/StatCard';
import { useHelpDeskStatistics } from '@/services/helpDesk/useHelpDesk';

import { HelpDeskOverview } from './components/HelpDeskOverview';
import { ActiveTickets } from './components/ActiveTickets';
import { QuickActions } from './components/QuickActions';
import { TicketAssignments } from './components/TicketAssignments';
import { HelpDeskAnalytics } from './components/HelpDeskAnalytics';

type ManagementView = 'overview' | 'active' | 'assignments' | 'analytics';

interface HelpDeskManagementPageProps {}

export const HelpDeskManagementPage: React.FC<HelpDeskManagementPageProps> = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<ManagementView>('overview');

  // Fetch help desk statistics
  const { data: statistics, isLoading: statsLoading } = useHelpDeskStatistics();

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Help Desk Management', href: '/help-desk/manage' },
  ];

  const managementTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'active', label: 'Active Tickets', icon: AlertCircle },
    { id: 'assignments', label: 'Assignments', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <HelpDeskOverview />;
      case 'active':
        return <ActiveTickets />;
      case 'assignments':
        return <TicketAssignments />;
      case 'analytics':
        return <HelpDeskAnalytics />;
      default:
        return <HelpDeskOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Help Desk Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor all help desk tickets and staff assignments
                </p>
              </div>
              <QuickActions />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tickets"
            value={statistics?.total_tickets || 0}
            icon={AlertCircle}
            loading={statsLoading}
            color="blue"
          />
          <StatCard
            title="Pending Review"
            value={statistics?.pending_review || 0}
            icon={Clock}
            loading={statsLoading}
            color="yellow"
          />
          <StatCard
            title="In Progress"
            value={statistics?.in_progress || 0}
            icon={Users}
            loading={statsLoading}
            color="purple"
          />
          <StatCard
            title="Resolved"
            value={statistics?.resolved || 0}
            icon={BarChart3}
            loading={statsLoading}
            color="green"
          />
        </div>

        {/* Management Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {managementTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id as ManagementView)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeView === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active View Content */}
          <div className="p-6">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskManagementPage;
