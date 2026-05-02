import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './InitialLogin.css';

const InitialLogin = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="landing-container">
      <div className="gradient-bg-light"></div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="main-auth-card"
      >
        {/* Large Logo Section */}
        <div className="logo-section-compact">
          <img 
            src="/logo.png" 
            alt="Nutri-Zenith" 
            className="company-logo-large"
          />
        </div>

        {/* Vertical Selection Buttons */}
        <div className="selection-stack">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01, x: 5 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/login?role=client')}
            className="auth-option-button client-style"
          >
            <div className="option-icon-box">
              <User size={24} />
            </div>
            <div className="option-text-box">
              <span className="option-title">Acceso Cliente</span>
              <span className="option-subtitle">Dietas y seguimiento personal</span>
            </div>
            <ArrowRight size={18} className="arrow-icon" />
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01, x: 5 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/login?role=admin')}
            className="auth-option-button admin-style"
          >
            <div className="option-icon-box">
              <ShieldCheck size={24} />
            </div>
            <div className="option-text-box">
              <span className="option-title">Portal Especialista</span>
              <span className="option-subtitle">Gestión clínica y pacientes</span>
            </div>
            <ArrowRight size={18} className="arrow-icon" />
          </motion.button>
        </div>

        <footer className="card-footer-simple">
          BIENESTAR Y SALUD • 2026
        </footer>
      </motion.div>
    </div>
  );
};

export default InitialLogin;
