import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { contactInfo } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Phone, MapPin, Clock, Menu, X, Calendar, Building2, Stethoscope, CheckCircle2, Star, HelpCircle, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header 
        style={{ 
          width: '100%', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          background: '#FFFFFF',
          boxShadow: '0 2px 14px rgba(37, 30, 43, 0.08)'
        }}
      >
      {/* Top Notification Bar — Marquee Ticker contínuo em 1 linha */}
      <div 
        className="top-ticker-wrapper" 
        aria-label="Avisos e endereços das unidades Contagem e Betim"
        style={{
          background: 'var(--primary-dark)',
          color: '#EDE0F5',
          fontSize: '12.5px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          height: '36px',
          position: 'relative',
          userSelect: 'none'
        }}
      >
        <div className="ticker-track">
          {/* Bloco 1 */}
          <div className="ticker-content">
            <span className="ticker-item">
              <MapPin size={13} color="#25D366" />
              <span><strong>Unidade Contagem:</strong> Rua Antônio Bernardino Muniz, 155 - Centro</span>
            </span>
            <span className="ticker-separator">•</span>

            <span className="ticker-item">
              <MapPin size={13} color="#25D366" />
              <span><strong>Unidade Betim:</strong> Av. Belo Horizonte, 1220 - B. Jardim Teresópolis</span>
            </span>
            <span className="ticker-separator">•</span>

            <a href={`tel:${contactInfo.phoneRaw}`} className="ticker-item ticker-link">
              <Phone size={13} color="#008C95" />
              <span><strong>Telefone Central:</strong> {contactInfo.phoneDisplay}</span>
            </a>
            <span className="ticker-separator">•</span>

            <a 
              href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com a DS Odontologia.')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ticker-item ticker-link"
            >
              <WhatsAppIcon size={14} style={{ color: '#25D366' }} />
              <span><strong>WhatsApp:</strong> {contactInfo.whatsappDisplay}</span>
            </a>
            <span className="ticker-separator">•</span>

            <span className="ticker-item">
              <Clock size={13} color="#D1BFDD" />
              <span>Seg a Sex: 08h às 19h • Sáb: 08h às 13h</span>
            </span>
            <span className="ticker-separator">•</span>
          </div>

          {/* Bloco 2 duplicado para loop contínuo infinito sem saltos */}
          <div className="ticker-content" aria-hidden="true">
            <span className="ticker-item">
              <MapPin size={13} color="#25D366" />
              <span><strong>Unidade Contagem:</strong> Rua Antônio Bernardino Muniz, 155 - Centro</span>
            </span>
            <span className="ticker-separator">•</span>

            <span className="ticker-item">
              <MapPin size={13} color="#25D366" />
              <span><strong>Unidade Betim:</strong> Av. Belo Horizonte, 1220 - B. Jardim Teresópolis</span>
            </span>
            <span className="ticker-separator">•</span>

            <a href={`tel:${contactInfo.phoneRaw}`} className="ticker-item ticker-link" tabIndex={-1}>
              <Phone size={13} color="#008C95" />
              <span><strong>Telefone Central:</strong> {contactInfo.phoneDisplay}</span>
            </a>
            <span className="ticker-separator">•</span>

            <a 
              href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de falar com a DS Odontologia.')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ticker-item ticker-link"
              tabIndex={-1}
            >
              <WhatsAppIcon size={14} style={{ color: '#25D366' }} />
              <span><strong>WhatsApp:</strong> {contactInfo.whatsappDisplay}</span>
            </a>
            <span className="ticker-separator">•</span>

            <span className="ticker-item">
              <Clock size={13} color="#D1BFDD" />
              <span>Seg a Sex: 08h às 19h • Sáb: 08h às 13h</span>
            </span>
            <span className="ticker-separator">•</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav 
        style={{
          padding: '12px 0',
          boxShadow: '0 2px 12px rgba(37, 30, 43, 0.05)',
          background: '#FFFFFF'
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
          <BrandLogo height={42} />

          {/* Desktop Nav Links */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '26px'
            }}
            className="desktop-nav"
          >
            <a href="#sobre" style={navLinkStyle}>Sobre a Clínica</a>
            <a href="#procedimentos" style={navLinkStyle}>Procedimentos</a>
            <a href="#casos" style={navLinkStyle}>Antes & Depois</a>
            <a href="#avaliacoes" style={{ ...navLinkStyle, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span>Avaliações</span>
              <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #FDE68A' }}>4.1 ★</span>
            </a>
            <a href="#faq" style={navLinkStyle}>Dúvidas</a>
            <a href="#localizacao" style={navLinkStyle}>Como Chegar</a>
          </div>

          {/* Nav Actions: Desktop shows CTA button, Mobile hides it */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenBooking}
              className="btn-primary desktop-nav-cta"
              style={{
                padding: '10px 20px',
                fontSize: '14px'
              }}
            >
              <Calendar size={15} />
              <span>Agendar Consulta</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle"
              aria-label={mobileMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: mobileMenuOpen ? '#F3EDF7' : '#FAF9F6',
                border: mobileMenuOpen ? '1.5px solid var(--primary)' : '1px solid #E2E8F0',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: mobileMenuOpen ? 'var(--primary)' : 'var(--text)',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu — Posicionado em OVERLAY flutuante (Zero empurrão na Hero!) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop escurecido atrás do menu para fechar ao tocar fora */}
            <div 
              className="mobile-menu-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                top: '102px',
                background: 'rgba(26, 4, 43, 0.55)',
                backdropFilter: 'blur(4px)',
                zIndex: 140,
                animation: 'fadeIn 0.2s ease-out'
              }}
              aria-hidden="true"
            />

            {/* Painel do menu flutuante sobre a Hero */}
            <div 
              className="mobile-dropdown-menu"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px',
                padding: '16px 16px 22px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 24px 48px rgba(18, 2, 33, 0.25)',
                zIndex: 150,
                animation: 'slideDownMenu 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mobile-nav-icon-box">
                    <Building2 size={17} color="var(--primary)" />
                  </div>
                  <span className="mobile-nav-label">Sobre a Clínica</span>
                </div>
                <ChevronRight size={17} className="mobile-nav-chevron" />
              </a>

              <a href="#procedimentos" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mobile-nav-icon-box">
                    <Stethoscope size={17} color="var(--primary)" />
                  </div>
                  <span className="mobile-nav-label">Procedimentos & Especialidades</span>
                </div>
                <ChevronRight size={17} className="mobile-nav-chevron" />
              </a>

              <a href="#casos" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mobile-nav-icon-box">
                    <CheckCircle2 size={17} color="var(--primary)" />
                  </div>
                  <span className="mobile-nav-label">Antes & Depois</span>
                </div>
                <ChevronRight size={17} className="mobile-nav-chevron" />
              </a>

              <a href="#avaliacoes" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mobile-nav-icon-box" style={{ background: '#FEF3C7' }}>
                    <Star size={17} color="#D97706" fill="#F59E0B" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mobile-nav-label">Avaliações Google</span>
                    <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #FDE68A' }}>4.1 ★</span>
                  </div>
                </div>
                <ChevronRight size={17} className="mobile-nav-chevron" />
              </a>

              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mobile-nav-icon-box">
                    <HelpCircle size={17} color="var(--primary)" />
                  </div>
                  <span className="mobile-nav-label">Perguntas Frequentes</span>
                </div>
                <ChevronRight size={17} className="mobile-nav-chevron" />
              </a>

              <a href="#localizacao" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="mobile-nav-icon-box">
                    <MapPin size={17} color="var(--primary)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mobile-nav-label">Como Chegar</span>
                    <span style={{ fontSize: '10.5px', background: '#E2E8F0', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Contagem & Betim</span>
                  </div>
                </div>
                <ChevronRight size={17} className="mobile-nav-chevron" />
              </a>

              {/* Quick Actions Row: Telefone & Agendamento */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                <a 
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="mobile-quick-btn"
                >
                  <Phone size={14} color="var(--primary)" />
                  <span>(31) 3390-0979</span>
                </a>

                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
                  className="mobile-quick-btn"
                >
                  <Calendar size={14} color="var(--primary)" />
                  <span>Agendar Consulta</span>
                </button>
              </div>

              {/* CTA WhatsApp Principal */}
              <a
                href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de agendar um atendimento na DS Odontologia.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ 
                  width: '100%', 
                  marginTop: '4px', 
                  justifyContent: 'center', 
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <WhatsAppIcon size={19} />
                <span>Falar no WhatsApp Oficial</span>
              </a>
            </div>
          </>
        )}
      </nav>

      <style>{`
        @keyframes slideDownMenu {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Ticker Marquee Animation */
        .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: tickerMarquee 26s linear infinite;
          will-change: transform;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        .ticker-content {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          color: #EDE0F5;
          white-space: nowrap;
          font-size: 12.5px;
        }

        .ticker-item strong {
          color: #FFFFFF;
        }

        .ticker-link {
          color: #FFFFFF;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .ticker-link:hover {
          opacity: 0.85;
          text-decoration: underline;
        }

        .ticker-separator {
          color: rgba(255, 255, 255, 0.35);
          font-size: 11px;
          margin: 0 2px;
        }

        @keyframes tickerMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
            overflow-x: auto;
          }
        }

        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-nav-cta { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #FAF9F6;
          border: 1px solid #EFECE6;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.15s ease, transform 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-nav-item:active {
          background: #F1ECE4;
          transform: scale(0.99);
        }

        .mobile-nav-icon-box {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #F3EDF7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-nav-label {
          font-weight: 600;
          font-size: 14.5px;
          color: #1E293B;
        }

        .mobile-nav-chevron {
          color: #94A3B8;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .mobile-nav-item:active .mobile-nav-chevron {
          transform: translateX(2px);
          color: var(--primary);
        }

        .mobile-quick-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 12px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          background: #FAF9F6;
          font-size: 13px;
          font-weight: 600;
          color: #334151;
          cursor: pointer;
          white-space: nowrap;
          text-decoration: none;
          transition: background 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-quick-btn:active {
          background: #E2E8F0;
          transform: scale(0.98);
        }
      `}</style>
    </header>
    {/* Spacer to prevent layout jump under fixed header */}
    <div 
      className="header-spacer" 
      style={{ height: '102px' }} 
      aria-hidden="true" 
    />
  </>
);
};

const navLinkStyle: React.CSSProperties = {
  fontSize: '14.5px',
  fontWeight: 500,
  color: 'var(--text)',
  textDecoration: 'none',
  transition: 'color 0.2s'
};
