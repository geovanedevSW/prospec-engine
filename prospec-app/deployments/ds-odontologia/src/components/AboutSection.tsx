import React from 'react';
import { Award, Heart, Activity, CheckCircle2, Shield, Building2 } from 'lucide-react';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="sobre" className="section" style={{ background: '#FFFFFF' }}>
      <div className="container">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: '56px',
            alignItems: 'center'
          }}
          className="about-grid"
        >
          {/* Left Column: Image with experience badge */}
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <img 
                src="./images/sobre-atendimento.webp" 
                alt="Equipe DS Odontologia e Consultório"
                style={{
                  width: '100%',
                  height: '460px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Float Experience Badge */}
            <div 
              style={{
                position: 'absolute',
                bottom: '-20px',
                right: '24px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                boxShadow: '0 12px 28px rgba(91, 22, 140, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
              className="about-badge"
            >
              <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>
                +12
              </div>
              <div style={{ fontSize: '12.5px', lineHeight: 1.35, color: '#EDE0F5' }}>
                <strong>Anos de Tradição</strong><br />
                Cuidando de famílias em Contagem
              </div>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div>
            <div className="section-tag" style={{ marginBottom: '12px' }}>
              <Building2 size={13} />
              <span>Sobre a DS Odontologia</span>
            </div>

            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
              Atendimento acolhedor, transparente e com tecnologia de ponta
            </h2>

            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '16px' }}>
              A <strong>DS Odontologia</strong> é dedicada a oferecer atendimento de excelência em um ambiente moderno no Centro de Contagem. Contamos com uma equipe multidisciplinar qualificada para cuidar da saúde e da estética do seu sorriso, oferecendo tratamentos em todas as especialidades com foco na segurança e no bem-estar dos pacientes.
            </p>

            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '28px' }}>
              Nosso compromisso é proporcionar uma odontologia humanizada, utilizando técnicas atuais para garantir resultados confortáveis e personalizados. Atendemos pacientes de todas as idades, sempre com ética, clareza em orçamentos e dedicação em cada consulta.
            </p>

            {/* 4 Pillars */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '18px',
                marginBottom: '32px'
              }}
              className="about-pillars"
            >
              <PillarItem 
                icon={<Heart size={18} color="var(--primary)" />}
                title="Atendimento Humanizado"
                desc="Escuta atenta e cuidado sem dor para toda a família."
              />
              <PillarItem 
                icon={<Activity size={18} color="var(--primary)" />}
                title="Tecnologia Atualizada"
                desc="Equipamentos digitais para diagnósticos precisos."
              />
              <PillarItem 
                icon={<CheckCircle2 size={18} color="var(--primary)" />}
                title="Todas as Especialidades"
                desc="Do check-up preventivo aos implantes complexos."
              />
              <PillarItem 
                icon={<Shield size={18} color="var(--primary)" />}
                title="Ética & Transparência"
                desc="Planos de tratamento explicados passo a passo."
              />
            </div>

            <button
              onClick={onOpenBooking}
              className="btn-primary"
              style={{ fontSize: '15px', padding: '14px 28px' }}
            >
              <span>Conhecer a Clínica e Agendar</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .about-badge {
            position: static !important;
            margin-top: 16px !important;
          }
          .about-pillars {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

const PillarItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
    <div 
      style={{
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--primary-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {desc}
      </div>
    </div>
  </div>
);

