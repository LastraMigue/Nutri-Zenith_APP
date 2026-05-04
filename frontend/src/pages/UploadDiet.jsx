import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

const UploadDiet = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // Inicializar el plan vacío (7 días x 4 comidas)
  const [plan, setPlan] = useState(() => {
    const initialPlan = {};
    DAYS.forEach(day => {
      initialPlan[day] = {};
      MEALS.forEach(meal => {
        initialPlan[day][meal] = '';
      });
    });
    return initialPlan;
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    getUser();
  }, []);

  const handleInputChange = (day, meal, value) => {
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value
      }
    }));
    setErrorMsg('');
  };

  const validatePlan = () => {
    if (!titulo.trim()) return 'El título de la dieta es obligatorio.';
    for (const day of DAYS) {
      for (const meal of MEALS) {
        if (!plan[day][meal].trim()) {
          return `Falta rellenar: ${day} - ${meal}`;
        }
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validatePlan();
    if (error) {
      setErrorMsg(error);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Asegurarnos de tener el perfil más reciente antes de guardar
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const { error: insertError } = await supabase
        .from('diets')
        .insert([{
          creator_id: user.id,
          titulo,
          descripcion,
          plan,
          is_verified: profile?.role === 'admin'
        }]);

      if (insertError) throw insertError;

      setSuccessMsg('¡Dieta guardada y verificada correctamente!');
      setTimeout(() => navigate('/admin/diets'), 2000);
    } catch (err) {
      setErrorMsg('Error al guardar la dieta. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-app)',
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url(${fondo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <Navbar />

      <main style={{
        flex: 1,
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Subir Dieta 
                <span style={{ 
                  color: '#2563eb', 
                  fontSize: '0.8rem', 
                  background: '#eff6ff', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '2rem',
                  border: '1px solid #dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
                }}>
                  <BadgeCheck size={16} /> VERIFICADA
                </span>
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>Completa el plan nutricional semanal.</p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px var(--primary-light)'
            }}
          >
            {loading ? <Loader2 size={20} className="spin" /> : <Save size={20} />}
            Guardar Dieta
          </button>
        </div>

        {/* Mensajes */}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
            background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fecaca'
          }}>
            <AlertCircle size={20} /> {errorMsg}
          </motion.div>
        )}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
            background: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #bbf7d0'
          }}>
            <CheckCircle2 size={20} /> {successMsg}
          </motion.div>
        )}

        {/* Formulario Superior */}
        <div style={{
          background: 'var(--bg-white)',
          padding: '2rem',
          borderRadius: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '2rem'
        }}>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Título del Plan</label>
            <input 
              type="text"
              placeholder="Ej: Dieta Hipercalórica Verano"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Descripción / Notas (Opcional)</label>
            <input 
              type="text"
              placeholder="Ej: Ideal para ganar masa muscular. Beber 2L de agua."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Tabla de Dieta */}
        <div style={{
          background: 'var(--bg-white)',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '150px' }}>Comida / Día</th>
                  {DAYS.map(day => (
                    <th key={day} style={thStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} /> {day}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEALS.map(meal => (
                  <tr key={meal} style={{ borderBottom: '1px solid var(--bg-app)' }}>
                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--primary)', background: 'var(--bg-app)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={16} />
                        {meal}
                      </div>
                    </td>
                    {DAYS.map(day => (
                      <td key={`${day}-${meal}`} style={tdStyle}>
                        <textarea 
                          placeholder={`Detalle ${meal}...`}
                          value={plan[day][meal]}
                          onChange={(e) => handleInputChange(day, meal, e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            border: 'none',
                            padding: '0.5rem',
                            resize: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => e.target.parentElement.style.background = '#f0fdf4'}
                          onBlur={(e) => e.target.parentElement.style.background = 'transparent'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

const thStyle = {
  padding: '1.25rem',
  color: 'var(--primary)',
  fontSize: '0.9rem',
  fontWeight: '800',
  textAlign: 'center',
  borderBottom: '2px solid var(--border-color)',
  borderRight: '1px solid var(--border-color)',
  background: 'var(--bg-app)'
};

const tdStyle = {
  padding: '0',
  borderRight: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)',
  transition: 'background 0.2s'
};

export default UploadDiet;
