import React from 'react';
import { Phone, MapPin, Clock, Star, Flame, Dumbbell, Zap, CheckCircle2, ChevronRight, MessageSquare, Award } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const FitnessTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Academia & Centro de Treinamento');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const modalities = [
    { title: 'Musculação Completa', desc: 'Maquinário de biomecânica avançada e pesos livres de padrão olímpico.', tag: 'Área Livre' },
    { title: 'CrossFit & Funcional', desc: 'WODs diários com acompanhamento de coach credenciado para todos os níveis.', tag: 'Alta Intensidade' },
    { title: 'Lutas & Artes Marciais', desc: 'Muay Thai, Jiu-Jitsu e Boxe com tatame oficial e segurança.', tag: 'Tatame' },
    { title: 'Aulas Coletivas & Ritmos', desc: 'Spinning, FitDance, Pilates solo e GAP para queimar calorias com energia.', tag: 'Coletivas' },
  ];

  const plans = [
    {
      name: 'Plano Black Anual',
      price: '79',
      period: '/mês',
      badge: 'Mais Popular • Sem Matrícula',
      features: ['Acesso livre a todas as áreas', 'Musculação + Aulas coletivas', 'Acompanhamento com treinador', 'Avaliação física por bioimpedância', 'Acesso sem restrição de horário'],
      featured: true
    },
    {
      name: 'Plano Semestral',
      price: '99',
      period: '/mês',
      badge: 'Sem Fidelidade Longa',
      features: ['Acesso livre à musculação', 'Aulas coletivas inclusas', 'Ficha de treino digital no app', 'Horário livre'],
      featured: false
    },
    {
      name: 'Plano Mensal Livre',
      price: '119',
      period: '/mês',
      badge: 'Flexibilidade Total',
      features: ['Acesso livre à musculação', 'Sem contrato ou multa de cancelamento', 'Pague mês a mês no Pix ou Cartão'],
      featured: false
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Marquee Ticker */}
      <div className="bg-[#FACC15] text-[#09090B] py-2 px-4 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-wider flex justify-around">
        <span>⚡ Matrícula Grátis esta semana</span>
        <span>•</span>
        <span>Musculação • CrossFit • Lutas • Spinning</span>
        <span>•</span>
        <span>Treine Hoje com Aula Experimental Gratuita!</span>
      </div>

      {/* Header */}
      <header className="border-b border-[#27272A] py-4 bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-white font-black text-xl tracking-tight">
            <Flame className="text-[#FACC15]" size={22} />
            <span>{ctx.bname}</span>
          </a>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${ctx.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
            >
              <Phone size={14} />
              <span>{ctx.phone}</span>
            </a>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#09090B] text-xs font-black whitespace-nowrap shrink-0 transition-all hover:scale-105"
            >
              <span>Agendar Aula Grátis</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-14 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#27272A] text-[#FACC15] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#3F3F46]">
              <Zap size={14} />
              <span>A Melhor Estrutura de Treino em {ctx.city}</span>
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none mb-6">
              Construa o seu <span className="text-[#FACC15]">melhor físico</span> todos os dias.
            </h1>
            <p className="hero-sub text-[#A1A1AA] text-base leading-relaxed mb-8 max-w-xl">
              Ambiente motivador, professores de verdade na sala, sem filas para revezar aparelhos e treinos desenhados para resultados reais.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-black uppercase tracking-wider whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/20 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Garantir Aula Grátis no WhatsApp</span>
              </a>
              <a
                href="#planos"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#3F3F46] text-white text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Ver Planos & Valores</span>
                <ChevronRight size={16} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative anim-hero">
            <div className="rounded-3xl overflow-hidden border border-[#27272A] shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
                alt={`${ctx.bname} Academia`}
                className="w-full h-84 sm:h-96 object-cover"
              />
            </div>
            <div className="hero-card absolute -bottom-5 left-4 right-4 bg-[#18181B]/95 backdrop-blur-md border border-[#3F3F46] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#A1A1AA]">Avaliação Média dos Alunos</div>
                <div className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
                  <Star size={14} className="text-[#FACC15] fill-[#FACC15]" />
                  <span>{ctx.rating} ★★★★★ ({ctx.revCount} alunos)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#FACC15] bg-[#27272A] px-3 py-1 rounded-lg">
                Top Academia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Modalities */}
      <section className="anim-section py-16 bg-[#18181B] border-y border-[#27272A]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">Modalidades</span>
            <h2 className="section-title text-3xl font-black uppercase text-white mt-1 mb-3">Tudo em um só lugar</h2>
            <p className="text-sm text-[#A1A1AA]">Treinos completos para queima calórica, hipertrofia, força e resistência.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {modalities.map((m) => (
              <div
                key={m.title}
                className="bento-item bg-[#09090B] border border-[#27272A] hover:border-[#FACC15] rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="inline-block text-[11px] font-bold text-[#FACC15] bg-[#27272A] px-2.5 py-0.5 rounded-full mb-3">
                  {m.tag}
                </div>
                <h3 className="text-base font-black text-white mb-2">{m.title}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section id="planos" className="anim-section py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">Valores & Planos</span>
            <h2 className="section-title text-3xl font-black uppercase text-white mt-1 mb-3">Sem Letras Miúdas</h2>
            <p className="text-sm text-[#A1A1AA]">Escolha o plano que melhor se adapta à sua rotina e comece a treinar hoje.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`pricing-card rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 ${
                  p.featured
                    ? 'bg-gradient-to-b from-[#27272A] to-[#18181B] border-2 border-[#FACC15] shadow-2xl shadow-[#FACC15]/10 scale-100 sm:scale-105'
                    : 'bg-[#18181B] border border-[#27272A]'
                }`}
              >
                <div>
                  <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${
                    p.featured ? 'bg-[#FACC15] text-[#09090B]' : 'bg-[#27272A] text-[#A1A1AA]'
                  }`}>
                    {p.badge}
                  </span>
                  <h3 className="text-xl font-black text-white mb-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-xs text-[#A1A1AA]">R$</span>
                    <span className="text-4xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-[#A1A1AA]">{p.period}</span>
                  </div>
                  <ul className="space-y-2.5 my-6 text-xs text-[#D4D4D8]">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 size={15} className="text-[#FACC15] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                    `Olá! Gostaria de me matricular no ${p.name} (R$ ${p.price}${p.period}) na ${ctx.bname} em ${ctx.city}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl text-center text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                    p.featured
                      ? 'bg-[#FACC15] hover:bg-[#EAB308] text-[#09090B] shadow-md shadow-[#FACC15]/20 hover:scale-[1.02]'
                      : 'bg-[#27272A] hover:bg-[#3F3F46] text-white'
                  }`}
                >
                  Matricular no WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272A] py-8 text-xs text-[#71717A] bg-[#09090B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-white text-sm">{ctx.bname} • Academia</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#FACC15] font-bold hover:underline">
            Tirar Dúvidas com Recepção &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#09090B]/95 backdrop-blur-md border-t border-[#27272A] p-3 flex items-center gap-2.5 z-50">
        <a
          href={`tel:${ctx.phoneClean}`}
          className="flex-1 py-3 px-4 rounded-full bg-[#18181B] border border-[#3F3F46] text-white text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
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

