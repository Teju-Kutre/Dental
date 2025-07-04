import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import AppointmentList from './components/appointments/AppointmentList';
import Calendar from './components/calendar/Calendar';
import PatientDashboard from './components/patient/PatientDashboard';
import PatientAppointments from './components/patient/PatientAppointments';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, currentUser } = useApp();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to={currentUser?.role === 'Admin' ? '/dashboard' : '/patient-dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to={currentUser?.role === 'Admin' ? '/dashboard' : '/patient-dashboard'} replace />} />
      
      {/* Admin Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="Admin">
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute requiredRole="Admin">
          <PatientList />
        </ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute requiredRole="Admin">
          <AppointmentList />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute requiredRole="Admin">
          <Calendar />
        </ProtectedRoute>
      } />
      <Route path="/incidents" element={
        <ProtectedRoute requiredRole="Admin">
          <AppointmentList />
        </ProtectedRoute>
      } />
      
      {/* Patient Routes */}
      <Route path="/patient-dashboard" element={
        <ProtectedRoute requiredRole="Patient">
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/my-appointments" element={
        <ProtectedRoute requiredRole="Patient">
          <PatientAppointments />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;