import React from 'react';
import { Phone, MapPin, Clock, Star, Sparkles, ChevronRight, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const BeautyTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Estética Avançada & Salão');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const procedures = [
    { title: 'Harmonização & Preenchimento Facial', desc: 'Realce natural das suas feições com ácido hialurônico de alta pureza.', duration: '50 min', tag: 'Destaque' },
    { title: 'Limpeza de Pele Profunda com Hidrosucção', desc: 'Extração indolor, peeling de diamante e máscara calmante de ouro.', duration: '60 min', tag: 'Cuidados' },
    { title: 'Massagem Relaxante & Drenagem Linfática', desc: 'Alívio imediato do estresse e redução de retenção com óleos essenciais.', duration: '60 min', tag: 'Bem-estar' },
    { title: 'Design de Sobrancelhas & Lash Lifting', desc: 'Fios alinhados, curvatura dos cílios naturais e pigmentação harmônica.', duration: '45 min', tag: 'Olhar Marcante' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Top Strip */}
      <div className="bg-[#8A3D4D] text-[#FAF8F5] py-2 px-4 text-xs text-center flex items-center justify-center gap-3 font-medium">
        <span>{ctx.bname} • Estética & Bem-Estar em {ctx.city}</span>
        <span className="opacity-40">•</span>
        <span>Atendimento Exclusivo com Horário Marcado</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E8E2D9] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="text-[#8A3D4D] font-serif font-black text-2xl tracking-tight">
            {ctx.bname}
          </a>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${ctx.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D6D3D1] text-[#57534E] hover:text-[#8A3D4D] text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
            >
              <Phone size={14} />
              <span>{ctx.phone}</span>
            </a>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8A3D4D] hover:bg-[#6E303D] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-md shadow-[#8A3D4D]/20 transition-all hover:scale-105"
            >
              <Sparkles size={14} />
              <span>Agendar Horário</span>
            </a>
          </div>
        </div>
      </header>

      {/* Editorial Hero */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#F3ECE6] text-[#8A3D4D] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#E8E2D9]">
              <Sparkles size={14} />
              <span>Estética Facial, Corporal & Spa de Beleza</span>
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl font-black font-serif text-[#1C1917] leading-[1.15] mb-5">
              O seu momento de <span className="text-[#8A3D4D]">pausa, cuidado e transformação.</span>
            </h1>
            <p className="hero-sub text-[#57534E] text-base leading-relaxed mb-6 max-w-xl">
              Ambiente privativo e acolhedor projetado para você relaxar enquanto realça a sua beleza natural com protocolos personalizados.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Agendar pelo WhatsApp</span>
              </a>
              <a
                href="#procedimentos"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#F3ECE6] text-[#8A3D4D] border border-[#E8E2D9] text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Ver Procedimentos</span>
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative anim-hero">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=80"
                alt={`${ctx.bname} Salão`}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            <div className="hero-card absolute -bottom-5 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#E8E2D9] rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-[#57534E]">Clientes Encantadas</div>
                <div className="text-sm font-black text-[#1C1917] flex items-center gap-1 mt-0.5">
                  <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                  <span>{ctx.rating} ★★★★★ ({ctx.revCount} avaliações)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#8A3D4D] bg-[#F3ECE6] px-3 py-1 rounded-lg">
                Espaço VIP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures Table */}
      <section id="procedimentos" className="anim-section py-14 bg-white border-y border-[#E8E2D9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A3D4D]">Menu de Procedimentos</span>
            <h2 className="section-title text-3xl font-black font-serif text-[#1C1917] mt-1 mb-2">
              Protocolos de Alta Performance
            </h2>
            <p className="text-sm text-[#57534E]">Duração programada sem pressa para garantir resultados perfeitos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {procedures.map((p) => (
              <div
                key={p.title}
                className="anim-card bg-[#FAF8F5] border border-[#E8E2D9] hover:border-[#8A3D4D] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold text-[#8A3D4D] bg-white px-2.5 py-0.5 rounded-full border border-[#E8E2D9]">
                      {p.tag}
                    </span>
                    <span className="text-xs font-bold text-[#57534E] flex items-center gap-1">
                      <Clock size={13} />
                      <span>{p.duration}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1C1917] font-serif mb-2">{p.title}</h3>
                  <p className="text-xs text-[#57534E] leading-relaxed mb-4">{p.desc}</p>
                </div>
                <a
                  href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                    `Olá! Gostaria de agendar o procedimento "${p.title}" na ${ctx.bname} em ${ctx.city}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A3D4D] hover:underline"
                >
                  <span>Reservar este horário no WhatsApp</span>
                  <ChevronRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E2D9] py-8 text-xs text-[#57534E]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-[#1C1917] text-sm">{ctx.bname} • Estética & Salão</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#8A3D4D] font-bold hover:underline">
            Consultar Disponibilidade de Horários &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E2D9] p-3 flex items-center gap-2.5 z-50">
        <a
          href={`tel:${ctx.phoneClean}`}
          className="flex-1 py-3 px-4 rounded-full bg-white border border-[#D6D3D1] text-[#1C1917] text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
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
          <span>Agendar no WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

