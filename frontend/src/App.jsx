import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InitialLogin from './pages/InitialLogin';
import ClientAuthOptions from './pages/ClientAuthOptions';
import ClientRegister from './pages/ClientRegister';
import ClientVerifyOTP from './pages/ClientVerifyOTP';
import ClientLogin from './pages/ClientLogin';
import ClientVerifyLoginOTP from './pages/ClientVerifyLoginOTP';
import ClientDashboard from './pages/ClientDashboard';

// Placeholder components for future routes
const LoginPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Login (En construcción)</div>;
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
      <Route path="/client-dashboard" element={<ClientDashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
