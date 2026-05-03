import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Package, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import fondo from '../assets/fondo.jpg';

const AdminDashboard = () => {
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

      {/* Contenido Principal */}
      <main style={{
        flex: 1,
        padding: '3rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{ color: 'var(--text-main)', fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            Portal de Administración
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Bienvenido, selecciona una de las opciones para gestionar la plataforma.
          </p>
        </motion.div>

        {/* Grid de opciones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Card 1: Perfiles */}
          <ActionCard 
            icon={<Users size={32} />}
            title="Ver almacén de todos los perfiles"
            onClick={() => console.log('Navegar a perfiles')}
            color="var(--primary)"
          />

          {/* Card 2: Dietas */}
          <ActionCard 
            icon={<FileText size={32} />}
            title="Subir dietas verificadas"
            onClick={() => console.log('Subir dietas')}
            color="#0ea5e9"
          />

          {/* Card 3: Productos */}
          <ActionCard 
            icon={<Package size={32} />}
            title="Subir productos recomendados verificados"
            onClick={() => console.log('Subir productos')}
            color="#8b5cf6"
          />

          {/* Card 4: Añadir Admin */}
          <ActionCard 
            icon={<UserPlus size={32} />}
            title="Añadir otros administradores"
            onClick={() => console.log('Añadir administradores')}
            color="#f59e0b"
          />
        </div>
      </main>
    </div>
  );
};

// Componente auxiliar para las tarjetas de acción
const ActionCard = ({ icon, title, onClick, color }) => {
  return (
    <motion.button
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: 'var(--bg-white)',
        borderRadius: '1.5rem',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-soft)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'border-color 0.3s ease',
        height: '100%',
        minHeight: '200px'
      }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = color}
      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      <div style={{
        background: `${color}15`,
        color: color,
        padding: '1.5rem',
        borderRadius: '1rem',
        marginBottom: '1.5rem'
      }}>
        {icon}
      </div>
      <h3 style={{ 
        color: 'var(--text-main)', 
        fontSize: '1.25rem', 
        fontWeight: 'bold',
        lineHeight: 1.3
      }}>
        {title}
      </h3>
    </motion.button>
  );
};

export default AdminDashboard;
