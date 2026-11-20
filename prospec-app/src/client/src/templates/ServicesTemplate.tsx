import React from 'react';
import { Phone, MapPin, Clock, Star, Zap, ShieldCheck, ChevronRight, MessageSquare, AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const ServicesTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Serviços & Reparos 24 Horas');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const emergencyOptions = [
    { title: 'Curto-Circuito / Sem Luz', desc: 'Cheiro de queimado ou disjuntor desarmando', tag: 'Urgente' },
    { title: 'Vazamento ou Infiltração', desc: 'Cano furado, registros ou caça-vazamento', tag: 'Chegada Rápida' },
    { title: 'Desentupimento sem Quebrar', desc: 'Pias, ralos, vasos e esgotos com maquinário', tag: 'Sem Quebra' },
    { title: 'Ar-Condicionado & Climatização', desc: 'Higienização profunda, recarga de gás ou instalação', tag: 'Garantia' },
  ];

  const serviceCategories = [
    {
      category: 'Elétrica Residencial & Predial',
      items: [
        'Troca de fiação antiga e quadros de distribuição',
        'Instalação de disjuntores DR e DPS contra raios',
        'Instalação de luminárias, pendentes, spots e LED',
        'Conserto de tomadas, interruptores e chuveiros',
        'Laudo técnico para concessionária de energia'
      ],
      cta: 'Chamar Eletricista'
    },
    {
      category: 'Hidráulica & Caça-Vazamentos',
      items: [
        'Localização eletrônica de vazamentos invisíveis (geofone)',
        'Troca de reparos de válvulas Hydra e caixas acopladas',
        'Instalação de torneiras monocomando e pressurizadores',
        'Substituição de colunas prediais e encanamentos',
        'Reparo emergencial de canos furados'
      ],
      cta: 'Chamar Encanador'
    },
    {
      category: 'Manutenção & Climatização',
      items: [
        'Higienização química anti-bactéria de splits',
        'Recarga de gás ecológico (R410A / R32)',
        'Instalação com teste de vácuo e suporte reforçado',
        'Manutenção de bombas d’água e caixas d’água',
        'Contratos de manutenção preventiva'
      ],
      cta: 'Solicitar Orçamento'
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Emergency Alert Bar */}
      <div className="bg-[#DC2626] text-white py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>Plantão de Emergência 24h em {ctx.city} • Média de Chegada em 40 Minutos</span>
      </div>

      {/* Header */}
      <header className="bg-[#0F172A] text-white py-4 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-black text-xl tracking-tight">
            <span>{ctx.bname}</span>
            <span className="bg-[#EA580C] text-white text-[10px] font-black px-2 py-0.5 rounded-md">24H</span>
          </a>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right text-xs">
              <div className="text-[#94A3B8]">Plantão Imediato</div>
              <div className="font-bold text-white text-sm">{ctx.phone}</div>
            </div>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-md shadow-[#25D366]/20 transition-all hover:scale-105"
            >
              <span>Pedir Técnico</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white py-14 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#93C5FD] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
              <ShieldCheck size={14} />
              <span>Eletricista, Encanador e Reparos com Garantia Formal</span>
            </div>
            <h1 className="hero-title text-3xl sm:text-5xl font-black leading-[1.15] mb-5">
              Problemas Elétricos ou Hidráulicos? <span className="text-[#F59E0B]">Técnico no seu local em até 40 min.</span>
            </h1>
            <p className="hero-sub text-[#CBD5E1] text-base leading-relaxed mb-6 max-w-xl">
              Sem enrolação e sem surpresas na conta. Diagnóstico honesto, orçamento sem compromisso e serviço executado com 90 dias de garantia e Nota Fiscal.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Chamar Técnico no WhatsApp</span>
              </a>
              <a
                href={`tel:${ctx.phoneClean}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/25 text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <Phone size={15} />
                <span>Ligar para o Plantão</span>
              </a>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-[#CBD5E1]">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                <span><strong>{ctx.rating}★ no Google</strong> ({ctx.revCount} clientes atendidos)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#34D399]" />
                <span><strong>100%</strong> Técnicos com Antecedentes Checados</span>
              </div>
            </div>
          </div>

          {/* Urgency Box */}
          <div className="lg:col-span-5 anim-hero">
            <div className="bg-white text-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl">
              <span className="inline-block bg-[#FEE2E2] text-[#DC2626] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-2">
                Prioridade de Despacho
              </span>
              <h3 className="text-xl font-black mb-5">Qual é a sua urgência agora?</h3>
              <div className="space-y-3">
                {emergencyOptions.map((opt) => (
                  <a
                    key={opt.title}
                    href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                      `Olá! Estou com uma emergência de ${opt.title} em ${ctx.city} e preciso de um técnico urgente.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#EA580C] hover:bg-[#FFF7ED] transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#EA580C]">{opt.title}</div>
                      <div className="text-[11px] text-[#64748B]">{opt.desc}</div>
                    </div>
                    <span className="text-[10px] font-bold bg-[#E2E8F0] group-hover:bg-[#EA580C] group-hover:text-white px-2 py-0.5 rounded-md text-[#334155] whitespace-nowrap">
                      {opt.tag}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento */}
      <section className="anim-section py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">Especialidades</span>
            <h2 className="section-title text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 mb-2">
              Serviços Executados com Padrão Profissional
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {serviceCategories.map((cat) => (
              <div key={cat.category} className="anim-card bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
                <div>
                  <h3 className="text-base font-black text-[#0F172A] mb-4">{cat.category}</h3>
                  <ul className="space-y-2.5 mb-6 text-xs text-[#334155]">
                    {cat.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                    `Olá! Gostaria de um orçamento para serviços de ${cat.category} em ${ctx.city}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold text-center block transition-colors shadow-md"
                >
                  {cat.cta} &rarr;
                </a>
              </div>
            ))}
          </div>

          {/* Coverage Box */}
          <div className="rounded-3xl bg-[#0F172A] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black mb-1">Atendimento Rápido em Toda {ctx.city}</h3>
              <p className="text-[#94A3B8] text-xs sm:text-sm">
                Nossos técnicos circulam pelos principais eixos da cidade para garantir chegada em menos de 45 minutos.
              </p>
            </div>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 hover:bg-[#20BA5A] transition-colors"
            >
              <MessageSquare size={16} />
              <span>Consultar Meu Bairro</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-[#0F172A] text-sm">{ctx.bname} • Plantão 24 Horas</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] font-bold hover:underline">
            Falar com Atendente de Plantão &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3 flex items-center gap-2.5 z-50">
        <a
          href={`tel:${ctx.phoneClean}`}
          className="flex-1 py-3 px-4 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Phone size={14} />
          <span>Ligar</span>
        </a>
        <a
          href={ctx.waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-2 py-3 px-4 rounded-full bg-[#25D366] text-white text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-md shadow-[#25D366]/30"
        >
          <MessageSquare size={14} />
          <span>Falar no WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

