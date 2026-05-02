import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthCard, { AuthOption } from '../components/AuthCard';

const ClientAuthOptions = () => {
  const navigate = useNavigate();

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <AuthCard 
      onBack={() => navigate('/')}
      title="Área de Clientes"
      subtitle="Selecciona una opción para continuar"
    >
      <AuthOption 
        icon={LogIn}
        title="Iniciar Sesión"
        subtitle="Accede a tu cuenta personal"
        onClick={() => navigate('/login?role=client')}
        variants={itemVariants}
      />
      
      <AuthOption 
        icon={UserPlus}
        title="Registrarse"
        subtitle="Crea una nueva cuenta de cliente"
        onClick={() => navigate('/register')}
        variants={itemVariants}
      />
    </AuthCard>
  );
};

export default ClientAuthOptions;
