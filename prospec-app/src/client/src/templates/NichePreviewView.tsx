import React, { useState, useEffect } from 'react';
import { NicheLandingPage } from './NicheLandingPage.js';
import { TemplateLeadData } from './types.js';
import {
  HeartPulse,
  Wrench,
  Sparkles,
  UtensilsCrossed,
  PawPrint,
  Dumbbell,
  Hammer,
  ShoppingBag,
  Monitor,
  Smartphone,
  ExternalLink,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const NICHE_NAV = [
  { id: 'health', name: 'Saúde & Odonto', icon: HeartPulse, color: '#5B2329' },
  { id: 'auto', name: 'Oficina & Auto', icon: Wrench, color: '#EAB308' },
  { id: 'beauty', name: 'Beleza & Estética', icon: Sparkles, color: '#8A3D4D' },
  { id: 'gastro', name: 'Gastronomia & Bar', icon: UtensilsCrossed, color: '#C2410C' },
  { id: 'pet', name: 'Pet & Veterinária', icon: PawPrint, color: '#0D9488' },
  { id: 'fitness', name: 'Fitness & Academia', icon: Dumbbell, color: '#EAB308' },
  { id: 'services', name: 'Reparos & Serviços 24h', icon: Hammer, color: '#F59E0B' },
  { id: 'retail', name: 'Varejo & Hortifrúti', icon: ShoppingBag, color: '#059669' }
];

export const NichePreviewView: React.FC = () => {
  const [urlParams] = useState(() => new URLSearchParams(window.location.search));
  const initialNiche = urlParams.get('niche') || 'health';
  const initialViewport = (urlParams.get('viewport') as 'desktop' | 'mobile') || 'desktop';
  const leadId = urlParams.get('leadId') || undefined;

  const [activeNiche, setActiveNiche] = useState<string>(initialNiche);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>(initialViewport);
  const [lead, setLead] = useState<TemplateLeadData | undefined>(undefined);
  const [loadingLead, setLoadingLead] = useState<boolean>(!!leadId);

  // Detecta se está em iframe ou página cheia
  const isEmbedded = window.self !== window.top;

  // Busca dados do lead real se leadId estiver na query string
  useEffect(() => {
    if (!leadId) {
      setLoadingLead(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/leads/${leadId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar lead');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const l = data.lead || data;
        if (l) {
          setLead({
            id: l.id,
            name: l.name,
            tradeName: l.tradeName || l.name,
            category: l.category,
            address: l.address,
            city: l.city,
            phone: l.phone,
            rating: l.rating,
            reviewsCount: l.reviewsCount
          });
        }
      })
      .catch((err) => {
        console.warn('Usando dados sintéticos para o preview:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingLead(false);
      });

    return () => {
      isMounted = false;
    };
  }, [leadId]);

  return (
    <div className="w-full min-h-screen bg-neutral-100 text-neutral-900">
      {/* Barra superior de controle para visualização standalone (fora do iframe) */}
      {!isEmbedded && (
        <header className="sticky top-0 z-50 bg-[#0F172A] text-white border-b border-white/10 px-4 py-2.5 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Esquerda: Identidade & Link para Central */}
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Voltar à Central</span>
              </a>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white">Preview React 18 + Vite + TSX</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                  GSAP ScrollTrigger Ativo
                </span>
              </div>
            </div>

            {/* Centro: Pills de seleção dos 8 Nichos */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {NICHE_NAV.map((n) => {
                const Icon = n.icon;
                const isActive = activeNiche === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setActiveNiche(n.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-[#0F172A] shadow-md scale-105'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Icon size={12} style={{ color: isActive ? n.color : undefined }} />
                    <span>{n.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Direita: Alternador de Viewport (Desktop / Mobile) */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-white/10 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all ${
                    viewport === 'desktop' ? 'bg-white text-[#0F172A]' : 'text-white/70 hover:text-white'
                  }`}
                  title="Modo Desktop (1280px)"
                >
                  <Monitor size={14} />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-1.5 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-all ${
                    viewport === 'mobile' ? 'bg-white text-[#0F172A]' : 'text-white/70 hover:text-white'
                  }`}
                  title="Modo Mobile (390px)"
                >
                  <Smartphone size={14} />
                  <span className="hidden sm:inline">390px</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Container de exibição do template */}
      <div
        className={
          viewport === 'mobile' && !isEmbedded
            ? 'mx-auto my-6 max-w-[390px] border-8 border-neutral-800 rounded-[36px] overflow-hidden shadow-2xl bg-white'
            : 'w-full'
        }
      >
        <NicheLandingPage nicheKey={activeNiche} lead={lead} viewport={viewport} />
      </div>
    </div>
  );
};

