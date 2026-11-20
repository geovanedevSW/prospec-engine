import React, { useState, useEffect } from 'react';
import { googleReviews, contactInfo } from '../siteData';
import { Star, CheckCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export const GoogleReviews: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(googleReviews.length / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentReviews = googleReviews.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section id="avaliacoes" className="section" style={{ background: '#FFFFFF' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '36px' }}>
          <div className="section-tag">
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span>Avaliações Verificadas</span>
          </div>
          <h2 className="section-title">
            O que dizem os pacientes de Contagem e Betim
          </h2>
          <p className="section-desc">
            A opinião espontânea de quem confiou na nossa equipe para cuidar do seu sorriso e da sua família.
          </p>
        </div>

        {/* Google Score Banner */}
        <div 
          style={{
            maxWidth: '680px',
            margin: '0 auto 40px auto',
            background: 'var(--surface-alt)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 32px',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}
          className="google-score-box"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Plus Jakarta Sans', lineHeight: 1 }}>
              4.1
            </div>
            <div>
              <div style={{ display: 'flex', gap: '3px', color: 'var(--star)', marginBottom: '4px' }}>
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="#D1BFDD" color="#D1BFDD" />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Mais de <strong>20 avaliações</strong> verificadas no Google
              </div>
            </div>
          </div>

          <a 
            href={contactInfo.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: '13.5px', padding: '10px 18px' }}
          >
            <span>Ver no Google Maps</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative', marginTop: '16px' }}>
          {/* Reviews Grid (shows 3 items on desktop, 1 on mobile) */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '24px',
              minHeight: '270px'
            }}
          >
            {currentReviews.map(rev => (
              <div 
                key={rev.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px',
                  border: '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  animation: 'fadeIn 0.3s ease-in-out'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {rev.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>
                          {rev.author}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                          {rev.date}
                        </div>
                      </div>
                    </div>

                    {rev.localGuide && (
                      <span 
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#FEF3C7',
                          color: '#92400E',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          border: '1px solid #FDE68A'
                        }}
                      >
                        Local Guide
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '2px', color: 'var(--star)', marginBottom: '14px' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{rev.text}"
                  </p>
                </div>

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    color: 'var(--accent-dark)',
                    fontWeight: 600,
                    marginTop: '18px',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px'
                  }}
                >
                  <CheckCircle size={14} />
                  <span>Paciente atendido na DS Odontologia</span>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls (Arrows & Dots) */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '32px'
            }}
          >
            <button
              onClick={prevPage}
              className="btn-secondary"
              style={{
                width: '42px',
                height: '42px',
                padding: 0,
                borderRadius: '50%',
                justifyContent: 'center'
              }}
              aria-label="Avaliações anteriores"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  style={{
                    width: currentPage === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: currentPage === idx ? 'var(--primary)' : 'var(--border-strong)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  aria-label={`Página ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              className="btn-secondary"
              style={{
                width: '42px',
                height: '42px',
                padding: 0,
                borderRadius: '50%',
                justifyContent: 'center'
              }}
              aria-label="Próximas avaliações"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .google-score-box {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
};
