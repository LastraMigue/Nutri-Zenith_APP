import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InitialLogin from './pages/InitialLogin';

// Placeholder components for future routes
const LoginPage = () => <div style={{ padding: '20px', color: 'var(--text-main)' }}>Página de Login (En construcción)</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<InitialLogin />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
