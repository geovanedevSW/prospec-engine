import React from 'react';
import { contactInfo } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Calendar } from 'lucide-react';

interface StickyBarProps {
  onOpenBooking: () => void;
}

export const StickyBar: React.FC<StickyBarProps> = ({ onOpenBooking }) => {
  return (
    <aside 
      className="mobile-sticky-bar"
      aria-label="Ações rápidas de contato"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        padding: '10px 16px',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        display: 'none',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <button
        onClick={onOpenBooking}
        className="btn-secondary"
        style={{
          flex: 1,
          padding: '12px 14px',
          fontSize: '13.5px',
          justifyContent: 'center',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <Calendar size={16} />
        <span>Agendar Consulta</span>
      </button>

      <a
        href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de agendar uma consulta na DS Odontologia (Contagem ou Betim).')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp"
        style={{
          flex: 1.2,
          padding: '12px 16px',
          fontSize: '14px',
          justifyContent: 'center',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <WhatsAppIcon size={18} />
        <span>WhatsApp</span>
      </a>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sticky-bar {
            display: flex !important;
          }
          body {
            padding-bottom: 74px !important;
          }
        }
      `}</style>
    </aside>
  );
};
