import React from 'react';
import { ResultItem } from '../types';

const resultsData = [
  {
    id: 'cabelos',
    title: 'Cabelos & Mechas',
    subtitle: 'Cortes, mechas e hidratações profundas',
    imageUrl: '/images/resultado-cabelos.jpg'
  },
  {
    id: 'unhas',
    title: 'Unhas & Pés',
    subtitle: 'Manicure, pedicure e blindagem duradoura',
    imageUrl: '/images/resultado-manicure.jpg'
  },
  {
    id: 'sobrancelhas',
    title: 'Design de Sobrancelhas',
    subtitle: 'Alinhamento visagista e efeito natural',
    imageUrl: '/images/resultado-sobrancelhas.jpg'
  }
];

interface ResultsGalleryProps {
  onSelectResult?: (result: ResultItem) => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ onSelectResult }) => {
  return (
    <section
      style={{
        background: 'var(--ground-warm)',
        padding: '68px 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h2
            className="font-serif"
            style={{
              fontSize: '34px',
              color: 'var(--accent)',
              fontWeight: 400,
              marginBottom: '8px'
            }}
          >
            Resultados reais
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Uma prévia dos atendimentos realizados no Espaço Dellas.
          </p>
        </div>

        {/* Desktop 3-col grid / Mobile touch-scroll row */}
        <div className="results-container-responsive">
          {resultsData.map((item) => (
            <div
              key={item.id}
              className="result-card-item"
              style={{
                background: '#FFF',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                cursor: onSelectResult ? 'pointer' : 'default'
              }}
              onClick={() => onSelectResult && onSelectResult(item as any)}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '320px',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="lazy"
              />
              <div style={{ padding: '16px 20px' }}>
                <strong
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-main)',
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 700
                  }}
                >
                  {item.title}
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {item.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
