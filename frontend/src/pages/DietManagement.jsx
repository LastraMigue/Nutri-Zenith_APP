import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Calendar, 
  User, 
  BadgeCheck,
  ArrowLeft,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

const DietManagement = () => {
  const navigate = useNavigate();
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAllDiets();
  }, []);

  const fetchAllDiets = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_diets_with_profiles');
    
    if (error) {
      console.error('Error fetching diets:', error);
    } else {
      setDiets(data || []);
    }
    setLoading(false);
  };

  const filteredAndSortedDiets = diets
    .filter(d => {
      const search = searchTerm.toLowerCase();
      return (
        d.titulo?.toLowerCase().includes(search) ||
        d.descripcion?.toLowerCase().includes(search) ||
        d.creator_nombre?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
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
              onClick={() => navigate('/admin-dashboard')}
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
              <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800' }}>Gestión de Dietas</h1>
              <p style={{ color: 'var(--text-muted)' }}>Explora y administra todos los planes nutricionales.</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/upload-diet')}
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
            Crear Nueva Dieta
          </button>
        </div>

        {/* Card Blanca Principal (Igual que en perfiles) */}
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
          {/* Controles de Búsqueda y Filtro */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Buscador */}
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Buscar por título, descripción o autor..."
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

            {/* Selector de Orden */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit' }}
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Resultados */}
          {loading ? (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
              <Loader2 size={40} className="spin" color="var(--primary)" />
              <p style={{ color: 'var(--text-muted)' }}>Cargando dietas...</p>
            </div>
          ) : filteredAndSortedDiets.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <AnimatePresence>
                {filteredAndSortedDiets.map((diet, index) => (
                  <motion.div
                    key={diet.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
                    {diet.is_verified && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#fff',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '2rem',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        border: '1px solid #dbeafe',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
                      }}>
                        <BadgeCheck size={14} /> VERIFICADA
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'var(--bg-white)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <FileText size={20} />
                      </div>
                      <div style={{ flex: 1, paddingRight: diet.is_verified ? '5rem' : '0' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.2 }}>{diet.titulo}</h3>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{diet.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                          <User size={14} /> {diet.creator_nombre}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <Calendar size={14} /> {new Date(diet.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '700' }}>
                        Ver <ChevronRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: '4rem', height: '4rem', background: 'var(--bg-app)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--border-color)' }}>
                <FileText size={32} />
              </div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Sin resultados</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No se encontraron dietas que coincidan con tu búsqueda.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DietManagement;
