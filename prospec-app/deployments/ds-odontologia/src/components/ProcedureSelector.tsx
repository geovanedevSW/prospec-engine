import React, { useState } from 'react';
import { proceduresList } from '../siteData';
import { Search, Calendar, ChevronDown } from 'lucide-react';

interface ProcedureSelectorProps {
  onSelectProcedure: (procedureTitle: string) => void;
}

export const ProcedureSelector: React.FC<ProcedureSelectorProps> = ({ onSelectProcedure }) => {
  const [selectedId, setSelectedId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      onSelectProcedure('Consulta Geral');
      return;
    }
    const proc = proceduresList.find(p => p.id === selectedId);
    onSelectProcedure(proc ? proc.title : 'Consulta Geral');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        background: '#FFFFFF',
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '560px',
        width: '100%',
        marginTop: '28px'
      }}
    >
      <div>
        <label 
          htmlFor="hero-procedure-select"
          style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '4px'
          }}
        >
          Qual procedimento você procura?
        </label>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Selecione e veja horários e dentistas disponíveis em Contagem.
        </p>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            id="hero-procedure-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              width: '100%',
              height: '50px',
              padding: '0 42px 0 16px',
              fontSize: '14.5px',
              fontFamily: 'Inter, sans-serif',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--bg-light)',
              color: 'var(--text)',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <option value="">Selecione o procedimento...</option>
            {proceduresList.map(proc => (
              <option key={proc.id} value={proc.id}>
                {proc.title}
              </option>
            ))}
          </select>
          <div 
            style={{
              position: 'absolute',
              right: '16px',
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)'
            }}
          >
            <ChevronDown size={18} style={{ display: 'block' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <button
          type="submit"
          className="btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '14px 20px',
            fontSize: '14.5px'
          }}
        >
          <Calendar size={18} />
          <span>Ver Horários e Agendar</span>
        </button>
      </div>
    </form>
  );
};

