import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { siteData } from '../siteData';

interface HeroProps {
  onOpenBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section style={{ padding: '64px 0 84px 0' }}>
      <div
        className="container hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '56px',
          alignItems: 'center'
        }}
      >
        <div>
          <h1
            className="font-serif hero-title"
            style={{
              fontSize: '48px',
              fontWeight: 400,
              color: 'var(--accent)',
              lineHeight: 1.15,
              marginBottom: '18px'
            }}
          >
            Cabelo, unhas e beleza em Baldim, com um horário só seu.
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '30px',
              maxWidth: '520px'
            }}
          >
            Conheça os serviços do Espaço Dellas e consulte os horários pelo WhatsApp.
          </p>

          <div>
            <button
              onClick={onOpenBooking}
              className="btn-whatsapp"
              style={{ cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              <span>Consultar horários no WhatsApp</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '28px',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} strokeWidth={2.5} color="var(--accent)" />
              <span>Atendimento individual com hora marcada</span>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} strokeWidth={2} color="var(--accent)" />
              <span>Centro de Baldim</span>
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              borderRadius: '22px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: '0 12px 32px rgba(138, 61, 77, 0.08)',
              background: '#FFF'
            }}
          >
            <img
              src="/images/hero.jpg"
              alt="Ambiente acolhedor do Espaço Dellas em Baldim"
              style={{
                width: '100%',
                height: '440px',
                objectFit: 'cover',
                display: 'block'
              }}
              loading="eager"
            />
            <div
              style={{
                padding: '14px 18px',
                background: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-light)'
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    display: 'block',
                    fontWeight: 700
                  }}
                >
                  Espaço Dellas • Ambiente do Salão
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Ambiente privativo e acolhedor no Centro
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  background: 'var(--accent-light)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                Baldim - MG
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
