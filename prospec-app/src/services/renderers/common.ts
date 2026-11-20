import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';

export interface RenderContext {
  bname: string;
  city: string;
  cat: string;
  phone: string;
  phoneClean: string;
  waLink: string;
  mapsLink: string;
  rating: string;
  revCount: string | number;
  address: string;
  isMobileViewport: boolean;
}

export function resolveContext(
  kit: NicheKit,
  options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }
): RenderContext {
  const lead = options?.lead;
  const bname = lead?.name || kit.sampleLead.name;
  const city = lead?.city || kit.sampleLead.city;
  const cat = lead?.category || kit.sampleLead.category;
  const phone = lead?.phoneNorm || lead?.phoneRaw || kit.sampleLead.phone;
  const phoneClean = phone.replace(/\D/g, '') || '5531998765432';
  const address = lead?.address || kit.sampleLead.address;
  const rating = lead?.rating ? parseFloat(lead.rating).toFixed(1) : kit.sampleLead.rating;
  const revCount = lead?.reviewsCount || kit.sampleLead.reviewsCount;

  const waLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(
    `Olá! Conheci a ${bname} pelo site e gostaria de solicitar um atendimento/orçamento.`
  )}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    bname + ' ' + address
  )}`;

  return {
    bname,
    city,
    cat,
    phone,
    phoneClean,
    waLink,
    mapsLink,
    rating,
    revCount,
    address,
    isMobileViewport: options?.viewport === 'mobile'
  };
}

// Pure SVG Vector Icons (No OS Emojis)
export const ICONS = {
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  badgeCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  phone: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mapPin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  award: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  tool: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  car: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  utensils: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v14a3 3 0 0 1-3 3H9"/><path d="M6 2v20"/><path d="M2 2h8"/></svg>`,
  zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  shoppingBag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
};

export function renderStickyBar(ctx: RenderContext): string {
  return `
  <!-- STYLES EXCLUSIVOS DA STICKY ACTION BAR MOBILE (GEMINI.md) -->
  <style>
    .mobile-sticky-bar {
      display: none;
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      background: rgba(255, 255, 255, 0.96) !important;
      border-top: 1px solid #E2E8F0 !important;
      padding: 10px 16px !important;
      gap: 10px !important;
      z-index: 9999 !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      box-sizing: border-box !important;
    }
    @media (max-width: 640px) {
      .mobile-sticky-bar {
        display: flex !important;
      }
      body {
        padding-bottom: 74px !important;
      }
    }
    .btn-sticky-call, .btn-sticky-wa {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      font-weight: 700 !important;
      font-size: 13.5px !important;
      border-radius: 9999px !important;
      text-decoration: none !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
    }
    .btn-sticky-call {
      flex: 1 1 0% !important;
      padding: 12px 14px !important;
      background: #FFFFFF !important;
      color: #0F172A !important;
      border: 1.5px solid #CBD5E1 !important;
    }
    .btn-sticky-wa {
      flex: 1.6 1 0% !important;
      padding: 12px 16px !important;
      background: #25D366 !important;
      color: #FFFFFF !important;
      border: none !important;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35) !important;
    }
    .btn-sticky-call:active, .btn-sticky-wa:active {
      transform: scale(0.98);
    }
  </style>

  <!-- MOBILE STICKY ACTION BAR (1-TAP WHATSAPP) -->
  <div class="mobile-sticky-bar">
    <a href="tel:${ctx.phoneClean}" class="btn-sticky-call">
      ${ICONS.phone}
      <span>Ligar</span>
    </a>
    <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn-sticky-wa">
      ${ICONS.whatsapp}
      <span>Falar no WhatsApp</span>
    </a>
  </div>
  `;
}

export function renderGsapScript(): string {
  return `
  <!-- GSAP 3.12.5 & ScrollTrigger (Animações de Alta Performance) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);

      // 1. Entrada suave e escalonada do Hero
      gsap.fromTo('.anim-hero, .hero-pill, .hero-title, .hero-sub, .hero-ctas, .hero-image-wrap, .triage-card, .treatment-chips',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.08, ease: 'power3.out' }
      );

      // 2. Revelação ao rolar a página (Scroll Reveal)
      gsap.utils.toArray('.section-title, .section-head, .pillar-card, .service-card, .product-card, .metric-card, .treatment-card, .pricing-card, .triage-btn, .step-card, .seal-card, .bento-item').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    });
  </script>
  `;
}
