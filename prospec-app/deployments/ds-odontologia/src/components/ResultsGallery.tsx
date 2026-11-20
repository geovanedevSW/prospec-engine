import React, { useState, useRef } from 'react';
import { caseStudies, contactInfo } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CheckCircle2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResultsGalleryProps {
  onSelectCase: (caseTitle: string) => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ onSelectCase }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    setActiveIndex(index);
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.clientWidth;
      const newIndex = Math.round(carouselRef.current.scrollLeft / itemWidth);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < caseStudies.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  return (
    <section id="casos" className="section section-alt" style={{ overflow: 'hidden' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <CheckCircle2 size={13} />
            <span>Casos Clínicos Reais</span>
          </div>
          <h2 className="section-title">
            Resultados que devolvem a confiança ao sorrir
          </h2>
          <p className="section-desc">
            Cada sorriso carrega uma história única de recuperação da autoestima e conforto ao mastigar. Veja alguns dos tratamentos realizados por nossos dentistas.
          </p>
        </div>

        {/* Desktop Grid / Mobile Carousel Container */}
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className="cases-carousel"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          {caseStudies.map((item) => (
            <div 
              key={item.id}
              className="case-card"
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img 
                  src={item.image} 
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <span 
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(37, 6, 61, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    letterSpacing: '0.01em'
                  }}
                >
                  {item.tag}
                </span>
              </div>

              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '6px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  {item.subtitle}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onSelectCase(item.title)}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      padding: '10px 14px',
                      fontSize: '13.5px'
                    }}
                  >
                    <span>Quero esse Resultado</span>
                    <ArrowRight size={14} />
                  </button>

                  <a 
                    href={`https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(`Olá! Vi o caso de ${item.title} no site e gostaria de saber se é indicado para mim.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                    style={{ padding: '10px 14px' }}
                    title="Perguntar no WhatsApp"
                  >
                    <WhatsAppIcon size={17} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Dots & Arrows — Rigorosamente centralizado */}
        <div 
          className="cases-carousel-controls"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '28px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <button
            onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
            className="btn-secondary"
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Caso anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {caseStudies.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                style={{
                  width: activeIndex === i ? '24px' : '8px',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  background: activeIndex === i ? 'var(--primary)' : 'var(--border-strong)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                aria-label={`Ir para caso ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => scrollToIndex(Math.min(caseStudies.length - 1, activeIndex + 1))}
            className="btn-secondary"
            style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            aria-label="Próximo caso"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .cases-carousel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
        }

        .case-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        /* Oculta controles no desktop largo onde os 3 cards já aparecem lado a lado */
        @media (min-width: 900px) {
          .cases-carousel-controls {
            display: none !important;
          }
        }

        @media (max-width: 899px) {
          .cases-carousel {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch !important;
            gap: 16px !important;
            padding-bottom: 8px !important;
            scrollbar-width: none;
            width: 100% !important;
          }
          .cases-carousel::-webkit-scrollbar {
            display: none;
          }
          .case-card {
            flex: 0 0 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            scroll-snap-align: start !important;
          }
          .cases-carousel-controls {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
    </section>
  );
};
