import React from 'react';
import { BrandLogo } from './BrandLogo';
import { contactInfo } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#1A042B', color: '#D8CCE6', paddingTop: '64px', paddingBottom: '32px' }}>
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr 1fr 1.3fr',
            gap: '40px',
            marginBottom: '48px'
          }}
          className="footer-grid"
        >
          {/* Col 1: Brand & Bio */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <BrandLogo variant="light" height={42} />
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#BCAECC', marginBottom: '20px' }}>
              Clínica odontológica completa dedicada à saúde e estética do seu sorriso com atendimento humanizado, ética e tecnologia no Centro de Contagem e em Betim.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#EDE0F5' }}>
              <ShieldCheck size={16} color="#25D366" />
              <span>Ambiente esterilizado e seguro</span>
            </div>
          </div>

          {/* Col 2: Especialidades */}
          <div>
            <h4 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Especialidades
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li><a href="#procedimentos" style={footerLinkStyle}>Implante Dentário</a></li>
              <li><a href="#procedimentos" style={footerLinkStyle}>Invisalign & Alinhadores</a></li>
              <li><a href="#procedimentos" style={footerLinkStyle}>Aparelho Ortodôntico</a></li>
              <li><a href="#procedimentos" style={footerLinkStyle}>Clareamento Dental</a></li>
              <li><a href="#procedimentos" style={footerLinkStyle}>Tratamento de Canal</a></li>
              <li><a href="#procedimentos" style={footerLinkStyle}>Prótese Protocolo</a></li>
            </ul>
          </div>

          {/* Col 3: Navegação (Sobre before Procedimentos) */}
          <div>
            <h4 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li><a href="#sobre" style={footerLinkStyle}>Sobre a Clínica</a></li>
              <li><a href="#procedimentos" style={footerLinkStyle}>Procedimentos</a></li>
              <li><a href="#casos" style={footerLinkStyle}>Antes & Depois</a></li>
              <li><a href="#avaliacoes" style={footerLinkStyle}>Avaliações no Google (4.1)</a></li>
              <li><a href="#localizacao" style={footerLinkStyle}>Como Chegar (Contagem & Betim)</a></li>
              <li><a href="#faq" style={footerLinkStyle}>Perguntas Frequentes</a></li>
            </ul>
          </div>

          {/* Col 4: Contato Direto & Unidades */}
          <div>
            <h4 style={{ fontSize: '15px', color: '#FFFFFF', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nossas Unidades
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', color: '#FFFFFF', fontWeight: 600, marginBottom: '2px' }}>
                  <MapPin size={16} color="#25D366" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Unidade Contagem (Centro)</span>
                </div>
                <div style={{ color: '#BCAECC', marginLeft: '24px', fontSize: '12.5px' }}>
                  {contactInfo.address}, Loja 02<br />
                  Tel: <a href={`tel:${contactInfo.phoneRaw}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>{contactInfo.phoneDisplay}</a>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '8px', color: '#FFFFFF', fontWeight: 600, marginBottom: '2px' }}>
                  <MapPin size={16} color="#25D366" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Unidade Betim</span>
                </div>
                <div style={{ color: '#BCAECC', marginLeft: '24px', fontSize: '12.5px' }}>
                  Av. Belo Horizonte, 1220 - B. Jardim Teresópolis<br />
                  Tel: <a href={`tel:${contactInfo.betimPhoneRaw}`} style={{ color: '#FFFFFF', textDecoration: 'none' }}>{contactInfo.betimPhoneDisplay}</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <WhatsAppIcon size={16} style={{ color: '#25D366' }} />
                <span>WhatsApp: <strong style={{ color: '#FFFFFF' }}>{contactInfo.whatsappDisplay}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & CRO */}
        <div 
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12.5px',
            color: '#A092B0'
          }}
        >
          <div>
            © {new Date().getFullYear()} DS Odontologia Contagem & Betim • Todos os direitos reservados.
          </div>
          <div>
            Responsabilidade Técnica Odontológica • CRO-MG
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};

const footerLinkStyle: React.CSSProperties = {
  color: '#D8CCE6',
  textDecoration: 'none',
  transition: 'color 0.2s'
};
