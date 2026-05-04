import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Flame, 
  Utensils, 
  Droplets, 
  Footprints, 
  Scale, 
  Calendar,
  Search,
  ArrowUpDown,
  ChevronRight,
  Loader2,
  History,
  CloudCheck,
  Cloud
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

// Función debounce nativa para evitar dependencias externas
const createDebounce = (callback, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), wait);
  };
};

const DailyConsumption = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentRecord, setCurrentRecord] = useState({
    kcal_consumed: 0,
    kcal_burned: 0,
    water_ml: 0,
    steps: 0,
    weight: '',
    notes: ''
  });

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching records:', error);
      } else if (data) {
        setRecords(data);
        const todayData = data.find(r => r.date === todayStr);
        if (todayData) {
          setCurrentRecord({
            ...todayData,
            weight: todayData.weight || ''
          });
        }
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función de auto-guardado con debounce nativo (espera 1s después de dejar de escribir)
  const debouncedSave = useCallback(
    createDebounce(async (record) => {
      // Verificar si el registro está totalmente vacío antes de intentar guardar
      const isEmpty = 
        (parseInt(record.kcal_consumed) || 0) === 0 &&
        (parseInt(record.kcal_burned) || 0) === 0 &&
        (parseInt(record.water_ml) || 0) === 0 &&
        (parseInt(record.steps) || 0) === 0 &&
        !record.weight &&
        !record.notes;

      if (isEmpty) return; // No guardamos nada si no hay datos introducidos

      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('daily_records')
          .upsert({
            user_id: user.id,
            date: todayStr,
            kcal_consumed: parseInt(record.kcal_consumed) || 0,
            kcal_burned: parseInt(record.kcal_burned) || 0,
            water_ml: parseInt(record.water_ml) || 0,
            steps: parseInt(record.steps) || 0,
            weight: record.weight ? parseFloat(record.weight) : null,
            notes: record.notes
          }, { onConflict: 'user_id, date' })
          .select()
          .single();

        if (!error && data) {
          setRecords(prev => {
            const filtered = prev.filter(r => r.date !== todayStr);
            return [data, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
          });
        }
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setSaving(false);
      }
    }, 1000),
    [todayStr]
  );

  // Manejar cambios en los inputs (solo si es hoy)
  const handleChange = (field, value) => {
    if (!isToday) return;
    const updated = { ...currentRecord, [field]: value };
    setCurrentRecord(updated);
    debouncedSave(updated);
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => (r.date || '').includes(searchTerm))
      .sort((a, b) => {
        return sortBy === 'newest' 
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      })
      .slice(0, 12); // Límite de 12 días en el historial
  }, [records, searchTerm, sortBy]);

  // Gráfica Manual Bézier
  const chartConfig = useMemo(() => {
    const sorted = [...records]
      .filter(r => r.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);
    
    if (sorted.length === 0) return { points: [], path: '', area: '' };
    
    const maxKcal = Math.max(...sorted.map(r => r.kcal_consumed || 0), 2500);
    const points = sorted.map((r, i) => ({
      x: sorted.length > 1 ? (i / (sorted.length - 1)) * 100 : 50,
      y: 100 - ((r.kcal_consumed || 0) / maxKcal) * 100,
      date: (r.date || '').split('-').slice(1).reverse().join('/'),
      val: r.kcal_consumed
    }));

    if (points.length < 2) return { points, path: '', area: '' };

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      path += ` C ${xMid},${points[i].y} ${xMid},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }
    const area = `${path} L ${points[points.length-1].x},100 L ${points[0].x},100 Z`;
    return { points, path, area };
  }, [records]);

  const viewPastDate = (record) => {
    setSelectedDate(record.date);
    setCurrentRecord({ ...record, weight: record.weight || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetToToday = () => {
    setSelectedDate(todayStr);
    const todayData = records.find(r => r.date === todayStr);
    setCurrentRecord(todayData || {
      kcal_consumed: 0, kcal_burned: 0, water_ml: 0, steps: 0, weight: '', notes: ''
    });
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
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/client-dashboard')} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '0.5rem', cursor: 'pointer', boxShadow: 'var(--shadow-soft)' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800' }}>Mi Consumo Diario</h1>
              <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isToday ? 'Registra tu actividad de hoy' : `Consultando el día ${selectedDate}`}
                {isToday && (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', background: saving ? '#fff7ed' : '#f0fdf4', color: saving ? '#c2410c' : '#15803d', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {saving ? <Loader2 size={12} className="spin" /> : <div style={{width: 6, height: 6, borderRadius: '50%', background: '#15803d'}} />}
                    {saving ? 'Guardando...' : 'Sincronizado'}
                  </span>
                )}
              </p>
            </div>
          </div>
          {!isToday && (
            <button onClick={resetToToday} style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Volver a Hoy
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Consumidas', val: currentRecord.kcal_consumed || 0, icon: <Utensils size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'Quemadas', val: currentRecord.kcal_burned || 0, icon: <Flame size={20} />, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Balance Neto', val: (parseInt(currentRecord.kcal_consumed) || 0) - (parseInt(currentRecord.kcal_burned) || 0), icon: <TrendingUp size={20} />, color: '#10b981', bg: '#f0fdf4' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'white', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: stat.bg, color: stat.color, padding: '0.75rem', borderRadius: '1rem' }}>{stat.icon}</div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{stat.val} <span style={{ fontSize: '0.9rem' }}>kcal</span></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Formulario */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)', position: 'relative' }}>
              {!isToday && <div style={{ position: 'absolute', top: 0, right: 0, background: '#fef3c7', color: '#92400e', padding: '0.5rem 1.5rem', borderRadius: '0 0 0 1.5rem', fontSize: '0.8rem', fontWeight: '800' }}>MODO LECTURA</div>}
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {isToday ? <Plus size={24} color="var(--primary)" /> : <History size={24} color="var(--primary)" />}
                {isToday ? 'Registro Diario' : `Registro del ${selectedDate}`}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem' }}><Utensils size={18} color="#8b5cf6" /> Ingeridas</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" disabled={!isToday} value={currentRecord.kcal_consumed} onChange={(e) => handleChange('kcal_consumed', e.target.value)} style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none', fontWeight: '700' }} />
                    {isToday && <button onClick={() => handleChange('kcal_consumed', (parseInt(currentRecord.kcal_consumed) || 0) + 100)} style={{ padding: '0.5rem', background: '#f5f3ff', color: '#8b5cf6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}><Plus size={16}/></button>}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem' }}><Flame size={18} color="#f59e0b" /> Quemadas</label>
                  <input type="number" disabled={!isToday} value={currentRecord.kcal_burned} onChange={(e) => handleChange('kcal_burned', e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none', fontWeight: '700' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem' }}><Droplets size={18} color="#3b82f6" /> Agua (ml)</label>
                  <input type="number" disabled={!isToday} value={currentRecord.water_ml} onChange={(e) => handleChange('water_ml', e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem' }}><Footprints size={18} color="#10b981" /> Pasos</label>
                  <input type="number" disabled={!isToday} value={currentRecord.steps} onChange={(e) => handleChange('steps', e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem' }}><Scale size={18} color="#6366f1" /> Peso (kg)</label>
                  <input type="number" step="0.1" disabled={!isToday} value={currentRecord.weight} onChange={(e) => handleChange('weight', e.target.value)} style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.75rem' }}>Notas</label>
                  <textarea disabled={!isToday} value={currentRecord.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-app)', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>
            </motion.div>

            {/* Gráfica */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Evolución Semanal</h3>
              <div style={{ height: '250px', width: '100%', position: 'relative', background: '#f8fafc', borderRadius: '1.25rem', padding: '1rem' }}>
                {chartConfig.points.length > 1 ? (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
                    {[0, 25, 50, 75, 100].map(v => <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />)}
                    {chartConfig.path && <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} d={chartConfig.path} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />}
                    {chartConfig.area && <path d={chartConfig.area} fill="url(#g)" />}
                    {chartConfig.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill="#8b5cf6" />)}
                  </svg>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', padding: '0 2rem' }}>
                    Registra al menos 2 días para ver tu evolución gráfica
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={20} color="var(--primary)" /> Historial (Máx. 12)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
                {filteredRecords.map((r) => (
                  <button key={r.id} onClick={() => viewPastDate(r)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '1rem', border: '1px solid', borderColor: selectedDate === r.date ? 'var(--primary)' : 'var(--border-color)', background: selectedDate === r.date ? 'var(--primary-light)' : 'var(--bg-app)', cursor: 'pointer', textAlign: 'left' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{r.date === todayStr ? 'Hoy' : r.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.kcal_consumed} kcal</div>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyConsumption;
