import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Calendar, 
  User, 
  BadgeCheck,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Trash2,
  Barcode,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

const QUALITY_FACES = {
  1: { icon: '😢', label: 'Mala', color: '#ef4444' },
  2: { icon: '😕', label: 'Regular', color: '#f97316' },
  3: { icon: '😐', label: 'Aceptable', color: '#eab308' },
  4: { icon: '🙂', label: 'Buena', color: '#84cc16' },
  5: { icon: '😍', label: 'Excelente', color: '#22c55e' }
};

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'admins', 'mine'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
      fetchProducts();
    };
    init();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:creator_id (nombre, role)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const normalizedData = data.map(p => ({
        ...p,
        creator_nombre: p.profiles?.nombre || 'Desconocido',
        creator_role: p.profiles?.role || 'user'
      }));
      setProducts(normalizedData);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    if (!window.confirm('¿Deseas eliminar este producto?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar.');
    }
  };

  const filteredAndSortedProducts = products
    .filter(p => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (
        p.nombre?.toLowerCase().includes(search) ||
        p.barcode?.includes(search) ||
        p.creator_nombre?.toLowerCase().includes(search)
      );
      
      if (activeTab === 'mine') return matchesSearch && p.creator_id === currentUserId;
      if (activeTab === 'admins') return matchesSearch && p.creator_role === 'admin';
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'quality_desc') return b.calidad - a.calidad;
      if (sortBy === 'quality_asc') return a.calidad - b.calidad;
      if (sortBy === 'kcal_desc') return b.kcal - a.kcal;
      if (sortBy === 'kcal_asc') return a.kcal - b.kcal;
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return new Date(a.created_at) - new Date(b.created_at);
    });

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
              <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800' }}>
                {isAdmin ? 'Gestión de Productos' : 'Productos'}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                {isAdmin ? 'Gestiona el catálogo de productos recomendados.' : 'Explora productos y recomendaciones nutricionales.'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate(isAdmin ? '/admin/products/upload' : '/subir-producto')}
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
            <Plus size={20} />
            {isAdmin ? 'Añadir Producto' : 'Subir Mi Producto'}
          </button>
        </div>

        {/* Card Principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-white)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* Tabs */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-app)', paddingBottom: '1rem' }}>
              {['all', 'admins', 'mine'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: activeTab === tab ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab === 'all' ? 'Todos' : tab === 'admins' ? 'Especialistas' : 'Mis productos'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Buscar por nombre o código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    fontSize: '1rem',
                    outline: 'none',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' }}
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="quality_desc">Calidad: Mayor a Menor</option>
                  <option value="quality_asc">Calidad: Menor a Mayor</option>
                  <option value="kcal_desc">Kcal: Mayor a Menor</option>
                  <option value="kcal_asc">Kcal: Menor a Mayor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Productos */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Loader2 size={40} className="spin" color="#8b5cf6" />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando productos...</p>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <AnimatePresence>
                {filteredAndSortedProducts.map((p, i) => {
                  const quality = QUALITY_FACES[p.calidad] || QUALITY_FACES[3];
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      onClick={() => navigate(isAdmin ? `/admin/products/${p.id}` : `/ver-producto/${p.id}`)}
                      style={{
                        background: 'var(--bg-app)',
                        borderRadius: '1.25rem',
                        padding: '1.5rem',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}
                    >
                      {/* Badge Verificado */}
                      {p.is_verified && (
                        <div style={{
                          position: 'absolute', top: '1rem', right: '1rem', color: '#2563eb',
                          display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff',
                          padding: '0.25rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '800',
                          border: '1px solid #dbeafe', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
                        }}>
                          <BadgeCheck size={14} /> VERIFICADO
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '4.5rem', height: '4.5rem', borderRadius: '1rem', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)',
                          overflow: 'hidden', position: 'relative'
                        }}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }} />
                          ) : quality.icon}
                          
                          {p.image_url && (
                            <div style={{
                              position: 'absolute', bottom: 0, right: 0, background: 'rgba(255,255,255,0.9)',
                              borderRadius: '0.5rem 0 0 0', padding: '0.1rem', fontSize: '1rem',
                              borderLeft: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)'
                            }}>
                              {quality.icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{p.nombre}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: quality.color, background: `${quality.color}15`, padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                              Calidad: {quality.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Energía</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: '800' }}>
                            <Zap size={14} /> {p.kcal} <span style={{ fontSize: '0.7rem' }}>kcal</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '1px solid var(--bg-app)', paddingLeft: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Código</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '600' }}>
                            <Barcode size={14} /> {p.barcode || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                            <User size={14} /> {p.creator_id === currentUserId ? <span style={{ color: 'var(--primary)' }}>Tú</span> : p.creator_nombre}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {p.creator_id === currentUserId && (
                            <button onClick={(e) => handleDeleteProduct(e, p.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '700' }}>
                            Ver <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No hay productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ProductManagement;
