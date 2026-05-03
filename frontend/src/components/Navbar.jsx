import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-white)',
      boxShadow: 'var(--shadow-soft)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Logotipo a la izquierda */}
      <div style={{ display: 'flex', alignItems: 'center', height: '40px', position: 'relative', width: '180px' }}>
        <img 
          src={logo} 
          alt="Nutri-Zenith Logo" 
          style={{ 
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '110px', 
            width: 'auto', 
            objectFit: 'contain'
          }} 
        />
      </div>

      {/* Usuario a la derecha */}
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            color: 'var(--text-main)',
            fontWeight: '500',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            background: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span>{userName}</span>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Dropdown Logout */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                background: 'var(--bg-white)',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-soft)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                minWidth: '150px'
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
