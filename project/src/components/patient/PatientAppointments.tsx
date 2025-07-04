import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, DollarSign, FileText, Download, Filter } from 'lucide-react';
import Card from '../common/Card';
import { formatDate, formatTime } from '../../utils/date';

export default function PatientAppointments() {
  const { currentUser, patients, incidents } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  
  const patient = patients.find(p => p.id === currentUser?.patientId);
  const patientIncidents = incidents
    .filter(i => i.patientId === currentUser?.patientId)
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const handleDownloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">View your appointment history and upcoming visits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Appointments</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {patientIncidents.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{appointment.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{appointment.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(appointment.appointmentDate)}</span>
                  </div>
                  {appointment.cost && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${appointment.cost}</span>
                    </div>
                  )}
                  {appointment.files.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{appointment.files.length} files</span>
                    </div>
                  )}
                </div>

                {appointment.treatment && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Treatment:</h4>
                    <p className="text-sm text-gray-600">{appointment.treatment}</p>
                  </div>
                )}

                {appointment.comments && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Comments:</h4>
                    <p className="text-sm text-gray-600">{appointment.comments}</p>
                  </div>
                )}

                {appointment.nextAppointmentDate && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Next Appointment:</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(appointment.nextAppointmentDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(appointment.nextAppointmentDate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {appointment.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {appointment.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadFile(file.url, file.name)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {patientIncidents.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No appointments found matching your criteria.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}