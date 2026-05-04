import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Barcode,
  Search,
  Zap,
  Info,
  BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

const QUALITY_OPTIONS = [
  { value: 1, icon: '😢', label: 'Mala', color: '#ef4444' },
  { value: 2, icon: '😕', label: 'Regular', color: '#f97316' },
  { value: 3, icon: '😐', label: 'Aceptable', color: '#eab308' },
  { value: 4, icon: '🙂', label: 'Buena', color: '#84cc16' },
  { value: 5, icon: '😍', label: 'Excelente', color: '#22c55e' }
];

const UploadProduct = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [nombre, setNombre] = useState('');
  const [kcal, setKcal] = useState('');
  const [calidad, setCalidad] = useState(3);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [barcodeValid, setBarcodeValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserRole(data?.role);
      }
    };
    getRole();
  }, []);

  const lookupBarcode = async () => {
    if (!barcode.trim()) {
      setBarcodeValid(false);
      return;
    }
    setSearching(true);
    setErrorMsg('');
    setBarcodeValid(false);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        setNombre(data.product.product_name || '');
        const energyKcal = data.product.nutriments?.['energy-kcal_100g'];
        if (energyKcal) setKcal(Math.round(energyKcal));
        setBarcodeValid(true);
        setSuccessMsg('¡Producto validado correctamente!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg('El código de barras no existe. Por favor, introduce uno válido o deja el campo vacío.');
      }
    } catch (err) {
      console.error('Error lookup:', err);
      setErrorMsg('Error al conectar con el servicio de validación.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    setBarcodeValid(false);
  }, [barcode]);

  const handleSave = async () => {
    if (!nombre.trim() || !kcal) {
      setErrorMsg('El nombre y las Kilocalorías son obligatorios.');
      return;
    }

    if (barcode.trim() && !barcodeValid) {
      setErrorMsg('El código de barras introducido no es válido. Pulsa "Buscar" para validarlo o bórralo.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('products')
        .insert([{
          creator_id: user.id,
          nombre,
          kcal: parseInt(kcal),
          barcode,
          calidad,
          is_verified: userRole === 'admin'
        }]);

      if (error) throw error;

      setSuccessMsg('¡Producto guardado correctamente!');
      setTimeout(() => navigate('/admin/products'), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar el producto.');
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
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/admin/products')}
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
                Subir Producto 
                {userRole === 'admin' && (
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
                    <BadgeCheck size={16} /> VERIFICADO
                  </span>
                )}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>Añade un nuevo producto recomendado al catálogo.</p>
            </div>
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

        {/* Formulario */}
        <div style={{
          background: 'var(--bg-white)',
          padding: '2.5rem',
          borderRadius: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Código de Barras */}
          <section>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              <Barcode size={18} color="var(--primary)" /> Código de Barras (Opcional)
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text"
                placeholder="Ej: 8410000000000"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
              />
              <button 
                onClick={lookupBarcode}
                disabled={searching}
                style={{
                  background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                {searching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
                Buscar
              </button>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Info size={14} /> Introduce el código para autocompletar los datos.
            </p>
          </section>

          {/* Nombre y Kcal */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Nombre del Producto</label>
              <input 
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                <Zap size={18} color="#f59e0b" /> Kcal (100g)
              </label>
              <input 
                type="number"
                placeholder="0"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Calidad Nutricional (Caritas) */}
          <section>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Calidad Nutricional Recomendada</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {QUALITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCalidad(opt.value)}
                  style={{
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: '2px solid',
                    borderColor: calidad === opt.value ? opt.color : 'var(--border-color)',
                    background: calidad === opt.value ? `${opt.color}15` : 'var(--bg-app)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: calidad === opt.value ? opt.color : 'var(--text-muted)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Botón Guardar */}
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '1.25rem',
              borderRadius: '1rem',
              fontWeight: '800',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px var(--primary-light)',
              marginTop: '1rem'
            }}
          >
            {loading ? <Loader2 size={24} className="spin" /> : <Save size={24} />}
            Guardar Producto
          </button>
        </div>
      </main>
    </div>
  );
};

export default UploadProduct;
