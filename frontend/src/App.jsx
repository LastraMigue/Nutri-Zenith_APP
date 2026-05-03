import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InitialLogin from './pages/InitialLogin';
import ClientAuthOptions from './pages/ClientAuthOptions';
import ClientRegister from './pages/ClientRegister';
import ClientVerifyOTP from './pages/ClientVerifyOTP';
import ClientLogin from './pages/ClientLogin';
import ClientVerifyLoginOTP from './pages/ClientVerifyLoginOTP';
import ClientDashboard from './pages/ClientDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfiles from './pages/AdminProfiles';
import DietManagement from './pages/DietManagement';
import UploadDiet from './pages/UploadDiet';
import ViewDiet from './pages/ViewDiet';
import ProtectedRoute from './routes/ProtectedRoute';

// Placeholder components for future routes
const RegisterPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Registro (En construcción)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<InitialLogin />} />
      <Route path="/client-options" element={<ClientAuthOptions />} />
      <Route path="/client-login" element={<ClientLogin />} />
      <Route path="/client-login/verify" element={<ClientVerifyLoginOTP />} />
      <Route path="/register" element={<ClientRegister />} />
      <Route path="/register/verify" element={<ClientVerifyOTP />} />
      <Route 
        path="/client-dashboard" 
        element={
          <ProtectedRoute allowedRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/profiles" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminProfiles />
          </ProtectedRoute>
        } 
      />
      <Route path="/admin/diets" element={<ProtectedRoute allowedRole="admin"><DietManagement /></ProtectedRoute>} />
      <Route path="/admin/diets/:id" element={<ProtectedRoute allowedRole="admin"><ViewDiet /></ProtectedRoute>} />
      <Route path="/admin/upload-diet" element={<ProtectedRoute allowedRole="admin"><UploadDiet /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
