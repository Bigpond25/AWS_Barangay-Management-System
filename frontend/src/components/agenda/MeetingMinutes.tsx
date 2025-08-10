// ============================================================================
// components/agenda/MeetingMinutes.tsx
// Component for managing meeting minutes for completed agendas
// ============================================================================

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Clock,
  User,
  Check
} from 'lucide-react';

interface MeetingMinute {
  id: string;
  agenda_id: string;
  topic: string;
  discussion: string;
  decision: string;
  action_items: ActionItem[];
  created_at: string;
  updated_at: string;
}

interface ActionItem {
  id: string;
  description: string;
  assigned_to: string;
  due_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  created_at: string;
}

interface MeetingMinutesProps {
  agendaId: string;
  agendaTitle: string;
  isReadOnly?: boolean;
}

export const MeetingMinutes: React.FC<MeetingMinutesProps> = ({
  agendaId,
  agendaTitle,
  isReadOnly = false
}) => {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMinute, setEditingMinute] = useState<string | null>(null);
  const [newMinute, setNewMinute] = useState<Partial<MeetingMinute>>({
    topic: '',
    discussion: '',
    decision: '',
    action_items: []
  });

  // Mock data - in real implementation, this would come from an API
  React.useEffect(() => {
    setMinutes([
      {
        id: '1',
        agenda_id: agendaId,
        topic: 'Budget Allocation for Community Projects',
        discussion: 'Discussed the proposed budget allocation for various community projects including road repairs, health center improvements, and educational programs.',
        decision: 'Approved budget allocation of PHP 500,000 for road repairs and PHP 300,000 for health center improvements.',
        action_items: [
          {
            id: '1',
            description: 'Prepare detailed cost breakdown for road repairs',
            assigned_to: 'John Doe',
            due_date: '2024-02-15',
            status: 'IN_PROGRESS',
            created_at: '2024-01-15T08:00:00Z'
          },
          {
            id: '2',
            description: 'Contact contractors for health center renovation quotes',
            assigned_to: 'Maria Santos',
            due_date: '2024-02-20',
            status: 'PENDING',
            created_at: '2024-01-15T08:00:00Z'
          }
        ],
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-15T08:00:00Z'
      }
    ]);
  }, [agendaId]);

  const handleAddMinute = () => {
    if (newMinute.topic && newMinute.discussion) {
      const minute: MeetingMinute = {
        id: Date.now().toString(),
        agenda_id: agendaId,
        topic: newMinute.topic!,
        discussion: newMinute.discussion!,
        decision: newMinute.decision || '',
        action_items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setMinutes([...minutes, minute]);
      setNewMinute({ topic: '', discussion: '', decision: '', action_items: [] });
      setIsEditing(false);
    }
  };

  const handleDeleteMinute = (minuteId: string) => {
    setMinutes(minutes.filter(m => m.id !== minuteId));
  };

  const getActionItemStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Meeting Minutes</h2>
            <p className="text-gray-600">{agendaTitle}</p>
          </div>
        </div>
        
        {!isReadOnly && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Minute
          </button>
        )}
      </div>

      {/* Add New Minute Form */}
      {isEditing && !isReadOnly && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Minute</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={newMinute.topic || ''}
                onChange={(e) => setNewMinute({ ...newMinute, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Meeting topic..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discussion
              </label>
              <textarea
                value={newMinute.discussion || ''}
                onChange={(e) => setNewMinute({ ...newMinute, discussion: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Discussion details..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision/Resolution
              </label>
              <textarea
                value={newMinute.decision || ''}
                onChange={(e) => setNewMinute({ ...newMinute, decision: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Decision or resolution made..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewMinute({ topic: '', discussion: '', decision: '', action_items: [] });
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMinute}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Minute
            </button>
          </div>
        </div>
      )}

      {/* Meeting Minutes List */}
      <div className="space-y-6">
        {minutes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meeting minutes yet</h3>
            <p className="text-gray-600 mb-4">Start by adding the first meeting minute.</p>
            {!isReadOnly && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Minute
              </button>
            )}
          </div>
        ) : (
          minutes.map((minute, index) => (
            <div key={minute.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Minute Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{minute.topic}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(minute.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {!isReadOnly && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingMinute(minute.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMinute(minute.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Discussion */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Discussion</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{minute.discussion}</p>
              </div>

              {/* Decision */}
              {minute.decision && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Decision/Resolution</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{minute.decision}</p>
                </div>
              )}

              {/* Action Items */}
              {minute.action_items.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Action Items</h4>
                  <div className="space-y-2">
                    {minute.action_items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-gray-900">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{item.assigned_to}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Due: {formatDate(item.due_date)}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionItemStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeetingMinutes;
