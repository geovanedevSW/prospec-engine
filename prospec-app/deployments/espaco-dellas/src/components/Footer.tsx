import React from 'react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '28px 0',
        background: '#FFF',
        borderTop: '1px solid var(--border)',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}
    >
      <div
        className="container footer-container-doop"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo size={28} />
          <div>
            <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>
              Espaço Dellas Ana Paula Pereira
            </strong>{' '}
            • Baldim - MG
          </div>
        </div>

        <div>© {new Date().getFullYear()} Espaço Dellas. Horário reservado para o seu atendimento.</div>
      </div>
    </footer>
  );
};
