import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { siteData } from '../siteData';

const reviewsList = [
  {
    author: 'Mariângela Santos',
    initial: 'M',
    text: 'Ambiente maravilhoso, acolhedor e atendimento nota 10. A Ana Paula é extremamente atenciosa, pontual e muito caprichosa no serviço!'
  },
  {
    author: 'Carla Ribeiro',
    initial: 'C',
    text: 'Sempre saio renovada. Produtos de altíssima qualidade e um cuidado impecável com cada detalhe. O melhor salão de Baldim com certeza.'
  },
  {
    author: 'Fernanda Oliveira',
    initial: 'F',
    text: 'Design de sobrancelha impecável e manicure que dura a semana inteira! Facilidade excelente para agendar pelo WhatsApp.'
  }
];

export const GoogleReviews: React.FC = () => {
  return (
    <section style={{ padding: '72px 0' }}>
      <div className="container">
        <div
          className="reviews-header-doop"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px'
          }}
        >
          <div>
            <h2
              className="font-serif"
              style={{
                fontSize: '34px',
                color: 'var(--accent)',
                fontWeight: 400,
                marginBottom: '6px'
              }}
            >
              Avaliações no Google
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
              Nota 4.9 ★ com avaliações verificadas de clientes locais.
            </p>
          </div>

          <a
            href={siteData.address.mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: '13px' }}
          >
            <MapPin size={16} strokeWidth={2} />
            <span>Ver avaliações no Google</span>
          </a>
        </div>

        <div className="reviews-grid-doop">
          {reviewsList.map((rev, index) => (
            <div key={index} className="card-review">
              <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '16px'
                }}
              >
                "{rev.text}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {rev.initial}
                </div>
                <div>
                  <strong
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      display: 'block'
                    }}
                  >
                    {rev.author}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                    Cliente Verificada no Google
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
