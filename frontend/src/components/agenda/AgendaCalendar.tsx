// ============================================================================
// components/agenda/AgendaCalendar.tsx
// Enhanced calendar view for agenda management
// ============================================================================

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';
import type { Agenda } from '@/services/agenda/agenda.types';

interface AgendaCalendarProps {
  agendas: Agenda[];
  onAgendaClick?: (agenda: Agenda) => void;
  onDateClick?: (date: Date) => void;
  onNewAgenda?: () => void;
}

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  agendas = [],
  onAgendaClick,
  onDateClick,
  onNewAgenda
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCurrentMonth = () => currentDate.getMonth();
  const getCurrentYear = () => currentDate.getFullYear();

  const getFirstDayOfMonth = () => {
    return new Date(getCurrentYear(), getCurrentMonth(), 1).getDay();
  };

  const getDaysInMonth = () => {
    return new Date(getCurrentYear(), getCurrentMonth() + 1, 0).getDate();
  };

  const getPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const getNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === getCurrentMonth() &&
      today.getFullYear() === getCurrentYear()
    );
  };

  const getAgendasForDate = (day: number) => {
    return agendas.filter(agenda => {
      const agendaDate = new Date(agenda.date);
      return (
        agendaDate.getDate() === day &&
        agendaDate.getMonth() === getCurrentMonth() &&
        agendaDate.getFullYear() === getCurrentYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 border border-gray-200 bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAgendas = getAgendasForDate(day);
      const isCurrentDay = isToday(day);
      
      days.push(
        <div
          key={day}
          className={`h-32 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
            isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => {
            const clickedDate = new Date(getCurrentYear(), getCurrentMonth(), day);
            onDateClick?.(clickedDate);
          }}
        >
          <div className="p-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                {day}
              </span>
              {dayAgendas.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                  {dayAgendas.length}
                </span>
              )}
            </div>
            
            <div className="flex-1 space-y-1 overflow-y-auto">
              {dayAgendas.slice(0, 3).map((agenda) => (
                <div
                  key={agenda.id}
                  className="group relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAgendaClick?.(agenda);
                  }}
                >
                  <div className={`text-xs p-1 rounded text-white truncate ${getStatusColor(agenda.status)} hover:opacity-80 transition-opacity`}>
                    <div className="flex items-center gap-1">
                      <span className="truncate">{agenda.title}</span>
                      <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
              {dayAgendas.length > 3 && (
                <div className="text-xs text-gray-500 px-1">
                  +{dayAgendas.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[getCurrentMonth()]} {getCurrentYear()}
          </h2>
          <button
            onClick={getToday}
            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={getPreviousMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={getNextMonth}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {onNewAgenda && (
            <button
              onClick={onNewAgenda}
              className="ml-2 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaCalendar;
