import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { supabase } from '../lib/supabase';

const ClientRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', numero: '', correo: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!form.numero.trim()) newErrors.numero = 'El número es obligatorio.';
    else if (!/^[0-9+\s()-]{6,20}$/.test(form.numero)) newErrors.numero = 'Formato de número no válido.';
    if (!form.correo.trim()) newErrors.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) newErrors.correo = 'Introduce un correo válido.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Check if email is already registered
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('correo', form.correo.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      setErrorMsg('Este correo ya está registrado. Por favor inicia sesión.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: form.correo,
      password: crypto.randomUUID(), // OTP-only flow — password is never used
      options: {
        data: {
          nombre: form.nombre,
          numero: form.numero,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Error al enviar el código. Inténtalo de nuevo.');
      return;
    }

    // Navigate to OTP verification, passing user data via state
    navigate('/register/verify', {
      state: {
        correo: form.correo,
        nombre: form.nombre,
        numero: form.numero,
      },
    });
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <AuthCard
      onBack={() => navigate('/client-options')}
      title="Crear Cuenta"
      subtitle="Rellena tus datos para registrarte"
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

        {/* Nombre */}
        <motion.div variants={itemVariants} className="auth-field">
          <label htmlFor="nombre" className="auth-label">Nombre completo</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              className={`auth-input ${errors.nombre ? 'error' : ''}`}
              style={{ paddingLeft: '3rem' }}
              autoComplete="name"
            />
          </div>
          {errors.nombre && <span className="auth-input-error">{errors.nombre}</span>}
        </motion.div>

        {/* Número */}
        <motion.div variants={itemVariants} className="auth-field">
          <label htmlFor="numero" className="auth-label">Número de teléfono</label>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
            <input
              id="numero"
              name="numero"
              type="tel"
              placeholder="+34 600 000 000"
              value={form.numero}
              onChange={handleChange}
              className={`auth-input ${errors.numero ? 'error' : ''}`}
              style={{ paddingLeft: '3rem' }}
              autoComplete="tel"
            />
          </div>
          {errors.numero && <span className="auth-input-error">{errors.numero}</span>}
        </motion.div>

        {/* Correo */}
        <motion.div variants={itemVariants} className="auth-field">
          <label htmlFor="correo" className="auth-label">Correo electrónico</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
            <input
              id="correo"
              name="correo"
              type="email"
              placeholder="tu@correo.com"
              value={form.correo}
              onChange={handleChange}
              className={`auth-input ${errors.correo ? 'error' : ''}`}
              style={{ paddingLeft: '3rem' }}
              autoComplete="email"
            />
          </div>
          {errors.correo && <span className="auth-input-error">{errors.correo}</span>}
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
            <>Aceptar <ArrowRight size={18} /></>
          )}
        </motion.button>
      </motion.form>
    </AuthCard>
  );
};

export default ClientRegister;
