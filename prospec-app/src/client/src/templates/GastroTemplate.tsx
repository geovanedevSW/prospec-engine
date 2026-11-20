import React from 'react';
import { Phone, MapPin, Clock, Star, UtensilsCrossed, ChevronRight, MessageSquare, Flame } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const GastroTemplate: React.FC<NicheTemplateProps> = ({ lead }) => {
  const ctx = resolveTemplateLead(lead, 'Restaurante & Bar');
  const containerRef = useScrollAnimation({ stagger: 0.1 });

  const signatureDish = {
    title: 'Picanha Nobre na Brasa com Risoto Trufado',
    desc: 'Corte alto de picanha uruguaia grelhada no ponto perfeito sobre brasa de lenha nobre, acompanhada de risoto de parmesão com toque de azeite trufado.',
    price: '89,90',
    serves: 'Serve 2 pessoas com fartura',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
  };

  const menuItems = [
    { name: 'Costela Angus Desfiada no Bafo', desc: '12h de cocção lenta, molho barbecue artesanal e mandioca na manteiga de garrafa.', price: '68,00', tag: 'Destaque' },
    { name: 'Risoto de Camarão com Limão Siciliano', desc: 'Arroz arbóreo cremoso, camarões médios salteados no azeite e raspas cítricas.', price: '72,00', tag: 'Frutos do Mar' },
    { name: 'Hambúrguer Artesanal da Casa (200g)', desc: 'Blend bovino na brasa, queijo cheddar inglês, bacon caramelizado e maionese defumada.', price: '42,00', tag: 'Mais Pedido' },
    { name: 'Petit Gâteau de Doce de Leite Viçosa', desc: 'Bolo quente com recheio cremoso e sorvete artesanal de queijo com goiabada cascão.', price: '28,00', tag: 'Sobremesa' }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Top Strip */}
      <div className="bg-[#431407] text-[#FFEDD5] py-2 px-4 text-xs text-center flex items-center justify-center gap-3 font-medium">
        <span>{ctx.bname} • Gastronomia de Raiz em {ctx.city}</span>
        <span className="opacity-40">•</span>
        <span className="text-[#FDBA74] font-bold">Cozinha Aberta para Almoço e Jantar!</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E7E5E4] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-[#C2410C] font-black text-xl tracking-tight font-serif">
            <UtensilsCrossed size={20} />
            <span>{ctx.bname}</span>
          </a>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${ctx.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D6D3D1] text-[#44403C] hover:text-[#C2410C] text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
            >
              <Phone size={14} />
              <span>{ctx.phone}</span>
            </a>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-md shadow-[#C2410C]/20 transition-all hover:scale-105"
            >
              <span>Reservar Mesa</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#FFEDD5] text-[#C2410C] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border border-[#FED7AA]">
              <Flame size={14} />
              <span>Cozinha Autoral, Carnes Nobres & Massas Artesanais</span>
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl font-black font-serif text-[#431407] leading-[1.15] mb-5">
              Momentos inesquecíveis <span className="text-[#C2410C]">ao redor da boa mesa.</span>
            </h1>
            <p className="hero-sub text-[#57534E] text-base leading-relaxed mb-6 max-w-xl">
              Ingredientes frescos da região, receitas clássicas preparadas no fogo lento e um ambiente aconchegante para reunir quem você mais ama.
            </p>
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Pedir no WhatsApp ou Reservar</span>
              </a>
              <a
                href="#cardapio"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#FFEDD5] text-[#C2410C] border border-[#E7E5E4] text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Ver Cardápio com Preços</span>
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative anim-hero">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={signatureDish.image}
                alt={signatureDish.title}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            <div className="hero-card absolute -bottom-5 left-4 right-4 bg-white/95 backdrop-blur-md border border-[#E7E5E4] rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C2410C] bg-[#FFEDD5] px-2 py-0.5 rounded-md">
                  Prato do Chef
                </span>
                <div className="text-xs font-black text-[#1C1917] mt-1">{signatureDish.title}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#78716C]">Por apenas</div>
                <div className="text-base font-black text-[#C2410C]">R$ {signatureDish.price}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Digital Menu */}
      <section id="cardapio" className="anim-section py-14 bg-white border-y border-[#E7E5E4]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Cardápio da Casa</span>
            <h2 className="section-title text-3xl font-black font-serif text-[#431407] mt-1 mb-2">
              Pratos Preparados com Paixão
            </h2>
            <p className="text-sm text-[#78716C]">Peça pelo delivery ou venha saborear em nosso salão em {ctx.city}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="anim-card bg-[#FDFBF7] border border-[#E7E5E4] hover:border-[#FDBA74] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-[#1C1917] font-serif">{item.name}</h3>
                    <span className="text-base font-black text-[#C2410C] shrink-0">R$ {item.price}</span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed mb-4">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E4]">
                  <span className="text-[11px] font-bold text-[#78716C] bg-white px-2.5 py-0.5 rounded-full border border-[#E7E5E4]">
                    {item.tag}
                  </span>
                  <a
                    href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                      `Olá! Gostaria de pedir o prato "${item.name}" (R$ ${item.price}) no ${ctx.bname}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
                  >
                    <MessageSquare size={13} />
                    <span>Pedir este prato no WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E7E5E4] py-8 text-xs text-[#78716C]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-[#431407] text-sm">{ctx.bname} • Restaurante & Bar</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#C2410C] font-bold hover:underline">
            Fazer Pedido no WhatsApp &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] p-3 flex items-center gap-2.5 z-50">
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
          <span>Pedir no WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

