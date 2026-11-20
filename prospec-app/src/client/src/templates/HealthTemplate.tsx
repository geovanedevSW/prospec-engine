import React from 'react';
import { Phone, MapPin, Clock, Star, ShieldCheck, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { NicheTemplateProps } from './types.js';
import { resolveTemplateLead } from './resolveLead.js';
import { useScrollAnimation } from './useScrollAnimation.js';

export const HealthTemplate: React.FC<NicheTemplateProps> = ({ lead, viewport = 'desktop' }) => {
  const ctx = resolveTemplateLead(lead, 'Clínica Odontológica');
  const containerRef = useScrollAnimation({ stagger: 0.12 });

  const treatments = [
    {
      title: 'Implantes & Próteses Dentárias',
      desc: 'Recupere a mastigação e a segurança ao sorrir com implantes de titânio e tecnologia guiada sem dor.',
      tag: 'Alta Precisão',
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Alinhadores Invisíveis & Ortodontia',
      desc: 'Dentes perfeitamente alinhados de forma discreta, removível e confortável sem bráquetes metálicos.',
      tag: 'Estética',
      image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Lentes de Contato & Clareamento',
      desc: 'Facetas cerâmicas ultra-finas e clareamento a laser para um sorriso harmônico e luminoso.',
      tag: 'Transformação',
      image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Tratamento de Canal & Prevenção',
      desc: 'Endodontia mecanizada em sessão única com microscópio cirúrgico, garantindo alívio imediato.',
      tag: 'Sem Dor',
      image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const doctors = [
    {
      name: 'Dr. Roberto Silveira',
      role: 'Implantodontista & Cirurgião',
      cro: 'CRO-MG 48.912',
      exp: '14 anos de experiência',
      rating: '4.9 ★★★★★'
    },
    {
      name: 'Dra. Camila Vasconcelos',
      role: 'Ortodontista & Invisalign Doctor',
      cro: 'CRO-MG 52.340',
      exp: '9 anos de experiência',
      rating: '5.0 ★★★★★'
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased pb-20 sm:pb-0 overflow-x-hidden">
      {/* Top Strip */}
      <div className="bg-[#3F151B] text-[#F8FAFC] py-2 px-4 text-xs text-center flex items-center justify-center gap-3 font-medium">
        <span>{ctx.bname} • Clínica Odontológica em {ctx.city}</span>
        <span className="opacity-40">•</span>
        <span className="text-[#C5A880] font-bold">Atendimento de Segunda a Sábado!</span>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex flex-col text-[#5B2329] font-black text-xl leading-tight">
            <span>{ctx.bname}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">Odontologia Especializada</span>
          </a>
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${ctx.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CBD5E1] text-[#5B2329] text-xs font-bold whitespace-nowrap shrink-0 hover:bg-[#FDF2F4] transition-colors"
            >
              <Phone size={14} />
              <span>{ctx.phone}</span>
            </a>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold whitespace-nowrap shrink-0 shadow-md shadow-[#25D366]/20 transition-all hover:-translate-y-0.5"
            >
              <MessageSquare size={14} />
              <span>Agendar Consulta</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="anim-hero inline-flex items-center gap-2 bg-[#FDF2F4] border border-[#FBCFE8] text-[#5B2329] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
              <ShieldCheck size={14} />
              <span>Odontologia Moderna & Cuidado Humanizado</span>
            </div>
            <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-black text-[#3F151B] leading-[1.15] tracking-tight mb-5">
              A clínica odontológica ideal <span className="text-[#5B2329]">para você e sua família.</span>
            </h1>
            <p className="hero-sub text-[#64748B] text-base leading-relaxed mb-6 max-w-xl">
              Tratamentos modernos, scanner 3D sem moldagem desagradável e procedimentos planejados para serem tranquilos e sem dor.
            </p>

            {/* Filter Chips (Dentacare style) */}
            <div className="anim-hero flex flex-wrap gap-2 mb-8">
              {['Implantes', 'Invisalign', 'Clareamento a Laser', 'Lentes em Porcelana', 'Canal sem Dor', 'Odontopediatria'].map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#334155] shadow-2xs hover:border-[#5B2329] hover:text-[#5B2329] transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href={ctx.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold whitespace-nowrap shrink-0 shadow-lg shadow-[#25D366]/25 transition-all hover:-translate-y-0.5"
              >
                <MessageSquare size={16} />
                <span>Agendar Avaliação no WhatsApp</span>
              </a>
              <a
                href="#tratamentos"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#FDF2F4] text-[#5B2329] border border-[#E2E8F0] text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
              >
                <span>Conhecer Especialidades</span>
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          {/* Hero Visual + Floating Doctor Card */}
          <div className="lg:col-span-5 relative anim-hero">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white">
              <img
                src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80"
                alt={`${ctx.bname} Odontologia`}
                className="w-full h-80 sm:h-96 object-cover"
              />
            </div>
            {/* Doctor Floating Card */}
            <div className="hero-card absolute -bottom-5 sm:-bottom-6 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-4 shadow-xl flex items-center gap-3.5 max-w-xs">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80"
                alt="Dr. Roberto"
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="text-left">
                <div className="text-xs font-black text-[#3F151B]">Dr. Roberto Silveira</div>
                <div className="text-[11px] text-[#64748B]">Resp. Técnico • CRO-MG 48.912</div>
                <div className="text-[11px] font-bold text-[#F59E0B] flex items-center gap-1 mt-0.5">
                  <Star size={12} fill="#F59E0B" />
                  <span>4.9 ({ctx.revCount} avaliações)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Trust Metrics Bar */}
      <section className="anim-section py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] text-[#5B2329] flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#3F151B] leading-none">98%</div>
              <div className="text-xs text-[#64748B] mt-1 font-medium">Pacientes Satisfeitos</div>
            </div>
          </div>

          <div className="metric-card bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] text-[#5B2329] flex items-center justify-center shrink-0">
              <Star size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#3F151B] leading-none">12.000+</div>
              <div className="text-xs text-[#64748B] mt-1 font-medium">Sorrisos Renovados</div>
            </div>
          </div>

          <div className="metric-card bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] text-[#5B2329] flex items-center justify-center shrink-0">
              <Star size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-[#3F151B] leading-none">{ctx.rating} ★</div>
              <div className="text-xs text-[#64748B] mt-1 font-medium">Avaliação Google</div>
            </div>
          </div>

          <div className="metric-card bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-[#FDF2F4] text-[#5B2329] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#3F151B] leading-none">Seg a Sáb</div>
              <div className="text-xs text-[#64748B] mt-1 font-medium">Horários Flexíveis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="tratamentos" className="anim-section py-14 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block bg-[#FDF2F4] text-[#5B2329] text-xs font-bold px-3 py-1 rounded-full mb-2">
              Especialidades
            </span>
            <h2 className="section-title text-2xl sm:text-3xl font-black text-[#3F151B] mb-3">
              Tratamentos Planejados para o Seu Conforto
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Tecnologia avançada para resultados estéticos de alto impacto e procedimentos tranquilos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {treatments.map((t) => (
              <div
                key={t.title}
                className="treatment-card bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FBCFE8] rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-12 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="sm:col-span-5 h-44 sm:h-full">
                  <img src={t.image} alt={t.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="sm:col-span-7 p-6 flex flex-col justify-between">
                  <div>
                    <span className="inline-block text-[11px] font-bold text-[#5B2329] bg-white border border-[#FBCFE8] px-2.5 py-0.5 rounded-full mb-2">
                      {t.tag}
                    </span>
                    <h3 className="text-base font-black text-[#3F151B] mb-2">{t.title}</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-4">{t.desc}</p>
                  </div>
                  <a
                    href={`https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(
                      `Olá! Gostaria de agendar uma avaliação para ${t.title} na ${ctx.bname} em ${ctx.city}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B2329] hover:underline"
                  >
                    <span>Tirar dúvidas no WhatsApp</span>
                    <ChevronRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="anim-section py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block bg-[#FDF2F4] text-[#5B2329] text-xs font-bold px-3 py-1 rounded-full mb-2">
              Corpo Clínico
            </span>
            <h2 className="section-title text-2xl sm:text-3xl font-black text-[#3F151B] mb-3">
              Especialistas Dedicados à Sua Saúde
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Profissionais com título de especialista, formação continuada e registro ativo no Conselho Regional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {doctors.map((d) => (
              <div key={d.name} className="doctor-card bg-white border border-[#E2E8F0] rounded-2xl p-6 flex items-center gap-4 shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"
                  alt={d.name}
                  className="w-18 h-18 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h3 className="text-base font-black text-[#3F151B]">{d.name}</h3>
                  <div className="text-xs font-semibold text-[#5B2329] mt-0.5">{d.role}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{d.cro} • {d.exp}</div>
                  <div className="text-xs font-bold text-[#F59E0B] mt-1.5">{d.rating}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Financing Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#5B2329] to-[#3F151B] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-xl sm:text-2xl font-black mb-1">Tratamentos com Parcelamento em até 24x</h3>
              <p className="text-[#FDF2F4] text-xs sm:text-sm">
                Condições facilitadas no cartão e boleto para você cuidar da sua saúde sem adiar seus planos.
              </p>
            </div>
            <a
              href={ctx.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#5B2329] text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 hover:bg-[#FAF8F5] transition-colors shadow-md"
            >
              <MessageSquare size={16} />
              <span>Conversar com a Recepção</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-[#3F151B] text-sm">{ctx.bname} • Clínica Odontológica</div>
            <div>{ctx.address} • {ctx.city}</div>
          </div>
          <a href={ctx.waLink} target="_blank" rel="noopener noreferrer" className="text-[#5B2329] font-bold hover:underline">
            Agendar Consulta no WhatsApp &rarr;
          </a>
        </div>
      </footer>

      {/* Mobile Sticky Action Bar */}
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

