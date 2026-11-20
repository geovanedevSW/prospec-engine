import React from 'react';
import { MapPin } from 'lucide-react';
import { siteData } from '../siteData';

interface MapLocationProps {
  onOpenBooking?: () => void;
}

export const MapLocation: React.FC<MapLocationProps> = ({ onOpenBooking }) => {
  const mapEmbedUrl =
    'https://maps.google.com/maps?q=R.+Geraldo+Marqu%C3%AAs%2C+228+-+Centro%2C+Baldim+-+MG%2C+35732-000&t=&z=16&ie=UTF8&iwloc=&output=embed';

  return (
    <section id="localizacao" style={{ padding: '72px 0' }}>
      <div
        className="container location-grid-doop"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '56px',
          alignItems: 'center'
        }}
      >
        <div>
          <h2
            className="font-serif"
            style={{
              fontSize: '36px',
              color: 'var(--accent)',
              fontWeight: 400,
              marginBottom: '14px'
            }}
          >
            Onde estamos e como chegar
          </h2>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}
          >
            Venha nos visitar no Centro de Baldim. Ponto nobre, tranquilo e com estacionamento
            fácil em frente ao salão.
          </p>

          <div
            style={{
              background: '#FFF',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '26px'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <strong
                style={{
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--accent)',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Endereço:
              </strong>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                {siteData.address.fullFormatted}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
              <strong
                style={{
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--accent)',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                Horários de Atendimento:
              </strong>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {siteData.hours.days}: {siteData.hours.hours} ({siteData.hours.note.toLowerCase()})
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <a
              href={siteData.address.mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MapPin size={16} strokeWidth={2} />
              <span>Como chegar</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="btn-whatsapp"
              style={{ cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              <span>Agendar pelo WhatsApp</span>
            </button>
          </div>
        </div>

        <div>
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: '#FFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--ground)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <strong style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 700 }}>
                Espaço Dellas • Centro
              </strong>
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
                Baldim - MG
              </span>
            </div>

            <div style={{ height: '340px', position: 'relative', background: '#ECE9E3' }}>
              <iframe
                title="Localização do Espaço Dellas no Google Maps"
                src={mapEmbedUrl}
                width="100%"
                height="340"
                style={{
                  border: 0,
                  width: '100%',
                  height: '340px',
                  display: 'block'
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
