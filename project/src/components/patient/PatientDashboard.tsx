import React from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, DollarSign, FileText, Download } from 'lucide-react';
import Card from '../common/Card';
import { formatDate, formatTime, isUpcoming } from '../../utils/date';

export default function PatientDashboard() {
  const { currentUser, patients, incidents } = useApp();
  
  const patient = patients.find(p => p.id === currentUser?.patientId);
  const patientIncidents = incidents.filter(i => i.patientId === currentUser?.patientId);
  
  const upcomingAppointments = patientIncidents
    .filter(i => isUpcoming(i.appointmentDate))
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  
  const completedTreatments = patientIncidents.filter(i => i.status === 'Completed');
  const totalSpent = completedTreatments.reduce((sum, i) => sum + (i.cost || 0), 0);

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed Treatments',
      value: completedTreatments.length,
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Medical Records',
      value: patientIncidents.reduce((sum, i) => sum + i.files.length, 0),
      icon: FileText,
      color: 'bg-orange-500'
    }
  ];

  const handleDownloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {patient?.name}</h1>
        <p className="text-gray-600">Here's your dental care overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments">
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(appointment.appointmentDate)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            )}
          </div>
        </Card>

        {/* Treatment History */}
        <Card title="Recent Treatment History">
          <div className="space-y-4">
            {completedTreatments.slice(0, 5).map((treatment) => (
              <div key={treatment.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{treatment.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{treatment.treatment}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {treatment.cost ? `$${treatment.cost}` : 'Free'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(treatment.appointmentDate)}</span>
                  </div>
                  {treatment.files.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{treatment.files.length} files</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Medical Records */}
      <Card title="Medical Records & Files">
        <div className="space-y-4">
          {patientIncidents.filter(i => i.files.length > 0).map((incident) => (
            <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{incident.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{formatDate(incident.appointmentDate)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incident.files.map((file) => (
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
          ))}
          {patientIncidents.filter(i => i.files.length > 0).length === 0 && (
            <p className="text-gray-500 text-center py-8">No medical records available</p>
          )}
        </div>
      </Card>
    </div>
  );
}