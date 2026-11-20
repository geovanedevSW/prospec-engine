import React from 'react';
import { Phone, MapPin, Clock, Star, Wrench, ShieldCheck, ChevronRight, MessageSquare, Car, CheckCircle2 } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const AutoTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Centro Automotivo & Mecânica');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const symptoms = [
    { title: 'Barulho Estranho ao Frear', desc: 'Chiado, pedal trepidando ou freio baixo', icon: 'Disc' },
    { title: 'Luz da Injeção Acesa', desc: 'Falha no motor, engasgando ou perda de potência', icon: 'Engine' },
    { title: 'Ar-Condicionado Fraco', desc: 'Não gela, cheiro ruim ou barulho ao ligar', icon: 'Wind' },
    { title: 'Barulho na Suspensão', desc: 'Batida seca em buracos, folgas ou rangidos', icon: 'Car' },
    { title: 'Troca de Óleo & Filtros', desc: 'Óleo sintético no padrão original de montadora', icon: 'Droplet' },
    { title: 'Revisão Preventiva', desc: 'Checkup completo de 40 itens antes de viajar', icon: 'CheckSquare' }
  ];

  const workflow = [
    { step: '01', title: 'Diagnóstico com Foto/Vídeo', desc: 'Identificamos o problema e enviamos foto e vídeo da peça danificada no WhatsApp.' },
    { step: '02', title: 'Orçamento Aprovado', desc: 'Você recebe o valor das peças e mão de obra discriminados antes de iniciar o serviço.' },
    { step: '03', title: 'Peças de Qualidade', desc: 'Instalamos peças originais ou de primeira linha com selo Inmetro e garantia.' },
    { step: '04', title: 'Garantia de 1 Ano', desc: 'Você sai da oficina com garantia formal e nota fiscal de tudo o que foi feito.' }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Top Strip */}
      <div className="bg-[#1E293B] text-[#94A3B8] py-2 px-4 text-xs text-center flex items-center justify-center gap-3 font-medium border-b border-[#334155]">
        <span>{ctx.bname} • Oficina Mecânica de Confiança em {ctx.city}</span>
        <span className="opacity-40">•</span>
        <span className="text-[#EAB308] font-bold">Diagnóstico Rápido e Sem Compromisso!</span>
      </div>

      {/* Header */}
      <header className="border-b border-[#1E293B] py-4 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-white font-black text-xl tracking-tight">
            <Wrench className="text-[#EAB308]" size={20} />
            <span>{ctx.bname}</span>
          </a>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${ctx.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#334155] text-[#94A3B8] hover:text-white text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
            >
              <Phone size={14} />
              <span>{ctx.phone}</span>
            </a>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EAB308] hover:bg-[#CA8A04] text-[#0F172A] text-xs font-black whitespace-nowrap shrink-0 transition-all hover:scale-105"
            >
              <span>Pedir Diagnóstico</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-18 relative">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#1E293B] border border-[#334155] text-[#EAB308] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
              <ShieldCheck size={14} />
              <span>Transparência Total & Garantia de 1 Ano</span>
            </div>
            <h1 className="hero-title text-3xl sm:text-5xl font-black text-white leading-[1.15] mb-5">
              Cuidado profissional para o seu carro <span className="text-[#EAB308]">sem sustos na conta.</span>
            </h1>
            <p className="hero-sub text-[#94A3B8] text-base leading-relaxed mb-6 max-w-xl">
              Chega de oficinas que trocam peças sem você saber. Na {ctx.bname}, você recebe fotos e vídeos do problema e aprova tudo antes.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/20 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Enviar Sintoma no WhatsApp</span>
              </a>
              <a
                href="#sintomas"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Escolher Sintoma do Carro</span>
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative anim-hero">
            <div className="rounded-3xl overflow-hidden border border-[#334155] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80"
                alt={`${ctx.bname} Oficina Mecânica`}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            <div className="hero-card absolute -bottom-5 left-4 right-4 bg-[#1E293B]/95 backdrop-blur-md border border-[#334155] rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-[#94A3B8]">Média de Satisfação</div>
                <div className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
                  <Star size={14} className="text-[#EAB308] fill-[#EAB308]" />
                  <span>{ctx.rating} no Google ({ctx.revCount} clientes)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#EAB308] bg-[#0F172A] px-3 py-1 rounded-lg border border-[#334155]">
                Garantia 1 Ano
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Symptom Triage Selector */}
      <section id="sintomas" className="anim-section py-14 bg-[#1E293B] border-y border-[#334155]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EAB308]">Triagem Rápida</span>
            <h2 className="section-title text-2xl sm:text-3xl font-black text-white mt-1 mb-2">
              O que o seu carro está sentindo hoje?
            </h2>
            <p className="text-sm text-[#94A3B8]">Toque no sintoma para receber orientação e estimativa imediata.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptoms.map((s) => (
              <a
                key={s.title}
                href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                  `Olá! Meu carro está com o seguinte sintoma: "${s.title}" (${s.desc}) em ${ctx.city}. Podem me passar uma estimativa?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="triage-btn bg-[#0F172A] border border-[#334155] hover:border-[#EAB308] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group"
              >
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#EAB308] transition-colors mb-1">{s.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">{s.desc}</p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#EAB308]">
                  <span>Consultar no WhatsApp</span>
                  <ChevronRight size={13} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="anim-section py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#EAB308]">Como Trabalhamos</span>
            <h2 className="section-title text-2xl sm:text-3xl font-black text-white mt-1 mb-2">
              4 Passos de Confiança
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflow.map((w) => (
              <div key={w.step} className="anim-card bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
                <span className="text-xs font-black text-[#EAB308] tracking-widest">{w.step}</span>
                <h3 className="text-base font-bold text-white mt-2 mb-2">{w.title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-8 text-xs text-[#64748B] bg-[#0F172A]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-white text-sm">{ctx.bname} • Mecânica & Auto Center</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#EAB308] font-bold hover:underline">
            Pedir Orçamento sem Compromisso &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-[#1E293B] p-3 flex items-center gap-2.5 z-50">
        <a
          href={`tel:${ctx.phoneClean}`}
          className="flex-1 py-3 px-4 rounded-full bg-[#1E293B] border border-[#334155] text-white text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
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

