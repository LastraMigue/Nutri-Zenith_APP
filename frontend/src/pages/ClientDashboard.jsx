import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const ClientDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '2rem',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--bg-white)',
          padding: '4rem',
          borderRadius: '2rem',
          boxShadow: 'var(--shadow-soft)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <h1 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '2rem', fontWeight: 'bold' }}>
          ¡Bienvenido a Nutri-Zenith!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Tu panel de cliente está actualmente en construcción. Pronto podrás ver tus dietas y hacer seguimiento aquí.
        </p>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.8rem 2rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary)'}
        >
          Cerrar Sesión
        </button>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;
