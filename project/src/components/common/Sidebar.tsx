import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { currentUser } = useApp();

  const adminRoutes = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/incidents', icon: FileText, label: 'Incidents' },
  ];

  const patientRoutes = [
    { path: '/patient-dashboard', icon: Activity, label: 'My Dashboard' },
    { path: '/my-appointments', icon: Calendar, label: 'My Appointments' },
  ];

  const routes = currentUser?.role === 'Admin' ? adminRoutes : patientRoutes;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">ENTNT</h2>
            <p className="text-sm text-gray-600">Dental Center</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <route.icon className="h-5 w-5" />
            <span>{route.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}