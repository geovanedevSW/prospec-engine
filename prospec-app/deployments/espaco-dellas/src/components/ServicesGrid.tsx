import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ServiceItem } from '../types';

const servicesList = [
  {
    id: 'cabelos',
    title: 'Cortes & Tratamentos Capilares',
    desc: 'Cortes femininos, escovas modeladas, botox, hidratação profunda e mechas com produtos profissionais de alto padrão.',
    actionText: 'Consultar horários para cabelo'
  },
  {
    id: 'manicure',
    title: 'Manicure & Pedicure Spa',
    desc: 'Esmaltação de longa duração, blindagem, cuticulagem delicada e spa dos pés com instrumentos esterilizados em autoclave.',
    actionText: 'Consultar horários para manicure'
  },
  {
    id: 'sobrancelhas',
    title: 'Design de Sobrancelhas',
    desc: 'Alinhamento visagista que valoriza a simetria natural do seu rosto, com opção de aplicação de henna profissional.',
    actionText: 'Consultar horários para sobrancelhas'
  },
  {
    id: 'estetica',
    title: 'Estética Facial & Cuidados',
    desc: 'Limpeza de pele profunda, drenagem e cuidados dedicados para renovação e luminosidade da sua pele.',
    actionText: 'Consultar horários para estética'
  }
];

interface ServicesGridProps {
  onSelectService?: (service: ServiceItem) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  return (
    <section id="procedimentos" style={{ padding: '72px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '36px', maxWidth: '680px' }}>
          <h2
            className="font-serif"
            style={{
              fontSize: '34px',
              color: 'var(--accent)',
              fontWeight: 400,
              marginBottom: '8px'
            }}
          >
            Serviços com horário marcado
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Escolha o procedimento para consultar a disponibilidade da agenda.
          </p>
        </div>

        <div className="services-grid-doop">
          {servicesList.map((svc) => (
            <div key={svc.id} className="card-service">
              <div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '22px',
                    color: 'var(--accent)',
                    fontWeight: 400,
                    marginBottom: '10px'
                  }}
                >
                  {svc.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineLine: 1.6 }}>
                  {svc.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: '22px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-light)'
                }}
              >
                <button
                  onClick={() => onSelectService && onSelectService(svc as any)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{svc.actionText}</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
