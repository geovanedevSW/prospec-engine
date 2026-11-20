import React, { useState } from 'react';
import { faqItems } from '../siteData';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section section-alt">
      <div className="container" style={{ maxWidth: '840px' }}>
        <div className="section-header">
          <div className="section-tag">
            <HelpCircle size={13} />
            <span>Dúvidas Frequentes</span>
          </div>
          <h2 className="section-title">
            Perguntas Frequentes
          </h2>
          <p className="section-desc">
            Informações claras e transparentes para você planejar seu tratamento com tranquilidade.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isOpen ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="faq-question-btn"
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    whiteSpace: 'normal'
                  }}
                  aria-expanded={isOpen}
                >
                  <span 
                    style={{
                      fontSize: '15.5px',
                      fontWeight: 700,
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      lineHeight: 1.35,
                      color: isOpen ? 'var(--primary)' : 'var(--text)'
                    }}
                  >
                    {item.question}
                  </span>
                  <div 
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                {isOpen && (
                  <div 
                    style={{
                      padding: '0 20px 20px 20px',
                      color: 'var(--text-muted)',
                      fontSize: '14.5px',
                      lineHeight: 1.65,
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '14px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .faq-question-btn {
            padding: 14px 16px !important;
          }
          .faq-question-btn span {
            font-size: 14.5px !important;
          }
        }
      `}</style>
    </section>
  );
};
