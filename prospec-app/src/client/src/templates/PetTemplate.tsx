import React from 'react';
import { Phone, MapPin, Clock, Star, Heart, ShieldCheck, ChevronRight, MessageSquare, CheckCircle2, Award } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const PetTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Clínica Veterinária & Pet Shop');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const seals = [
    { title: 'Câmera ao Vivo no Banho', desc: 'Assista pelo celular seu pet tomando banho com carinho e sem estresse.' },
    { title: 'Zero Sedativos', desc: 'Respeito ao tempo e bem-estar do pet, sem qualquer sedação para tosa.' },
    { title: 'Shampoos Hipoalergênicos', desc: 'Cosméticos dermatológicos certificados que não agridem a pele e o pelo.' },
    { title: 'Táxi Dog Climatizado', desc: 'Buscamos e levamos com caixas higienizadas e ar-condicionado.' }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F0FDF4] text-[#1E293B] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Top Strip */}
      <div className="bg-[#064E3B] text-[#D1FAE5] py-2 px-4 text-xs text-center flex items-center justify-center gap-3 font-medium">
        <span>{ctx.bname} • Clínica Veterinária & Banho e Tosa em {ctx.city}</span>
        <span className="opacity-40">•</span>
        <span className="text-[#34D399] font-bold">Plantão com Veterinário Presente!</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#D1FAE5] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-[#0D9488] font-black text-xl tracking-tight">
            <Heart size={20} className="fill-[#0D9488]" />
            <span>{ctx.bname}</span>
          </a>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${ctx.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D1FAE5] text-[#0D9488] text-xs font-bold whitespace-nowrap shrink-0 hover:bg-[#F0FDF4] transition-colors"
            >
              <Phone size={14} />
              <span>{ctx.phone}</span>
            </a>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-md shadow-[#0D9488]/20 transition-all hover:scale-105"
            >
              <span>Agendar Banho / Consulta</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#DCFCE7] text-[#065F46] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#BBF7D0]">
              <ShieldCheck size={14} />
              <span>Amor, Paciência & Saúde Preventiva</span>
            </div>
            <h1 className="hero-title text-3xl sm:text-5xl font-black text-[#064E3B] leading-[1.15] mb-5">
              O carinho e a saúde que o seu <span className="text-[#0D9488]">melhor amigo merece.</span>
            </h1>
            <p className="hero-sub text-[#64748B] text-base leading-relaxed mb-6 max-w-xl">
              Consultas sem medo, vacinação em dia e estética animal com produtos de alto padrão para quem é da família.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Agendar no WhatsApp</span>
              </a>
              <a
                href="#pilares"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#DCFCE7] text-[#0D9488] border border-[#D1FAE5] text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Conhecer Nossos Cuidados</span>
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative anim-hero">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80"
                alt={`${ctx.bname} Pet`}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            <div className="hero-card absolute -bottom-5 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#D1FAE5] rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748B]">Pets Felizes & Tratados com Amor</div>
                <div className="text-sm font-black text-[#064E3B] flex items-center gap-1 mt-0.5">
                  <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                  <span>{ctx.rating} ★★★★★ ({ctx.revCount} tutores satisfeitos)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0D9488] bg-[#DCFCE7] px-3 py-1 rounded-lg">
                CRMV Ativo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 Big Pillars */}
      <section id="pilares" className="anim-section py-14 bg-white border-y border-[#D1FAE5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="pillar-card bg-[#F0FDF4] border border-[#D1FAE5] rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#0D9488] bg-white px-3 py-1 rounded-full mb-3">
                  Pilar Veterinário
                </div>
                <h3 className="text-2xl font-black text-[#064E3B] mb-3">Clínica & Medicina Preventiva</h3>
                <ul className="space-y-3 mb-6 text-sm text-[#334155]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0D9488]" />
                    <span>Consultas gerais e checkups geriátricos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0D9488]" />
                    <span>Vacinação importada (V10, Antirrábica, Gripe)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0D9488]" />
                    <span>Exames laboratoriais e ultrassom</span>
                  </li>
                </ul>
              </div>
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold text-center block transition-colors shadow-md"
              >
                Falar com a Veterinária
              </a>
            </div>

            <div className="pillar-card bg-[#F0FDF4] border border-[#D1FAE5] rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#065F46] bg-white px-3 py-1 rounded-full mb-3">
                  Pilar Estético
                </div>
                <h3 className="text-2xl font-black text-[#064E3B] mb-3">Banho & Tosa Relaxante</h3>
                <ul className="space-y-3 mb-6 text-sm text-[#334155]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#065F46]" />
                    <span>Hidratação profunda e desembaraço sem dor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#065F46]" />
                    <span>Tosa higiênica e tosa na tesoura por raça</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#065F46]" />
                    <span>Corte de unhas e limpeza de ouvidos inclusos</span>
                  </li>
                </ul>
              </div>
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-[#065F46] hover:bg-[#064E3B] text-white text-xs font-bold text-center block transition-colors shadow-md"
              >
                Agendar Banho do Pet
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Care Seals */}
      <section className="anim-section py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {seals.map((s) => (
              <div key={s.title} className="anim-card bg-white border border-[#D1FAE5] rounded-2xl p-5 text-center shadow-2xs">
                <ShieldCheck size={26} className="text-[#0D9488] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#064E3B] mb-1">{s.title}</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D1FAE5] py-8 text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-[#064E3B] text-sm">{ctx.bname} • Clínica Veterinária</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#0D9488] font-bold hover:underline">
            Tirar Dúvidas com Nossa Equipe &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#D1FAE5] p-3 flex items-center gap-2.5 z-50">
        <a
          href={`tel:${ctx.phoneClean}`}
          className="flex-1 py-3 px-4 rounded-full bg-white border border-[#D1FAE5] text-[#064E3B] text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
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

