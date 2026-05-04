import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { supabase } from '../lib/supabase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.correo.trim()) {
      setErrorMsg('El correo es obligatorio.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      setErrorMsg('Introduce un correo válido.');
      return;
    }
    if (!form.password.trim()) {
      setErrorMsg('La contraseña es obligatoria.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.correo.trim(),
      password: form.password,
    });

    if (error) {
      setLoading(false);
      setErrorMsg('Credenciales incorrectas. Verifica tu correo y contraseña.');
      return;
    }

    // 1. Verificación básica por email hardcoded
    let isSpecialist = data.user?.email === 'nutrizenithapp@gmail.com';

    // 2. Verificación robusta consultando la tabla de perfiles
    if (!isSpecialist) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.role === 'admin') {
        isSpecialist = true;
      }
    }

    if (!isSpecialist) {
      await supabase.auth.signOut();
      setLoading(false);
      setErrorMsg('No tienes permisos de administrador para acceder a este portal.');
      return;
    }

    setLoading(false);
    navigate('/admin-dashboard');
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <AuthCard
      onBack={() => navigate('/')}
      title="Portal Especialista"
      subtitle="Inicia sesión con tus credenciales"
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
              name="correo"
              type="email"
              placeholder="admin@tuempresa.com"
              value={form.correo}
              onChange={handleChange}
              className="auth-input"
              style={{ paddingLeft: '3rem' }}
              autoComplete="username"
            />
          </div>
        </motion.div>

        {/* Contraseña */}
        <motion.div variants={itemVariants} className="auth-field">
          <label htmlFor="password" className="auth-label">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
              style={{ paddingLeft: '3rem' }}
              autoComplete="new-password"
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
            <><Loader2 size={18} className="spin" /> Verificando...</>
          ) : (
            <>Iniciar sesión <ArrowRight size={18} /></>
          )}
        </motion.button>
      </motion.form>
    </AuthCard>
  );
};

export default AdminLogin;
