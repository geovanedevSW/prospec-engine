import React from 'react';
import { MessageCircle, MapPin } from 'lucide-react';
import { siteData } from '../siteData';

interface StickyBarProps {
  onOpenBooking: () => void;
}

export const StickyBar: React.FC<StickyBarProps> = ({ onOpenBooking }) => {
  return (
    <div
      className="mobile-sticky-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        padding: '10px 16px',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        {/* Direct Map Icon Button */}
        <a
          href={siteData.address.mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir localização no Google Maps"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            flexShrink: 0,
            textDecoration: 'none'
          }}
        >
          <MapPin size={20} color="var(--accent)" />
        </a>

        {/* Primary 1-Tap Conversion WhatsApp Button */}
        <button
          onClick={onOpenBooking}
          className="btn-whatsapp"
          style={{
            flex: 1,
            height: '46px',
            padding: '0 16px',
            fontSize: '15px'
          }}
        >
          <MessageCircle size={19} strokeWidth={2.2} />
          <span>Agendar pelo WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

