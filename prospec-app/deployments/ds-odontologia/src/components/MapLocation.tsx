import React, { useState } from 'react';
import { clinicUnits } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { MapPin, Navigation, Clock, Phone, Building2 } from 'lucide-react';

export const MapLocation: React.FC = () => {
  const [selectedUnitId, setSelectedUnitId] = useState<'contagem' | 'betim'>('contagem');

  const currentUnit = clinicUnits.find(u => u.id === selectedUnitId) || clinicUnits[0];

  return (
    <section id="localizacao" className="section" style={{ background: '#FFFFFF' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <MapPin size={13} />
            <span>Unidades & Atendimento</span>
          </div>
          <h2 className="section-title">
            Onde estamos: Contagem & Betim
          </h2>
          <p className="section-desc">
            Escolha a unidade mais próxima de você para ver o endereço completo, rotas e telefones de atendimento.
          </p>
        </div>

        {/* Unit Switcher Tabs — Segmented Control Elegante */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <div 
            style={{
              display: 'inline-flex',
              padding: '5px',
              background: '#F1F5F9',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              gap: '6px'
            }}
            className="unit-switcher-wrapper"
          >
            {clinicUnits.map(unit => {
              const isSelected = unit.id === selectedUnitId;
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 20px',
                    borderRadius: '7px',
                    fontSize: '14px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    border: 'none',
                    background: isSelected ? '#FFFFFF' : 'transparent',
                    color: isSelected ? 'var(--primary)' : '#475569',
                    boxShadow: isSelected ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={16} />
                  <span>{unit.title}</span>
                  {unit.isMain && (
                    <span 
                      style={{
                        fontSize: '10.5px',
                        background: isSelected ? '#F3EDF7' : '#E2E8F0',
                        color: 'var(--primary)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        marginLeft: '4px'
                      }}
                    >
                      Principal
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.25fr',
            gap: '36px',
            alignItems: 'stretch'
          }}
          className="map-grid"
        >
          {/* Info Card for selected unit */}
          <div 
            style={{
              background: 'var(--surface-alt)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              border: '1.5px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            className="map-info-card"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span 
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--primary)',
                    background: 'var(--primary-subtle)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {currentUnit.isMain ? 'Unidade Matriz' : 'Unidade Regional'}
                </span>
              </div>

              <h3 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '20px' }}>
                DS Odontologia — {currentUnit.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Address */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                      Endereço Completo
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                      {currentUnit.address}
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                      {currentUnit.complement} • {currentUnit.cityState}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                      CEP: {currentUnit.cep}
                    </div>
                  </div>
                </div>

                {/* Telephone */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                      Telefone da {currentUnit.title}
                    </div>
                    <a 
                      href={`tel:${currentUnit.phoneRaw}`}
                      style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', display: 'block', marginTop: '2px' }}
                    >
                      {currentUnit.phoneDisplay}
                    </a>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Toque para discar diretamente
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                      Horário de Funcionamento
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
                      {currentUnit.weekHours}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {currentUnit.satHours}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '32px' }}>
              <a 
                href={currentUnit.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              >
                <Navigation size={17} />
                <span>Abrir no Google Maps ({currentUnit.id === 'contagem' ? 'Contagem' : 'Betim'})</span>
              </a>

              <a 
                href={`https://wa.me/${currentUnit.whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de informações sobre atendimento na ${currentUnit.title} da DS Odontologia.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              >
                <WhatsAppIcon size={18} />
                <span>Chamar no WhatsApp Oficial</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Embed */}
          <div 
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1.5px solid var(--border)',
              minHeight: '440px',
              position: 'relative'
            }}
          >
            <iframe
              key={currentUnit.id}
              title={`Mapa DS Odontologia - ${currentUnit.title}`}
              src={currentUnit.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '440px', display: 'block' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .map-grid {
            grid-template-columns: 1fr !important;
          }
          .unit-switcher-wrapper {
            flex-direction: column !important;
          }
          .unit-switcher-wrapper button {
            width: 100% !important;
            justify-content: center !important;
          }
          .map-info-card {
            padding: 22px 18px !important;
          }
        }
      `}</style>
    </section>
  );
};
