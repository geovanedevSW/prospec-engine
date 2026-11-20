import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  height?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'dark', height = 48 }) => {
  return (
    <a 
      href="#" 
      className="brand-logo-container" 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        flexShrink: 0
      }}
      aria-label="DS Odontologia"
    >
      {/* Logotipo Odontológico Roxo com Sorriso */}
      <img
        src="./images/logo-sorriso.png"
        alt="DS Odontologia Sorriso"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
      />
      {/* Logo Escrita: Betim | Contagem */}
      <img
        src="./images/logo-escrita.png"
        alt="DS Odontologia Betim e Contagem"
        style={{
          height: `${Math.round(height * 0.72)}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          filter: variant === 'light' ? 'brightness(0) invert(1)' : 'none'
        }}
      />
    </a>
  );
};

