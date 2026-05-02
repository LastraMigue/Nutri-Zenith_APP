import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { supabase } from '../lib/supabase';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      setErrorMsg('El correo es obligatorio.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setErrorMsg('Introduce un correo válido.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Check if email exists in the database
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('correo', correo.toLowerCase().trim())
      .maybeSingle();

    if (!existing) {
      setErrorMsg('Este correo no está registrado. Por favor, crea una cuenta primero.');
      setLoading(false);
      return;
    }

    // Send the Magic Link OTP
    const { error } = await supabase.auth.signInWithOtp({
      email: correo.trim(),
      options: {
        shouldCreateUser: false, // Force login only
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Error al enviar el código. Inténtalo de nuevo.');
      return;
    }

    // Navigate to OTP verification for login
    navigate('/client-login/verify', {
      state: { correo: correo.trim() },
    });
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <AuthCard
      onBack={() => navigate('/client-options')}
      title="Iniciar Sesión"
      subtitle="Accede a tu cuenta de cliente"
    >
      <motion.form
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="auth-form"
        noValidate
      >
        {errorMsg && (
          <motion.div variants={itemVariants} className="auth-error-banner">
            {errorMsg}
          </motion.div>
        )}

        {/* Correo */}
        <motion.div variants={itemVariants} className="auth-field">
          <label htmlFor="correo" className="auth-label">Correo electrónico</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
            <input
              id="correo"
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setErrorMsg('');
              }}
              className="auth-input"
              style={{ paddingLeft: '3rem' }}
              autoComplete="email"
            />
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
        >
          {loading ? (
            <><Loader2 size={18} className="spin" /> Enviando código...</>
          ) : (
            <>Continuar <ArrowRight size={18} /></>
          )}
        </motion.button>

        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Regístrate aquí</Link>
          </p>
        </motion.div>
      </motion.form>
    </AuthCard>
  );
};

export default ClientLogin;
