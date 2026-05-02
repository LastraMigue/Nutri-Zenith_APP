import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './AuthCard.css';

const AuthCard = ({ 
  children, 
  onBack, 
  title, 
  subtitle, 
  footerText = "BIENESTAR Y SALUD • 2026" 
}) => {
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

  return (
    <div className="auth-page-wrapper">
      <div className="gradient-bg-light"></div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="auth-card-main"
      >
        {onBack && (
          <button 
            onClick={onBack}
            className="auth-back-button"
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="auth-logo-container">
          <img 
            src="/logo.png" 
            alt="Nutri-Zenith" 
            className="auth-logo-img"
          />
        </div>

        {(title || subtitle) && (
          <div className="auth-header">
            {title && <h2 className="auth-header-title">{title}</h2>}
            {subtitle && <p className="auth-header-subtitle">{subtitle}</p>}
          </div>
        )}

        <div className="auth-button-stack">
          {children}
        </div>

        <footer className="auth-card-footer">
          {footerText}
        </footer>
      </motion.div>
    </div>
  );
};

export const AuthOption = ({ icon: Icon, title, subtitle, onClick, variants }) => (
  <motion.button
    variants={variants}
    whileHover={{ scale: 1.01, x: 5 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className="auth-action-button"
  >
    <div className="auth-icon-container">
      <Icon size={24} />
    </div>
    <div className="auth-text-container">
      <span className="auth-button-title">{title}</span>
      <span className="auth-button-subtitle">{subtitle}</span>
    </div>
    <ArrowRight size={18} className="auth-arrow" />
  </motion.button>
);

export default AuthCard;
