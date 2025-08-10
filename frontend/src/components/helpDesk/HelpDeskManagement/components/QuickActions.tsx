// ============================================================================
// components/helpDesk/HelpDeskManagement/components/QuickActions.tsx
// Quick action buttons for help desk management
// ============================================================================

import React from 'react';
import { Plus, Settings, Download, RefreshCw } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
        <RefreshCw className="w-4 h-4" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
      
      <button className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>
      
      <button className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">New Ticket</span>
      </button>
    </div>
  );
};

export default QuickActions;
