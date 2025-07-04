import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Card from '../common/Card';
import { formatTime, getDaysInMonth, getFirstDayOfMonth, isSameDay } from '../../utils/date';

export default function Calendar() {
  const { incidents, patients } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = getFirstDayOfMonth(year, month + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return incidents.filter(incident => {
      const incidentDate = new Date(incident.appointmentDate).toISOString().split('T')[0];
      return incidentDate === dateString;
    });
  };

  const getAppointmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDate(selectedDate);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const appointments = getAppointmentsForDate(date);
      const isSelected = selectedDate && isSameDay(date.toISOString(), selectedDate.toISOString());
      const isToday = isSameDay(date.toISOString(), new Date().toISOString());
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-300' : ''
          } ${isToday ? 'bg-yellow-50 border-yellow-300' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-yellow-800' : 'text-gray-900'}`}>
              {day}
            </span>
            {appointments.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                {appointments.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {appointments.slice(0, 2).map((appointment) => (
              <div key={appointment.id} className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded truncate">
                {formatTime(appointment.appointmentDate)}
              </div>
            ))}
            {appointments.length > 2 && (
              <div className="text-xs text-gray-500">
                +{appointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">View and manage appointment schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {dayNames.map((day) => (
                <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
              {renderCalendarDays()}
            </div>
          </Card>
        </div>

        <div>
          <Card title={selectedDate ? `Appointments - ${selectedDate.toDateString()}` : 'Select a Date'}>
            <div className="space-y-4">
              {selectedDate ? (
                getAppointmentsForSelectedDate().length > 0 ? (
                  getAppointmentsForSelectedDate().map((appointment) => {
                    const patient = patients.find(p => p.id === appointment.patientId);
                    return (
                      <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                              <p className="text-sm text-gray-600">{patient?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(appointment.appointmentDate)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{appointment.description}</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No appointments scheduled for this date</p>
                )
              ) : (
                <p className="text-gray-500 text-center py-8">Click on a date to view appointments</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}