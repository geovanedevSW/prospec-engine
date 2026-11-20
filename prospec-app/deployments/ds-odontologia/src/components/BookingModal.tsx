import React, { useState, useEffect } from 'react';
import { proceduresList, contactInfo } from '../siteData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { X, Calendar, CheckCircle, Clock, User, Phone, Building2, ChevronDown } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProcedure?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialProcedure }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<'contagem' | 'betim'>('contagem');
  const [selectedProc, setSelectedProc] = useState(initialProcedure || 'Consulta Geral');
  const [shift, setShift] = useState<'manha' | 'tarde' | 'sabado'>('manha');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialProcedure) {
      setSelectedProc(initialProcedure);
    }
  }, [initialProcedure]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const unitLabel = selectedUnit === 'contagem' ? 'Unidade Contagem (Centro)' : 'Unidade Betim (Jardim Teresópolis)';
    const shiftLabel = shift === 'manha' ? 'Manhã (08h às 12h)' : shift === 'tarde' ? 'Tarde (13h às 19h)' : 'Sábado (08h às 13h)';
    const text = `*Agendamento pelo Site - DS Odontologia*
Unidade: ${unitLabel}
Nome: ${name.trim() || 'Não informado'}
Telefone: ${phone.trim() || 'Não informado'}
Procedimento: ${selectedProc}
Preferência de Turno: ${shiftLabel}${notes ? `\nObservações: ${notes.trim()}` : ''}`;

    const url = `https://wa.me/${contactInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div 
      className="booking-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(27, 4, 44, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="booking-modal-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 48px -10px rgba(37, 6, 61, 0.28), 0 0 0 1px rgba(91, 22, 140, 0.08)',
          position: 'relative',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Mobile Drag Indicator (Handle) */}
        <div className="booking-modal-drag-handle" aria-hidden="true" />

        {/* Sticky Header with Title and Close Button */}
        <div 
          style={{
            padding: '20px 24px 14px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            position: 'relative',
            background: '#FFFFFF',
            zIndex: 2
          }}
        >
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '6px'
              }}
            >
        <div className="booking-modal-header">
          <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
            <div className="booking-modal-badge">
              <Calendar size={12} />
              <span>Agendamento Online</span>
            </div>
            <h3 style={{ fontSize: '19px', color: 'var(--text)', fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
            <h3 id="booking-modal-title" className="booking-modal-title">
              Marque sua consulta na DS Odontologia
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            <p className="booking-modal-subtitle">
              Preencha seus dados para receber horários disponíveis no WhatsApp.
            </p>
          </div>

          {/* Close Button - Always visible, fixed in header */}
          <button
            onClick={onClose}
            type="button"
            style={{
              flexShrink: 0,
              marginLeft: '12px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--bg-light)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)',
              transition: 'all 0.15s ease'
            }}
            aria-label="Fechar"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-subtle)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-light)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            className="booking-modal-close-btn"
            aria-label="Fechar modal de agendamento"
          >
            <X size={17} strokeWidth={2.2} />
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Form Body (compact, fits without scrollbar on standard desktop) */}
        <div 
          className="booking-modal-body"
          style={{
            padding: '16px 24px 20px 24px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(91, 22, 140, 0.2) transparent'
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {/* Scrollable Form Body */}
        <div className="booking-modal-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Unit selector */}
            <div>
              <label htmlFor="booking-unit" style={labelStyle}>
                <Building2 size={13} style={{ color: 'var(--primary)' }} />
              <label htmlFor="booking-unit" className="booking-form-label">
                <Building2 size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Escolha a Unidade</span>
              </label>
              <div id="booking-unit" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedUnit('contagem')}
                  style={unitBtnStyle(selectedUnit === 'contagem')}
                >
                  Contagem (Centro)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUnit('betim')}
                  style={unitBtnStyle(selectedUnit === 'betim')}
                >
                  Betim (Teresópolis)
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="booking-name" style={labelStyle}>
                <User size={13} style={{ color: 'var(--primary)' }} />
              <label htmlFor="booking-name" className="booking-form-label">
                <User size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Seu Nome Completo</span>
              </label>
              <input
                id="booking-name"
                type="text"
                required
                placeholder="Ex: Mariana Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                className="booking-form-input"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="booking-phone" style={labelStyle}>
                <Phone size={13} style={{ color: 'var(--primary)' }} />
              <label htmlFor="booking-phone" className="booking-form-label">
                <Phone size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>WhatsApp com DDD</span>
              </label>
              <input
                id="booking-phone"
                type="tel"
                required
                placeholder="Ex: (31) 98557-9266"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                className="booking-form-input"
              />
            </div>

            {/* Procedure with Centered Dropdown Arrow */}
            <div>
              <label htmlFor="booking-proc" style={labelStyle}>
                <CheckCircle size={13} style={{ color: 'var(--primary)' }} />
              <label htmlFor="booking-proc" className="booking-form-label">
                <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Procedimento de Interesse</span>
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  id="booking-proc"
                  value={selectedProc}
                  onChange={(e) => setSelectedProc(e.target.value)}
                  className="booking-form-input"
                  style={{
                    ...inputStyle,
                    paddingRight: '40px',
                    paddingRight: '42px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {proceduresList.map(p => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <div 
                  style={{
                    position: 'absolute',
                    right: '14px',
                    right: '13px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  <ChevronDown size={18} strokeWidth={2} />
                  <ChevronDown size={18} strokeWidth={2.2} />
                </div>
              </div>
            </div>

            {/* Shift */}
            <div>
              <label htmlFor="booking-shift" style={labelStyle}>
                <Clock size={13} style={{ color: 'var(--primary)' }} />
              <label htmlFor="booking-shift" className="booking-form-label">
                <Clock size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Melhor Turno para Consulta</span>
              </label>
              <div id="booking-shift" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShift('manha')}
                  style={shiftBtnStyle(shift === 'manha')}
                >
                  Manhã
                </button>
                <button
                  type="button"
                  onClick={() => setShift('tarde')}
                  style={shiftBtnStyle(shift === 'tarde')}
                >
                  Tarde
                </button>
                <button
                  type="button"
                  onClick={() => setShift('sabado')}
                  style={shiftBtnStyle(shift === 'sabado')}
                >
                  Sábado
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="booking-notes" style={labelStyle}>
              <label htmlFor="booking-notes" className="booking-form-label">
                <span>Observações (opcional)</span>
              </label>
              <textarea
                id="booking-notes"
                rows={2}
                placeholder="Ex: Prefiro atendimento pela manhã, quero avaliar dente..."
                placeholder="Ex: Prefiro atendimento pela manhã..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...inputStyle, resize: 'none', height: '54px' }}
                className="booking-form-input"
                style={{ resize: 'none', height: '52px' }}
              />
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="btn-whatsapp"
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '14.5px',
                fontWeight: 600,
                justifyContent: 'center',
                marginTop: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              className="btn-whatsapp booking-submit-btn"
            >
              <WhatsAppIcon size={18} />
              <span>Confirmar e Enviar pelo WhatsApp</span>
            </button>

            <p style={{ fontSize: '11px', color: 'var(--text-light)', textAlign: 'center', margin: '2px 0 0 0' }}>
              Seus dados são protegidos. Responderemos prontamente em horário comercial.
              Seus dados são protegidos. Responderemos prontamente no WhatsApp.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '12.5px',
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: '5px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 13px',
  borderRadius: '10px',
  border: '1.5px solid var(--border)',
  fontSize: '13.5px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  color: 'var(--text)',
  backgroundColor: 'var(--bg-light)',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
};

const unitBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 10px',
  padding: '8px 6px',
  borderRadius: '10px',
  border: active ? '2px solid var(--primary)' : '1.5px solid var(--border)',
  background: active ? 'var(--primary-subtle)' : '#FFFFFF',
  color: active ? 'var(--primary)' : 'var(--text-muted)',
  fontWeight: 700,
  fontSize: '12.5px',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
  flexShrink: 0
});

const shiftBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 10px',
  padding: '8px 4px',
  borderRadius: '10px',
  border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
  background: active ? 'var(--primary-subtle)' : '#FFFFFF',
  color: active ? 'var(--primary)' : 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '12.5px',
  fontSize: '12px',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
  flexShrink: 0
});
