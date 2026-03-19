
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import TokenBooking from './pages/TokenBooking';
import TokenTracking from './pages/TokenTracking';
import EmergencyRedirect from './pages/EmergencyRedirect';
import BloodBank from './pages/BloodBank';
import StaffDashboard from './pages/StaffDashboard';
import CounterConsole from './pages/CounterConsole';
import BedManagement from './pages/BedManagement';
import AdminDashboard from './pages/AdminDashboard';
import GlobalLayout from './layouts/GlobalLayout';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Fixed ProtectedRoute type definition to make children optional, resolving TypeScript errors where children were not correctly identified in nested Route elements.
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/track" element={<TokenTracking />} />
            
            {/* Patient Routes */}
            <Route path="/patient">
              <Route index element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
              <Route path="book" element={<ProtectedRoute allowedRoles={['patient']}><TokenBooking /></ProtectedRoute>} />
              <Route path="emergency" element={<ProtectedRoute allowedRoles={['patient']}><EmergencyRedirect /></ProtectedRoute>} />
              <Route path="blood-bank" element={<ProtectedRoute allowedRoles={['patient']}><BloodBank /></ProtectedRoute>} />
            </Route>

            {/* Receptionist Routes */}
            <Route path="/staff">
              <Route index element={<ProtectedRoute allowedRoles={['receptionist']}><StaffDashboard /></ProtectedRoute>} />
              <Route path="console" element={<ProtectedRoute allowedRoles={['receptionist']}><CounterConsole /></ProtectedRoute>} />
              <Route path="beds" element={<ProtectedRoute allowedRoles={['receptionist']}><BedManagement /></ProtectedRoute>} />
              <Route path="blood-bank" element={<ProtectedRoute allowedRoles={['receptionist']}><BloodBank /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <Route index element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
