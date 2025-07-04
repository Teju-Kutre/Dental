import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import Card from '../common/Card';
import { formatDate, formatTime, isUpcoming, isToday } from '../../utils/date';

export default function Dashboard() {
  const { patients, incidents } = useApp();

  const upcomingAppointments = incidents
    .filter(i => isUpcoming(i.appointmentDate))
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 10);

  const todayAppointments = incidents.filter(i => isToday(i.appointmentDate));
  const completedTreatments = incidents.filter(i => i.status === 'Completed');
  const pendingTreatments = incidents.filter(i => i.status === 'Scheduled' || i.status === 'Pending');
  
  const totalRevenue = completedTreatments.reduce((sum, i) => sum + (i.cost || 0), 0);
  const averageRevenue = totalRevenue / Math.max(completedTreatments.length, 1);

  const topPatients = patients
    .map(p => ({
      ...p,
      appointmentCount: incidents.filter(i => i.patientId === p.id).length,
      totalSpent: incidents.filter(i => i.patientId === p.id && i.cost).reduce((sum, i) => sum + (i.cost || 0), 0)
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Today\'s Appointments',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+18%'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((completedTreatments.length / incidents.length) * 100)}%`,
      icon: Activity,
      color: 'bg-orange-500',
      change: '+8%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </p>
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
              upcomingAppointments.map((appointment) => {
                const patient = patients.find(p => p.id === appointment.patientId);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(appointment.appointmentDate)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </Card>

        {/* Top Patients */}
        <Card title="Top Patients">
          <div className="space-y-4">
            {topPatients.map((patient, index) => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.appointmentCount} appointments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${patient.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total spent</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Treatment Status */}
        <Card title="Treatment Status">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Completed</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {completedTreatments.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-gray-900">Pending</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {pendingTreatments.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-gray-900">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {incidents.filter(i => i.status === 'Cancelled').length}
              </span>
            </div>
          </div>
        </Card>

        {/* Revenue Analytics */}
        <Card title="Revenue Analytics">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-semibold text-blue-600">
                  ${averageRevenue.toFixed(0)}
                </p>
                <p className="text-xs text-gray-600">Avg per Treatment</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-semibold text-purple-600">
                  {completedTreatments.length}
                </p>
                <p className="text-xs text-gray-600">Treatments Done</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}