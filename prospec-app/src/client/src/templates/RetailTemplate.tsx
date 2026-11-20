import React from 'react';
import { Phone, MapPin, Clock, Star, ShoppingBag, ShieldCheck, ChevronRight, MessageSquare, CheckCircle2, Sparkles } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const RetailTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Hortifrúti, Empório & Mercearia Fina');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const products = [
    { name: 'Tomate Italiano Selecionado', unit: 'kg', price: '6,99', tag: 'Mais Pedido', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80' },
    { name: 'Morango Doce da Serra', unit: 'bandeja 250g', price: '9,90', tag: 'Fresquinho', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80' },
    { name: 'Banana Prata Premium', unit: 'kg', price: '5,49', tag: 'Colheita da Semana', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80' },
    { name: 'Ovos Caipiras da Fazenda', unit: 'dúzia', price: '17,90', tag: 'Orgânico', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80' },
    { name: 'Queijo Minas Meia Cura', unit: 'peça ~500g', price: '34,90', tag: 'Artesanal', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80' },
    { name: 'Melancia Baby Super Doce', unit: 'unidade', price: '12,90', tag: 'Oferta', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' }
  ];

  const steps = [
    { step: '01', title: 'Envie sua lista no WhatsApp', desc: 'Pode ser em áudio, foto do papel ou digitado. Aceitamos qualquer formato.' },
    { step: '02', title: 'Nós escolhemos a dedo', desc: 'Nossa equipe seleciona os itens mais frescos, maduros e bonitos da feira.' },
    { step: '03', title: 'Entrega rápida na sua porta', desc: 'Receba em até 45 minutos no seu bairro. Pague com Pix, cartão ou dinheiro.' }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAFDF7] text-[#1F2937] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-[#064E3B] text-[#D1FAE5] py-2 px-4 text-xs text-center flex items-center justify-center gap-2 font-medium">
        <span>Feira Fresca de Hoje • <strong>Peça pelo WhatsApp e receba em até 45 min em {ctx.city}!</strong></span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E2EED8] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-[#064E3B] font-black text-xl tracking-tight">
            <ShoppingBag className="text-[#059669]" size={22} />
            <span>{ctx.bname}</span>
          </a>
          <a
            href={ctx.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-md shadow-[#25D366]/20 transition-all hover:scale-105"
          >
            <MessageSquare size={14} />
            <span>Pedir no WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#ECFDF5] border border-[#A7F3D0] text-[#064E3B] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
              <ShieldCheck size={14} className="text-[#059669]" />
              <span>Hortifrúti Selecionado, Queijos & Mercearia Fina</span>
            </div>
            <h1 className="hero-title text-3xl sm:text-5xl font-black text-[#064E3B] leading-[1.15] mb-5">
              Frutas, Verduras e Empório <span className="text-[#059669]">selecionados como se fosse por você.</span>
            </h1>
            <p className="hero-sub text-[#6B7280] text-base leading-relaxed mb-6 max-w-xl">
              Diga adeus às frutas machucadas do supermercado. No {ctx.bname}, escolhemos peça por peça os melhores itens do dia e levamos até a sua porta.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Enviar Lista pelo WhatsApp</span>
              </a>
              <a
                href="#ofertas"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#ECFDF5] text-[#064E3B] border border-[#E2EED8] text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Ver Ofertas de Hoje</span>
                <ChevronRight size={15} />
              </a>
            </div>

            <div className="pt-6 border-t border-[#E2EED8] flex flex-wrap items-center gap-6 text-xs text-[#064E3B] font-semibold">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#059669]" />
                <span>Entrega em até 45 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={15} className="text-[#F59E0B] fill-[#F59E0B]" />
                <span>{ctx.rating}★ no Google ({ctx.revCount} clientes)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#059669]" />
                <span>Garantia de Frescor 100%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative anim-hero">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt={`${ctx.bname} Feira Fresca`}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            <div className="hero-card absolute -bottom-5 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#E2EED8] rounded-2xl p-4 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-black text-sm shrink-0">
                %
              </div>
              <div>
                <div className="text-xs font-black text-[#064E3B]">Feira de Terça & Quarta</div>
                <div className="text-[11px] text-[#6B7280]">Itens frescos com até 20% OFF</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="anim-section py-14 bg-white border-y border-[#E2EED8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="section-title text-2xl sm:text-3xl font-black text-[#064E3B] mb-2">
              Como Funciona o Delivery no WhatsApp?
            </h2>
            <p className="text-sm text-[#6B7280]">Fácil, rápido e sem complicações de aplicativos pesados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="anim-card bg-[#FAFDF7] border border-[#E2EED8] rounded-2xl p-6">
                <span className="text-xs font-black text-[#059669] tracking-widest">PASSO {s.step}</span>
                <h3 className="text-base font-bold text-[#064E3B] mt-2 mb-2">{s.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="ofertas" className="anim-section py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="section-title text-2xl sm:text-3xl font-black text-[#064E3B] mb-2">
              Destaques Frescos de Hoje
            </h2>
            <p className="text-sm text-[#6B7280]">Valores válidos para entrega ou retirada hoje em {ctx.city}.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.name}
                className="anim-card bg-white border border-[#E2EED8] hover:border-[#A7F3D0] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute top-3 left-3 bg-white/90 text-[#064E3B] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    {p.tag}
                  </span>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-base font-bold text-[#064E3B] mb-0.5">{p.name}</h3>
                    <div className="text-xs text-[#6B7280] mb-4">Preço por {p.unit}</div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                    <div className="text-lg font-black text-[#064E3B]">
                      <small className="text-xs font-semibold text-[#6B7280]">R$ </small>{p.price}
                    </div>
                    <a
                      href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                        `Olá! Gostaria de pedir ${p.name} (R$ ${p.price}/${p.unit}) pelo delivery do ${ctx.bname}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] hover:bg-[#25D366] text-[#059669] hover:text-white text-xs font-bold transition-colors"
                    >
                      <MessageSquare size={12} />
                      <span>Pedir</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2EED8] py-8 text-xs text-[#6B7280]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-[#064E3B] text-sm">{ctx.bname} • Hortifrúti & Empório</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#059669] font-bold hover:underline">
            Fazer Pedido pelo WhatsApp &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2EED8] p-3 flex items-center gap-2.5 z-50">
        <a
          href={`tel:${ctx.phoneClean}`}
          className="flex-1 py-3 px-4 rounded-full bg-white border border-[#E2EED8] text-[#064E3B] text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
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
          <span>Pedir no WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

