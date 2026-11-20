import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteData } from '../siteData';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      style={{
        background: 'var(--ground-warm)',
        padding: '72px 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="container" style={{ maxWidth: '860px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            className="font-serif"
            style={{
              fontSize: '34px',
              color: 'var(--accent)',
              fontWeight: 400,
              marginBottom: '8px'
            }}
          >
            Dúvidas frequentes
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Informações práticas sobre nosso formato de atendimento.
          </p>
        </div>

        <div>
          {siteData.faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="faq-item-container"
                style={{
                  background: 'var(--card-bg)',
                  border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '14px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  boxShadow: isOpen ? '0 4px 16px rgba(138, 61, 77, 0.06)' : 'none'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: isOpen ? 'var(--accent)' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left'
                  }}
                  aria-expanded={isOpen}
                >
                  <span style={{ whiteSpace: 'normal !important' }}>{faq.question}</span>

                  <span
                    className="faq-icon"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isOpen ? 'var(--accent)' : 'var(--accent-light)',
                      color: isOpen ? '#FFFFFF' : 'var(--accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '18px 22px',
                      fontSize: '14px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      background: 'var(--ground)',
                      borderTop: '1px solid var(--border-light)'
                    }}
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
