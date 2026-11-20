import React from 'react';
import { ProcedureSelector } from './ProcedureSelector';
import { contactInfo } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ShieldCheck, Star, Clock, MapPin, Phone, Award } from 'lucide-react';

interface HeroProps {
  onOpenBooking: (serviceTitle?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section 
      className="hero"
      style={{
        background: 'linear-gradient(145deg, #1A042B 0%, #290844 50%, #3D0E61 100%)',
        color: '#FFFFFF',
        position: 'relative',
        paddingTop: '56px',
        paddingBottom: '80px',
        overflow: 'hidden'
      }}
    >
      {/* Background radial glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123, 58, 168, 0.25) 0%, rgba(91, 22, 140, 0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '0',
          left: '-150px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 140, 149, 0.15) 0%, rgba(0, 140, 149, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '48px',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* Left Column: Value Prop */}
          <div>
            {/* Top Badge Micro-Card */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#EDE0F5',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '18px',
                letterSpacing: '0.01em'
              }}
              className="hero-badge-pill"
            >
              <Award size={14} color="#25D366" />
              <span>+12 Anos Cuidando de Sorrisos em Contagem e Betim</span>
            </div>

            <h1 
              style={{
                fontSize: '44px',
                lineHeight: 1.15,
                color: '#FFFFFF',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}
              className="hero-heading"
            >
              Seu sorriso saudável e radiante começa com quem entende de você.
            </h1>

            <p 
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#D8CCE6',
                marginBottom: '4px',
                maxWidth: '520px'
              }}
              className="hero-subtext"
            >
              A <strong>DS Odontologia</strong> combina atendimento acolhedor, tecnologia moderna e especialistas em todas as áreas para transformar a estética e a saúde do seu sorriso.
            </p>

            {/* Interactive Procedure Selector Component (Image 1 reference) */}
            <ProcedureSelector onSelectProcedure={(title) => onOpenBooking(title)} />

            {/* Stats Row */}
            <div 
              style={{
                display: 'flex',
                gap: '24px',
                marginTop: '32px',
                alignItems: 'center'
              }}
              className="hero-stats-row"
            >
              <div className="stat-item">
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>
                  +12 Anos
                </div>
                <div style={{ fontSize: '12px', color: '#C9B8DD', marginTop: '4px' }}>
                  Tradição Clínica
                </div>
              </div>

              <div style={{ width: '1px', height: '34px', background: 'rgba(255, 255, 255, 0.18)' }} className="stat-divider" />

              <div className="stat-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>
                    4.1
                  </span>
                  <div style={{ display: 'flex', color: 'var(--star)' }}>
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#C9B8DD', marginTop: '4px' }}>
                  Nota no Google
                </div>
              </div>

              <div style={{ width: '1px', height: '34px', background: 'rgba(255, 255, 255, 0.18)' }} className="stat-divider" />

              <div className="stat-item">
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>
                  +20
                </div>
                <div style={{ fontSize: '12px', color: '#C9B8DD', marginTop: '4px' }}>
                  Avaliações Reais
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Inset Floating Badges */}
          <div style={{ position: 'relative' }} className="hero-visual-col">
            <div 
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
                border: '1.5px solid rgba(255, 255, 255, 0.18)',
                position: 'relative'
              }}
              className="hero-main-img-box"
            >
              <img 
                src="./images/feed-clinica.jpg" 
                alt="Ambiente DS Odontologia"
                style={{
                  width: '100%',
                  height: '480px',
                  objectFit: 'cover',
                  display: 'block'
                }}
                className="hero-main-img"
              />

              {/* Floating Badge Top Left: Biossegurança 100% */}
              <div 
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(32, 8, 52, 0.88)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '14px',
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  zIndex: 10
                }}
                className="hero-floating-badge top-left-badge"
              >
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0, 140, 149, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00D1E0',
                    flexShrink: 0
                  }}
                >
                  <ShieldCheck size={18} color="#00D1E0" />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
                    Biossegurança 100%
                  </div>
                  <div style={{ fontSize: '11px', color: '#D8CCE6', marginTop: '2px', lineHeight: 1.2 }}>
                    Esterilização em autoclave
                  </div>
                </div>
              </div>

              {/* Floating Badge Bottom Right: Atendimento Humanizado */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(32, 8, 52, 0.88)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '14px',
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  zIndex: 10
                }}
                className="hero-floating-badge bottom-right-badge"
              >
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F59E0B',
                    flexShrink: 0
                  }}
                >
                  <Award size={18} color="#F59E0B" />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25 }}>
                    Atendimento Humanizado
                  </div>
                  <div style={{ fontSize: '11px', color: '#D8CCE6', marginTop: '2px', lineHeight: 1.2 }}>
                    Tratamentos sem dor e acolhedores
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Contact Pill Bar — Bem separado e distribuído harmonicamente em 1 linha */}
        <div 
          style={{
            marginTop: '52px',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '18px 32px',
            boxShadow: '0 14px 36px rgba(0, 0, 0, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap'
          }}
          className="hero-contact-bar"
        >
          {/* Item 1: Phone (Bem separado / distribuído) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--primary-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <Phone size={19} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Central Telefônica
              </div>
              <a 
                href={`tel:${contactInfo.phoneRaw}`}
                style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                {contactInfo.phoneDisplay}
              </a>
            </div>
          </div>

          <div style={{ width: '1px', height: '38px', background: 'var(--border)', flexShrink: 0 }} className="bar-divider" />

          {/* Item 2: Hours (Bem separado / distribuído) */}
          <div style={{ flex: 1.15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                flexShrink: 0
              }}
            >
              <Clock size={19} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Horário de Atendimento
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                Seg–Sex: 08h–19h • Sáb: 08h–13h
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '38px', background: 'var(--border)', flexShrink: 0 }} className="bar-divider" />

          {/* Item 3: Address (Bem separado / distribuído) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--primary-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <MapPin size={19} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Nossas Unidades
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                Centro (Contagem) & Betim
              </div>
            </div>
          </div>

          {/* Item 4: WhatsApp Circular Icon Button */}
          <div style={{ flexShrink: 0, paddingLeft: '8px' }}>
            <a
              href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre atendimento na DS Odontologia.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-wpp-btn"
              title="Chamar no WhatsApp"
              aria-label="Chamar no WhatsApp"
              style={{ display: 'flex', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <WhatsAppIcon size={24} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .hero-heading {
            font-size: 28px !important;
            line-height: 1.25 !important;
          }
          .hero-subtext {
            font-size: 14.5px !important;
          }
          .hero-badge-pill {
            font-size: 11.5px !important;
            padding: 5px 12px !important;
          }
          .hero-main-img {
            height: 320px !important;
          }
          .hero-floating-badge {
            padding: 6px 10px !important;
            gap: 8px !important;
            border-radius: 10px !important;
          }
          .top-left-badge {
            top: 10px !important;
            left: 10px !important;
          }
          .bottom-right-badge {
            bottom: 10px !important;
            right: 10px !important;
          }
          .hero-floating-badge > div:first-child {
            width: 26px !important;
            height: 26px !important;
          }
          .hero-floating-badge > div:first-child svg {
            width: 14px !important;
            height: 14px !important;
          }
          .hero-floating-badge > div:last-child > div:first-child {
            font-size: 11px !important;
          }
          .hero-floating-badge > div:last-child > div:last-child {
            font-size: 9.5px !important;
          }
          .hero-stats-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 12px !important;
            background: rgba(255, 255, 255, 0.06);
            padding: 14px 16px !important;
            border-radius: var(--radius-md);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .stat-divider {
            display: none !important;
          }
          .stat-item {
            text-align: center;
          }
          .stat-item div:first-child {
            font-size: 20px !important;
          }
          .stat-item div:last-child {
            font-size: 11px !important;
          }
          .hero-contact-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 18px !important;
            gap: 14px !important;
          }
          .bar-divider {
            display: none !important;
          }
          .quick-wpp-btn {
            width: 100% !important;
            border-radius: var(--radius-full) !important;
            gap: 8px !important;
            height: 48px !important;
          }
          .quick-wpp-btn::after {
            content: "Chamar no WhatsApp (31) 98557-9266";
            font-size: 14px;
            font-weight: 600;
          }
        }
      `}</style>
    </section>
  );
};
