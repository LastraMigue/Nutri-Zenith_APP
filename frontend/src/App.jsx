import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InitialLogin from './pages/InitialLogin';
import ClientAuthOptions from './pages/ClientAuthOptions';
import ClientRegister from './pages/ClientRegister';
import ClientVerifyOTP from './pages/ClientVerifyOTP';

// Placeholder components for future routes
const LoginPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Login (En construcción)</div>;
const RegisterPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Registro (En construcción)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<InitialLogin />} />
      <Route path="/client-options" element={<ClientAuthOptions />} />
      <Route path="/register" element={<ClientRegister />} />
      <Route path="/register/verify" element={<ClientVerifyOTP />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
