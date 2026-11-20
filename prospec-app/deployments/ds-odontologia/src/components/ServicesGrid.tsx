import React, { useState } from 'react';
import { proceduresList, contactInfo } from '../siteData';
import { Procedure } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Stethoscope, ArrowRight, CheckCircle2, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';

interface ServicesGridProps {
  onSelectService: (serviceTitle: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const [filter, setFilter] = useState<'all' | 'implant' | 'ortho' | 'aesthetic' | 'general'>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = filter === 'all' 
    ? proceduresList 
    : proceduresList.filter(p => p.category === filter || (filter === 'general' && p.category === 'surgery'));

  // Show only 6 cards by default, or all if expanded
  const visibleCards = showAll ? filtered : filtered.slice(0, 6);

  const handleFilterChange = (newFilter: 'all' | 'implant' | 'ortho' | 'aesthetic' | 'general') => {
    setFilter(newFilter);
    setShowAll(false); // Reset to 6 when switching tabs
  };

  return (
    <section id="procedimentos" className="section section-alt">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Stethoscope size={13} />
            <span>Procedimentos Clínicos</span>
          </div>
          <h2 className="section-title">
            Tratamentos odontológicos integrados em um só lugar
          </h2>
          <p className="section-desc">
            Da prevenção estética à reabilitação oral completa. Nossa equipe em Contagem e Betim utiliza métodos confortáveis e tecnologia digital para cuidar do seu sorriso.
          </p>
        </div>

        {/* Filter Pills */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '36px',
            flexWrap: 'wrap'
          }}
        >
          <FilterButton active={filter === 'all'} onClick={() => handleFilterChange('all')}>
            Todos ({proceduresList.length})
          </FilterButton>
          <FilterButton active={filter === 'implant'} onClick={() => handleFilterChange('implant')}>
            Implantes & Próteses
          </FilterButton>
          <FilterButton active={filter === 'ortho'} onClick={() => handleFilterChange('ortho')}>
            Invisalign & Aparelhos
          </FilterButton>
          <FilterButton active={filter === 'aesthetic'} onClick={() => handleFilterChange('aesthetic')}>
            Estética & Clareamento
          </FilterButton>
          <FilterButton active={filter === 'general'} onClick={() => handleFilterChange('general')}>
            Clínica Geral & Canal
          </FilterButton>
        </div>

        {/* Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}
          className="services-grid"
        >
          {visibleCards.map(proc => (
            <ServiceCard 
              key={proc.id} 
              procedure={proc} 
              onSelect={() => onSelectService(proc.title)} 
            />
          ))}
        </div>

        {/* 'Ver Mais' CTA Button when more than 6 cards */}
        {filtered.length > 6 && (
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-secondary"
              style={{
                padding: '13px 32px',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span>{showAll ? 'Ver Menos Especialidades' : `Ver Mais Especialidades (${filtered.length - 6} restantes)`}</span>
              {showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        )}

        {/* Bottom Banner */}
        <div 
          style={{
            marginTop: '56px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap'
          }}
          className="services-cta-banner"
        >
          <div>
            <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '8px' }}>
              Não encontrou o procedimento que procura?
            </h3>
            <p style={{ color: '#D8CCE6', fontSize: '14.5px', maxWidth: '580px' }}>
              Nossa equipe atende todas as especialidades odontológicas em Contagem e Betim. Fale com nossa recepção no WhatsApp.
            </p>
          </div>

          <a 
            href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent('Olá! Tenho uma dúvida sobre um tratamento odontológico específico na DS Odontologia.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            style={{ fontSize: '15px', padding: '14px 28px' }}
          >
            <WhatsAppIcon size={19} />
            <span>Falar com um Especialista</span>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .services-grid {
            grid-template-columns: 1fr !important;
          }
          .services-cta-banner {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 24px !important;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 600,
      border: active ? '1.5px solid var(--primary)' : '1px solid #E2E8F0',
      background: active ? 'var(--primary)' : '#FFFFFF',
      color: active ? '#FFFFFF' : '#475569',
      cursor: 'pointer',
      boxShadow: active ? '0 2px 6px rgba(74, 20, 140, 0.15)' : 'none',
      transition: 'all 0.18s ease'
    }}
  >
    {children}
  </button>
);

interface ServiceCardProps {
  procedure: Procedure;
  onSelect: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ procedure, onSelect }) => {
  return (
    <div 
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        position: 'relative'
      }}
      className="service-card"
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div 
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HeartPulse size={22} />
          </div>

          {procedure.highlight && (
            <span 
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                background: '#F1F5F9',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid #E2E8F0',
                letterSpacing: '0.01em'
              }}
            >
              {procedure.highlight}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '19px', color: 'var(--text)', marginBottom: '8px' }}>
          {procedure.title}
        </h3>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '20px' }}>
          {procedure.description}
        </p>
      </div>

      <div>
        {procedure.duration && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              color: 'var(--accent-dark)',
              fontWeight: 600,
              marginBottom: '16px'
            }}
          >
            <CheckCircle2 size={15} />
            <span>{procedure.duration}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onSelect}
            className="btn-secondary"
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: '13.5px',
              justifyContent: 'center'
            }}
          >
            <span>Agendar</span>
            <ArrowRight size={14} />
          </button>

          <a 
            href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(procedure.whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            style={{
              padding: '10px 14px',
              fontSize: '13px'
            }}
            title="Dúvidas no WhatsApp"
          >
            <WhatsAppIcon size={17} />
          </a>
        </div>
      </div>

      <style>{`
        .service-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};
