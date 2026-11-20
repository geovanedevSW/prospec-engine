import React from 'react';
import { Check } from 'lucide-react';

interface AboutSectionProps {
  onOpenBooking?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  return (
    <section
      style={{
        padding: '72px 0',
        background: '#FFF',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="container">
        <div
          className="about-grid-doop"
          style={{
            display: 'grid',
            gridTemplateColumns: '0.85fr 1.15fr',
            gap: '64px',
            alignItems: 'center'
          }}
        >
          <div>
            <div
              style={{
                borderRadius: '22px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--ground)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.04)'
              }}
            >
              <img
                src="/images/sobre-atendimento.jpg"
                alt="Atendimento no Espaço Dellas"
                style={{
                  width: '100%',
                  height: '440px',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <h2
              className="font-serif"
              style={{
                fontSize: '36px',
                color: 'var(--accent)',
                fontWeight: 400,
                marginBottom: '18px'
              }}
            >
              Sobre a Ana Paula e o Espaço
            </h2>

            <p
              style={{
                fontSize: '16px',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                marginBottom: '18px'
              }}
            >
              Com anos de experiência dedicados ao atendimento feminino em Baldim,{' '}
              <strong style={{ color: 'var(--text-main)' }}>Ana Paula Pereira</strong> construiu o
              Espaço Dellas para ser um ambiente acolhedor, onde você é ouvida e atendida com calma.
            </p>

            <p
              style={{
                fontSize: '16px',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                marginBottom: '28px'
              }}
            >
              Aqui não há filas nem salas cheias: cada horário é reservado com exclusividade para
              você relaxar enquanto cuidamos do seu cabelo, unhas e bem-estar.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '32px'
              }}
              className="about-differentials-grid"
            >
              {[
                'Horário reservado para você',
                'Autoclave e biossegurança',
                'Produtos profissionais',
                'Fácil acesso no Centro'
              ].map((diff, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-main)'
                    }}
                  >
                    {diff}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenBooking}
              className="btn-whatsapp"
              style={{ cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z" />
              </svg>
              <span>Conversar com a Ana Paula</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
