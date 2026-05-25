import React from 'react';

export interface ButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  label = 'Remote Button', 
  onClick,
  variant = 'primary'
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: '20px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)',
  };

  const buttonStyles: React.CSSProperties = {
    padding: '16px 32px',
    fontSize: '18px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: variant === 'primary' ? '#0070f3' : '#666',
    color: 'white',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    minWidth: '250px',
  };

  const infoStyles: React.CSSProperties = {
    marginTop: '15px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#333',
    fontWeight: 'normal',
  };

  return (
    <div style={containerStyles}>
      <button 
        style={buttonStyles} 
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        }}
      >
        {label}
      </button>
      <div style={infoStyles}>
        🎯 <strong>Componente remoto</strong> renderizado desde React standalone
      </div>
    </div>
  );
};

export default Button;
