import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { supabase } from '../lib/supabase';

const ClientVerifyLoginOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { correo } = location.state || {};

  const [digits, setDigits] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);

  // Redirect if no email passed
  useEffect(() => {
    if (!correo) navigate('/client-options');
  }, [correo, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setErrorMsg('');

    if (cleaned && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const newDigits = [...digits];
    pasted.split('').forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 7)]?.focus();
  };

  const handleVerify = async () => {
    const token = digits.join('');
    if (token.length < 8) {
      setErrorMsg('Introduce el código de 8 dígitos completo.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.verifyOtp({
      email: correo,
      token,
      type: 'email', // signInWithOtp uses 'email' verification type
    });

    if (error) {
      setLoading(false);
      setErrorMsg('Código incorrecto o expirado. Inténtalo de nuevo.');
      return;
    }

    setLoading(false);
    setSuccessMsg('¡Inicio de sesión exitoso! Redirigiendo...');
    setTimeout(() => navigate('/client-dashboard'), 1500);
  };

  const handleResend = async () => {
    setResendCooldown(60);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email: correo,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setErrorMsg('Error al reenviar el código. Inténtalo de nuevo.');
    } else {
      setSuccessMsg('Código reenviado a tu correo.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <AuthCard
      onBack={() => navigate('/client-login')}
      title="Verificar Código"
      subtitle={`Hemos enviado un código de 8 dígitos a ${correo}`}
    >
      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
        className="auth-form"
        style={{ alignItems: 'center' }}
      >
        {/* Icon */}
        <motion.div variants={itemVariants} style={{
          width: '4rem', height: '4rem', borderRadius: '1.25rem',
          background: 'var(--primary-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)', marginBottom: '0.5rem'
        }}>
          <ShieldCheck size={32} strokeWidth={2} />
        </motion.div>

        {/* Banners */}
        {errorMsg && (
          <motion.div variants={itemVariants} className="auth-error-banner" style={{ width: '100%' }}>
            {errorMsg}
          </motion.div>
        )}
        {successMsg && (
          <motion.div variants={itemVariants} className="auth-success-banner" style={{ width: '100%' }}>
            {successMsg}
          </motion.div>
        )}

        {/* OTP Digits */}
        <motion.div variants={itemVariants} className="otp-grid" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="otp-digit"
              id={`otp-digit-${i}`}
            />
          ))}
        </motion.div>

        {/* Submit */}
        <motion.button
          variants={itemVariants}
          onClick={handleVerify}
          disabled={loading || digits.join('').length < 8}
          className="auth-submit-btn"
          style={{ width: '100%' }}
        >
          {loading ? (
            <><Loader2 size={18} className="spin" /> Verificando...</>
          ) : (
            <>Iniciar sesión <ArrowRight size={18} /></>
          )}
        </motion.button>

        {/* Resend */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            ¿No recibiste el código?
          </p>
          <button
            className="auth-resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
          </button>
        </motion.div>
      </motion.div>
    </AuthCard>
  );
};

export default ClientVerifyLoginOTP;
