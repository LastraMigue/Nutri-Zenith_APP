import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InitialLogin from './pages/InitialLogin';
import ClientAuthOptions from './pages/ClientAuthOptions';

// Placeholder components for future routes
const LoginPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Login (En construcción)</div>;
const RegisterPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Registro (En construcción)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<InitialLogin />} />
      <Route path="/client-options" element={<ClientAuthOptions />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
