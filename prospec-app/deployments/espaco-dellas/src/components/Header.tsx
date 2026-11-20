import React from 'react';
import { Star } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { siteData, getWhatsAppUrl } from '../siteData';

interface HeaderProps {
  onOpenBooking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  return (
    <header
      style={{
        background: 'var(--ground)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo size={48} />
          <div>
            <strong
              className="font-serif"
              style={{
                fontSize: '20px',
                color: 'var(--text-main)',
                display: 'block',
                lineHeight: 1.2
              }}
            >
              Espaço Dellas Ana Paula Pereira
            </strong>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                fontWeight: 700
              }}
            >
              Baldim • Salão de Beleza &amp; Estética
            </span>
          </div>
        </div>

        {/* Right side: Google rating + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
            <strong style={{ color: 'var(--text-main)' }}>4.9</strong>
            <span style={{ color: 'var(--text-subtle)' }}>no Google</span>
          </div>

          <button
            onClick={onOpenBooking}
            className="btn-secondary desktop-header-cta"
            style={{
              fontSize: '13px',
              padding: '10px 18px',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
            </svg>
            <span>Consultar horários</span>
          </button>
        </div>
      </div>
    </header>
  );
};
