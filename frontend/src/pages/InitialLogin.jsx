import React from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthCard, { AuthOption } from '../components/AuthCard';

const InitialLogin = () => {
  const navigate = useNavigate();

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <AuthCard>
      <AuthOption 
        icon={User}
        title="Acceso Cliente"
        subtitle="Dietas y seguimiento personal"
        onClick={() => navigate('/client-options')}
        variants={itemVariants}
      />
      
      <AuthOption 
        icon={ShieldCheck}
        title="Portal Especialista"
        subtitle="Gestión clínica y pacientes"
        onClick={() => navigate('/admin-login')}
        variants={itemVariants}
      />
    </AuthCard>
  );
};

export default InitialLogin;
