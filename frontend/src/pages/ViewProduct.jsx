import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  BadgeCheck, 
  Calendar, 
  User, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Barcode,
  Zap,
  Info
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // Estados para edición
  const [nombre, setNombre] = useState('');
  const [kcal, setKcal] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calidad, setCalidad] = useState(3);
  const [barcodeValid, setBarcodeValid] = useState(true); // Asumimos true al cargar si ya tiene uno

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:creator_id (nombre, role)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        setErrorMsg('No se pudo encontrar el producto.');
      } else {
        setProduct(data);
        setNombre(data.nombre);
        setKcal(data.kcal);
        setBarcode(data.barcode || '');
        setImageUrl(data.image_url || '');
        setCalidad(data.calidad || 3);
        setBarcodeValid(true);
        
        const isOwner = user && data.creator_id === user.id;
        setIsEditable(isOwner);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    // Si el barcode actual es diferente al original del producto, invalidamos
    if (product && barcode !== (product.barcode || '')) {
      setBarcodeValid(false);
      // Si el código cambia o se borra, quitamos la imagen antigua para no confundir
      setImageUrl('');
    } else if (product && barcode === (product.barcode || '')) {
      setBarcodeValid(true);
      // Restauramos la imagen original si volvemos al código original
      setImageUrl(product.image_url || '');
    }
  }, [barcode, product]);

  const handleUpdate = async () => {
    if (!nombre.trim() || !kcal) {
      setErrorMsg('El nombre y las Kilocalorías son obligatorios.');
      return;
    }

    if (barcode.trim() && !barcodeValid) {
      setErrorMsg('El código de barras ha cambiado. Debes validarlo pulsando "Buscar" o dejarlo como estaba.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('products')
        .update({
          nombre,
          kcal: parseInt(kcal),
          barcode,
          calidad,
          image_url: imageUrl
        })
        .eq('id', id);

      if (error) throw error;
      setSuccessMsg('¡Cambios guardados con éxito!');
    } catch (err) {
      console.error('Error updating product:', err);
      setErrorMsg('No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este producto para siempre?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate('/admin/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)' }}>
        <Loader2 size={40} className="spin" color="var(--primary)" />
      </div>
    );
  }

  if (errorMsg && !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-app)', gap: '1rem' }}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '700' }}>{errorMsg}</p>
        <button onClick={() => navigate('/admin/products')} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none' }}>Volver a la lista</button>
      </div>
    );
  }

  const currentQuality = QUALITY_OPTIONS.find(o => o.value === calidad) || QUALITY_OPTIONS[2];

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
        maxWidth: '1000px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {imageUrl && (
                <div style={{ 
                  width: '5rem', height: '5rem', borderRadius: '1rem', background: 'white', 
                  boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)', 
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <img src={imageUrl} alt="Producto" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ 
                  color: 'var(--text-main)', 
                  fontSize: '2rem', 
                  fontWeight: '800', 
                  margin: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {isEditable ? (
                    <input 
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      style={{ background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary-light)', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', outline: 'none', padding: 0, width: '100%' }}
                    />
                  ) : product.nombre}
                </h1>
                {product.is_verified && (
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
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    <BadgeCheck size={16} /> VERIFICADO
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  <User size={16} /> {product.creator_id === currentUserId ? <span style={{ color: 'var(--primary)' }}>Tú</span> : product.profiles?.nombre}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <Calendar size={16} /> {new Date(product.created_at).toLocaleDateString()}
                </div>
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

        {/* Contenido Principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Info Nutricional */}
            <div style={{
              background: 'var(--bg-white)',
              padding: '2rem',
              borderRadius: '1.5rem',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    <Zap size={18} color="#f59e0b" /> Kilocalorías
                  </label>
                  {isEditable ? (
                    <input 
                      type="number"
                      value={kcal}
                      onChange={(e) => setKcal(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{product.kcal} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kcal / 100g</span></div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    <Barcode size={18} color="var(--primary)" /> Código de Barras
                  </label>
                  {isEditable ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-app)', fontFamily: 'inherit' }}
                      />
                      <button 
                        onClick={async () => {
                          if (!barcode.trim()) return;
                          setSaving(true);
                          setErrorMsg('');
                          try {
                            const resp = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
                            const d = await resp.json();
                            if (d.status === 1) {
                              setNombre(d.product.product_name || nombre);
                              const en = d.product.nutriments?.['energy-kcal_100g'];
                              if (en) setKcal(Math.round(en));
                              if (d.product.image_front_url) setImageUrl(d.product.image_front_url);
                              setBarcodeValid(true);
                              setSuccessMsg('¡Producto validado y datos actualizados!');
                              setTimeout(() => setSuccessMsg(''), 3000);
                            } else {
                              setErrorMsg('Código no encontrado en la base de datos global.');
                              setBarcodeValid(false);
                            }
                          } catch (e) { 
                            setErrorMsg('Error al conectar con el servicio.'); 
                            setBarcodeValid(false);
                          }
                          finally { setSaving(false); }
                        }}
                        style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}
                      >
                        Buscar
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>{product.barcode || 'Sin código'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Calidad Nutricional */}
            <div style={{
              background: 'var(--bg-white)',
              padding: '2rem',
              borderRadius: '1.5rem',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--border-color)'
            }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Calidad Nutricional</label>
              
              {isEditable ? (
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
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2rem', 
                  background: `${currentQuality.color}08`, 
                  padding: '2rem', 
                  borderRadius: '1.25rem',
                  border: `1px dashed ${currentQuality.color}`
                }}>
                  <div style={{ fontSize: '4rem' }}>{currentQuality.icon}</div>
                  <div>
                    <h2 style={{ margin: 0, color: currentQuality.color, fontSize: '2rem', fontWeight: '900' }}>{currentQuality.label}</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>Valoración nutricional del especialista</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Extra Info */}
          <div style={{
            background: 'var(--bg-white)',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid var(--border-color)',
            height: 'fit-content'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1rem', fontWeight: '800' }}>Información</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Autor:</span>
                <span style={{ fontWeight: '700' }}>{product.profiles?.nombre}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fecha:</span>
                <span style={{ fontWeight: '700' }}>{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--bg-app)', pt: '1rem', marginTop: '0.5rem' }}>
                {/* Texto profesional eliminado permanentemente */}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ViewProduct;
