import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  BadgeCheck, 
  Calendar, 
  Clock, 
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MEALS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

const ViewDiet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // Estados para edición
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [plan, setPlan] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      const { data, error } = await supabase
        .from('diets')
        .select(`
          *,
          profiles:creator_id (nombre, role)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching diet:', error);
        setErrorMsg('No se pudo encontrar la dieta.');
      } else {
        setDiet(data);
        setTitulo(data.titulo);
        setDescripcion(data.descripcion || '');
        setPlan(data.plan || {});
        // Comparación más robusta del ID del creador
        const isOwner = user && data.creator_id === user.id;
        setIsEditable(isOwner);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleInputChange = (day, meal, value) => {
    if (!isEditable) return;
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: value
      }
    }));
  };

  const handleUpdate = async () => {
    if (!titulo.trim()) {
      setErrorMsg('El título es obligatorio.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('diets')
        .update({
          titulo,
          descripcion,
          plan
        })
        .eq('id', id);

      if (error) throw error;
      setSuccessMsg('¡Cambios guardados con éxito!');
    } catch (err) {
      console.error('Error updating diet:', err);
      setErrorMsg('No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta dieta para siempre?')) return;

    try {
      const { error } = await supabase
        .from('diets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate(-1);
    } catch (err) {
      console.error('Error deleting diet:', err);
      alert('Error al eliminar la dieta.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)' }}>
        <Loader2 size={40} className="spin" color="var(--primary)" />
      </div>
    );
  }

  if (errorMsg && !diet) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)', gap: '1rem' }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '700' }}>{errorMsg}</p>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none' }}>Volver atrás</button>
      </div>
    );
  }

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800' }}>
                  {isEditable ? (
                    <input 
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      style={{ background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary-light)', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', outline: 'none', padding: 0 }}
                    />
                  ) : diet.titulo}
                </h1>
                {diet.is_verified && (
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
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  <User size={16} /> {diet.creator_id === currentUserId ? <span style={{ color: 'var(--primary)' }}>Tú</span> : diet.profiles?.nombre}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <Calendar size={16} /> {new Date(diet.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {isEditable && (
              <>
                <button 
                  onClick={handleDelete}
                  style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={20} /> Eliminar
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={saving}
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
                    boxShadow: '0 4px 14px 0 var(--primary-light)'
                  }}
                >
                  {saving ? <Loader2 size={20} className="spin" /> : <Save size={20} />}
                  Guardar Cambios
                </button>
              </>
            )}
          </div>
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

        {/* Descripción */}
        <div style={{
          background: 'var(--bg-white)',
          padding: '1.5rem 2rem',
          borderRadius: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border-color)'
        }}>
          <label style={{ display: 'block', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción / Notas</label>
          {isEditable ? (
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Añade notas o descripción..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }}
            />
          ) : (
            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: 1.6 }}>{diet.descripcion || 'Sin descripción adicional.'}</p>
          )}
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
                      <td key={`${day}-${meal}`} style={{ 
                        ...tdStyle, 
                        background: isEditable ? 'rgba(37, 99, 235, 0.02)' : 'white' 
                      }}>
                        <textarea 
                          readOnly={!isEditable}
                          value={plan[day]?.[meal] || ''}
                          onChange={(e) => handleInputChange(day, meal, e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '120px',
                            border: 'none',
                            padding: '0.75rem',
                            resize: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontFamily: 'inherit',
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                            cursor: isEditable ? 'text' : 'default',
                            caretColor: '#000000'
                          }}
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

export default ViewDiet;
