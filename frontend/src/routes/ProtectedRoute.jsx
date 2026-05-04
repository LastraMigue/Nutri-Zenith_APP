import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (mounted) {
          setIsAllowed(false);
          setLoading(false);
        }
        return;
      }

      const user = session.user;
      
      // Determine the user's role
      let userRole = 'client';
      
      // 1. Verificación por email maestro
      if (user.email === 'nutrizenithapp@gmail.com') {
        userRole = 'admin';
      } else {
        // 2. Verificación robusta por base de datos
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          userRole = 'admin';
        } else if (profile?.role === 'client') {
          userRole = 'client';
        }
      }

      if (mounted) {
        if (allowedRole && allowedRole !== userRole) {
           setIsAllowed(false);
        } else {
           setIsAllowed(true);
        }
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [allowedRole]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'var(--bg-app)' 
      }}>
        <Loader2 className="spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  // Si no está permitido y queríamos acceder a admin, lo mandamos al login de admin
  if (!isAllowed) {
    return <Navigate to={allowedRole === 'admin' ? '/admin-login' : '/client-login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
