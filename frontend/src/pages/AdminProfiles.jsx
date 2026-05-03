import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';
import { supabase } from '../lib/supabase';

const AdminProfiles = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name_asc'); // name_asc, name_desc, date_new, date_old

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    // Usamos la función RPC segura que el usuario creará en Supabase
    const { data, error } = await supabase.rpc('get_all_profiles');
    
    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const filteredAndSortedProfiles = profiles
    .filter(p => {
      const search = searchTerm.toLowerCase();
      return (
        p.nombre?.toLowerCase().includes(search) ||
        p.correo?.toLowerCase().includes(search) ||
        p.numero?.includes(search)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.nombre || '').localeCompare(b.nombre || '');
        case 'name_desc':
          return (b.nombre || '').localeCompare(a.nombre || '');
        case 'date_new':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_old':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
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
        {/* Header con botón atrás */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/admin-dashboard')}
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800' }}>
              Almacén de Perfiles
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Gestiona y visualiza todos los usuarios registrados en la plataforma.
            </p>
          </div>
        </div>

        {/* Card Blanca Principal */}
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
                placeholder="Buscar por nombre, correo o teléfono..."
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
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: '500'
                  }}
                >
                  <option value="name_asc">Nombre (A-Z)</option>
                  <option value="name_desc">Nombre (Z-A)</option>
                  <option value="date_new">Más recientes primero</option>
                  <option value="date_old">Más antiguos primero</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Resultados */}
          {loading ? (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
              <Loader2 size={40} className="spin" color="var(--primary)" />
              <p style={{ color: 'var(--text-muted)' }}>Cargando perfiles...</p>
            </div>
          ) : filteredAndSortedProfiles.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--bg-app)' }}>
                    <th style={tableHeaderStyle}>Usuario</th>
                    <th style={tableHeaderStyle}>Contacto</th>
                    <th style={tableHeaderStyle}>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredAndSortedProfiles.map((profile, index) => (
                      <motion.tr 
                        key={profile.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ borderBottom: '1px solid var(--bg-app)' }}
                      >
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={avatarStyle}>
                              {profile.nombre?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{profile.nombre || 'Sin nombre'}</span>
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              <Mail size={14} /> {profile.correo}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              <Phone size={14} /> {profile.numero}
                            </div>
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            <Calendar size={16} />
                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No se encontraron perfiles que coincidan con la búsqueda.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

const tableHeaderStyle = {
  padding: '1rem',
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: '700'
};

const tableCellStyle = {
  padding: '1.25rem 1rem'
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-light)',
  color: 'var(--primary-dark)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '0.9rem'
};

export default AdminProfiles;
