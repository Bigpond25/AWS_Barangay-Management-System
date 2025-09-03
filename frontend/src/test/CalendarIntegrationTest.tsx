import React, { useEffect, useState } from 'react';
import { useCalendarEvents } from '@/services/agenda/useAgenda';
import { useAppointmentsByDate } from '@/services/helpDesk/appointments/useAppointments';
import type { CalendarEvent } from '@/services/agenda/agenda.types';
import type { ViewAppointment } from '@/services/helpDesk/appointments/appointments.types';

const CalendarIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Test agenda events
  const { 
    data: agendaEvents = [], 
    isLoading: agendaLoading, 
    error: agendaError 
  } = useCalendarEvents(currentMonth, currentYear);

  // Test appointment events
  const { 
    data: appointmentEvents = [], 
    isLoading: appointmentsLoading, 
    error: appointmentsError 
  } = useAppointmentsByDate(currentMonth, currentYear);

  useEffect(() => {
    const results: string[] = [];

    // Test agenda integration
    results.push(`=== AGENDA INTEGRATION TEST ===`);
    results.push(`Loading: ${agendaLoading}`);
    results.push(`Error: ${agendaError?.message || 'None'}`);
    results.push(`Events count: ${agendaEvents.length}`);
    results.push(`Sample event: ${agendaEvents.length > 0 ? JSON.stringify(agendaEvents[0], null, 2) : 'None'}`);

    results.push(`\n=== APPOINTMENTS INTEGRATION TEST ===`);
    results.push(`Loading: ${appointmentsLoading}`);
    results.push(`Error: ${appointmentsError?.message || 'None'}`);
    results.push(`Events count: ${appointmentEvents.length}`);
    results.push(`Sample event: ${appointmentEvents.length > 0 ? JSON.stringify(appointmentEvents[0], null, 2) : 'None'}`);

    // Test data transformation for calendar
    if (agendaEvents.length > 0) {
      results.push(`\n=== AGENDA DATA TRANSFORMATION ===`);
      const agendaData = agendaEvents.reduce((acc: { [key: string]: CalendarEvent[] }, event: CalendarEvent) => {
        const dateKey = event.date.substring(0, 10);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
      }, {});
      results.push(`Transformed agenda data keys: ${Object.keys(agendaData).join(', ')}`);
    }

    if (appointmentEvents.length > 0) {
      results.push(`\n=== APPOINTMENTS DATA TRANSFORMATION ===`);
      const appointmentsData = appointmentEvents.reduce((acc: { [key: string]: ViewAppointment[] }, appointment: ViewAppointment) => {
        const appointmentDate = appointment.appointment?.date;
        if (appointmentDate) {
          const dateKey = appointmentDate.substring(0, 10);
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(appointment);
        }
        return acc;
      }, {});
      results.push(`Transformed appointments data keys: ${Object.keys(appointmentsData).join(', ')}`);
    }

    setTestResults(results);
  }, [agendaEvents, appointmentEvents, agendaLoading, appointmentsLoading, agendaError, appointmentsError]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calendar Integration Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
        {testResults.join('\n')}
      </div>
    </div>
  );
};

export default CalendarIntegrationTest;
