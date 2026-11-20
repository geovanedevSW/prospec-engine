import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Check, Calendar, Clock, Sparkles } from 'lucide-react';
import { siteData } from '../siteData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialService
}) => {
  const [selectedService, setSelectedService] = useState<string>(
    initialService || siteData.services[0].title
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tarde');
  const [customerName, setCustomerName] = useState<string>('');

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendToWhatsApp = () => {
    let text = `Olá Ana Paula!`;
    if (customerName.trim()) {
      text += ` Meu nome é *${customerName.trim()}*.`;
    }
    text += ` Gostaria de agendar um horário para *${selectedService}*`;
    if (selectedPeriod) {
      text += ` no período da *${selectedPeriod.toLowerCase()}*`;
    }
    text += `. Quais dias e horários você tem disponíveis?`;

    const url = `https://wa.me/${siteData.phoneNorm}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(28, 25, 23, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--ground-warm)'
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--accent)',
                fontWeight: 800
              }}
            >
              Agendamento Exclusivo
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-main)',
                marginTop: '2px'
              }}
            >
              Espaço Dellas • Baldim
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '999px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Service Selection */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '10px'
              }}
            >
              1. Escolha o serviço desejado:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {siteData.services.map((svc) => {
                const isSelected = selectedService === svc.title;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.title)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: isSelected ? 'var(--accent)' : 'var(--text-main)'
                        }}
                      >
                        {svc.title}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-subtle)',
                          marginTop: '2px'
                        }}
                      >
                        {svc.duration} • {svc.badge}
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: '#FFFFFF',
                          borderRadius: '999px',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Time / Shift */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '8px'
              }}
            >
              2. Preferência de turno:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {['Manhã', 'Tarde', 'Qualquer'].map((period) => {
                const isSelected = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--accent)' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '6px'
              }}
            >
              3. Seu nome (opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: Maria Alice"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                color: 'var(--text-main)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Action CTA */}
          <button
            onClick={handleSendToWhatsApp}
            className="btn-whatsapp"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '15px'
            }}
          >
            <MessageCircle size={19} strokeWidth={2.2} />
            <span>Confirmar e Chamar no WhatsApp</span>
          </button>

          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-subtle)',
              textAlign: 'center',
              lineHeight: 1.4,
              marginTop: '-6px'
            }}
          >
            Você será direcionado para o WhatsApp oficial do salão para combinar o melhor dia e
            horário diretamente com a Ana Paula.
          </p>
        </div>
      </div>
    </div>
  );
};

