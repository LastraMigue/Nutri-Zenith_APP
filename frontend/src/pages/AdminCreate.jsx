import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  User, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  Save,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AuthCard from '../components/AuthCard';

// Cliente secundario para no interferir con la sesión actual
const supabaseSecondary = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AdminCreate = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Password
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Timer para el reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  // 1. Iniciar registro (Validación + Envío OTP)
  const handleStartRegistration = async (e) => {
    if (e) e.preventDefault();
    if (!nombre || !email) {
      setErrorMsg('Nombre y correo son obligatorios.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    
    try {
      // SEGURIDAD: Verificar si el correo ya existe en perfiles
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('correo', email.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        setErrorMsg(`Acceso vetado: Este correo ya está registrado como ${existingUser.role}.`);
        setLoading(false);
        return;
      }

      // Proceder con el envío de OTP (Método original)
      const { error } = await supabaseSecondary.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: { nombre, role: 'admin' }
        }
      });

      if (error) throw error;
      
      setStep(2);
      setResendCooldown(60); 
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    handleStartRegistration();
  };

  // Lógica de cuadrícula OTP (igual que clientes)
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
    pasted.split('').forEach((char, i) => { if (newDigits[i] !== undefined) newDigits[i] = char; });
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 7)]?.focus();
  };

  // 2. Verificar OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const token = digits.join('');
    if (token.length < 8) {
      setErrorMsg('Introduce el código completo.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Intentamos validar según el orden de prioridad: signup -> invite -> magiclink
      const { error } = await supabaseSecondary.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        // Probamos como invitación si el signup falla
        const { error: inviteError } = await supabaseSecondary.auth.verifyOtp({
          email,
          token,
          type: 'invite'
        });
        
        if (inviteError) {
          // Último recurso: magiclink
          const { error: magicError } = await supabaseSecondary.auth.verifyOtp({
            email,
            token,
            type: 'magiclink'
          });
          if (magicError) throw magicError;
        }
      }

      setStep(3);
      setSuccessMsg('Correo verificado.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Establecer Password
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user }, error: updateError } = await supabaseSecondary.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        nombre: nombre,
        correo: email,
        role: 'admin'
      });

      if (profileError) throw profileError;

      setSuccessMsg('¡Administrador creado!');
      await supabaseSecondary.auth.signOut();
      setTimeout(() => navigate('/admin-dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al finalizar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      onBack={() => step === 1 ? navigate('/admin-dashboard') : setStep(step - 1)}
      title={step === 1 ? "Añadir administrador" : step === 2 ? "Verificar Código" : "Seguridad"}
      subtitle={
        step === 1 ? "Registra un nuevo especialista" : 
        step === 2 ? `Hemos enviado un código de 8 dígitos a ${email}` : 
        "Crea una contraseña para el nuevo acceso"
      }
    >
      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
        className="auth-form"
        style={step === 2 ? { alignItems: 'center' } : {}}
      >
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="auth-error-banner" style={{ width: '100%' }}>
              {errorMsg}
            </motion.div>
          )}
          {/* Eliminamos el banner de success automático para que no estorbe */}
        </AnimatePresence>

        {/* STEP 1: Info Básica */}
        {step === 1 && (
          <form onSubmit={handleStartRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            <motion.div variants={itemVariants} className="auth-field">
              <label className="auth-label">Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                <input 
                  required
                  type="text"
                  placeholder="Nombre del especialista"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="auth-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="auth-field">
              <label className="auth-label">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                <input 
                  required
                  type="email"
                  placeholder="especialista@nutrizenith.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              disabled={loading}
              type="submit"
              className="auth-submit-btn"
            >
              {loading ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
              Continuar
            </motion.button>
          </form>
        )}

        {/* STEP 2: OTP (Estilo Cliente) */}
        {step === 2 && (
          <>
            <motion.div variants={itemVariants} style={{
              width: '4rem', height: '4rem', borderRadius: '1.25rem',
              background: 'var(--primary-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)', marginBottom: '1.5rem'
            }}>
              <ShieldCheck size={32} />
            </motion.div>

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
                />
              ))}
            </motion.div>

            <motion.button 
              variants={itemVariants}
              disabled={loading || digits.join('').length < 8}
              onClick={handleVerifyOTP}
              className="auth-submit-btn"
              style={{ width: '100%', marginTop: '2rem' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <CheckCircle2 size={18} />}
              Verificar Identidad
            </motion.button>

            {/* Reenvío de código */}
            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '1.5rem' }}>
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
          </>
        )}

        {/* STEP 3: Password */}
        {step === 3 && (
          <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            <motion.div variants={itemVariants} className="auth-field">
              <label className="auth-label">Establecer Contraseña</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                <input 
                  required
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="auth-field">
              <label className="auth-label">Repetir Contraseña</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.7 }} />
                <input 
                  required
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              disabled={loading}
              type="submit"
              className="auth-submit-btn"
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              Finalizar Registro
            </motion.button>
          </form>
        )}
      </motion.div>
    </AuthCard>
  );
};

export default AdminCreate;


