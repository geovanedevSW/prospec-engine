import React, { useState } from 'react';

interface CentralPipelineStreamChartProps {
  className?: string;
  activeMonth?: string;
  onSelectMonth?: (month: string) => void;
}

export function CentralPipelineStreamChart({
  className = '',
  activeMonth = 'Nov',
  onSelectMonth
}: CentralPipelineStreamChartProps) {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const months = [
    { key: 'Ago', label: 'Ago', x: 140 },
    { key: 'Set', label: 'Set', x: 260 },
    { key: 'Out', label: 'Out', x: 390 },
    { key: 'Nov', label: 'Nov', x: 520, isCurrent: true },
    { key: 'Dez', label: 'Dez', x: 640 },
    { key: 'Jan', label: 'Jan', x: 760 }
  ];

  const yLabelsTop = [
    { label: '1.6k', y: 38 },
    { label: '1.2k', y: 78 },
    { label: '800', y: 118 },
    { label: '400', y: 158 },
    { label: '0', y: 198 }
  ];

  const yLabelsBottom = [
    { label: '0', y: 206 },
    { label: '400', y: 238 },
    { label: '800', y: 270 },
    { label: '1.2k', y: 302 }
  ];

  return (
    <div className={`w-full relative select-none font-sans ${className}`}>
      <svg
        viewBox="0 0 840 330"
        className="w-full h-auto overflow-visible"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Subtle Glow filters for each neon curve */}
          <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#F59E0B" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FEF08A" floodOpacity="0.9" />
          </filter>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.75" />
          </filter>
          <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.7" />
          </filter>
          <filter id="glow-pink" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#EC4899" floodOpacity="0.7" />
          </filter>
          <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.7" />
          </filter>

          {/* Gradients */}
          <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="35%" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FDE047" stopOpacity="1" />
            <stop offset="65%" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891B2" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="1" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DB2777" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F472B6" stopOpacity="1" />
            <stop offset="100%" stopColor="#DB2777" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity="1" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Horizontal subtle grid lines */}
        {yLabelsTop.map((item) => (
          <line
            key={`grid-top-${item.y}`}
            x1="80"
            y1={item.y}
            x2="800"
            y2={item.y}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}

        {yLabelsBottom.slice(1).map((item) => (
          <line
            key={`grid-bot-${item.y}`}
            x1="80"
            y1={item.y}
            x2="800"
            y2={item.y}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
          />
        ))}

        {/* Central Baseline divider line at y=198 */}
        <line
          x1="80"
          y1="198"
          x2="800"
          y2="198"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />

        {/* Y Axis Labels (Left Column) */}
        {yLabelsTop.map((item) => (
          <text
            key={`label-top-${item.label}-${item.y}`}
            x="64"
            y={item.y + 4}
            fill="#52525B"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
            className="select-none"
          >
            {item.label}
          </text>
        ))}

        {yLabelsBottom.map((item) => (
          <text
            key={`label-bot-${item.label}-${item.y}`}
            x="64"
            y={item.y + 4}
            fill="#3F3F46"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
            className="select-none"
          >
            {item.label}
          </text>
        ))}

        {/* INVERTED GRAPHITE CURVES (Reflexo de profundidade abaixo da linha 0) */}
        <path
          d="M 120,198 C 210,198 290,296 390,296 C 490,296 570,198 670,198 L 780,198"
          fill="none"
          stroke="#2A2A30"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M 120,198 C 215,198 295,274 390,274 C 485,274 570,198 670,198 L 780,198"
          fill="none"
          stroke="#32323A"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <path
          d="M 120,198 C 220,198 300,252 390,252 C 480,252 565,198 670,198 L 780,198"
          fill="none"
          stroke="#3C3C46"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <path
          d="M 120,198 C 225,198 305,228 390,228 C 475,228 560,198 670,198 L 780,198"
          fill="none"
          stroke="#484854"
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* CURVAS NEON SUPERIORES (Camadas empilhadas) */}
        {/* Curva 5: Fitness & Outros (Roxo) */}
        <path
          d="M 120,198 C 230,198 310,166 390,166 C 470,166 550,198 660,198 L 780,198"
          fill="none"
          stroke="url(#grad-purple)"
          strokeWidth="2.2"
          filter="url(#glow-purple)"
        />

        {/* Curva 4: Pet Shop (Rosa) */}
        <path
          d="M 120,198 C 225,198 305,144 390,144 C 475,144 555,198 660,198 L 780,198"
          fill="none"
          stroke="url(#grad-pink)"
          strokeWidth="2.2"
          filter="url(#glow-pink)"
        />

        {/* Curva 3: Saúde & Odonto (Azul) */}
        <path
          d="M 120,198 C 220,198 300,122 390,122 C 480,122 560,198 660,198 L 780,198"
          fill="none"
          stroke="url(#grad-blue)"
          strokeWidth="2.4"
          filter="url(#glow-blue)"
        />

        {/* Curva 2: Automotivo (Ciano) */}
        <path
          d="M 120,198 C 215,198 295,96 390,96 C 485,96 565,198 660,198 L 780,198"
          fill="none"
          stroke="url(#grad-cyan)"
          strokeWidth="2.4"
          filter="url(#glow-cyan)"
        />

        {/* Curva 1: Beleza & Estética (Âmbar Dourado, maior volume) */}
        <path
          d="M 120,198 C 210,198 290,68 390,68 C 490,68 570,198 660,198 L 780,198"
          fill="none"
          stroke="url(#grad-gold)"
          strokeWidth="2.8"
          filter="url(#glow-gold)"
        />

        {/* Linha vertical de referência no mês ativo */}
        <line
          x1="390"
          y1="68"
          x2="390"
          y2="296"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeDasharray="2 3"
          strokeWidth="1"
        />

        {/* Ponto indicador no pico */}
        <circle
          cx="390"
          cy="68"
          r="3.5"
          fill="#FFF"
          stroke="#F59E0B"
          strokeWidth="2"
        />

        {/* Rótulos dos meses no eixo X */}
        {months.map((m) => {
          const isSelected = (hoveredMonth || activeMonth) === m.key;
          return (
            <g
              key={m.key}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredMonth(m.key)}
              onMouseLeave={() => setHoveredMonth(null)}
              onClick={() => onSelectMonth?.(m.key)}
            >
              <text
                x={m.x}
                y="322"
                fill={isSelected ? '#F4F4F5' : '#71717A'}
                fontSize="11"
                fontWeight={isSelected ? '600' : '400'}
                textAnchor="middle"
                className="transition-colors duration-150 select-none"
              >
                {m.label}
              </text>
              {isSelected && (
                <circle
                  cx={m.x}
                  cy="328"
                  r="1.5"
                  fill="#F59E0B"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

