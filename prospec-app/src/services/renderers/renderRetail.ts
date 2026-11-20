import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderRetail(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  const products = [
    {
      name: 'Tomate Italiano Selecionado',
      unit: 'kg',
      price: '6,99',
      tag: 'Mais Pedido',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Morango Doce da Serra',
      unit: 'bandeja 250g',
      price: '9,90',
      tag: 'Fresquinho',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Banana Prata Premium',
      unit: 'kg',
      price: '5,49',
      tag: 'Colheita da Semana',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Ovos Caipiras da Fazenda',
      unit: 'dúzia',
      price: '17,90',
      tag: 'Orgânico',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Queijo Minas Meia Cura',
      unit: 'peça ~500g',
      price: '34,90',
      tag: 'Artesanal',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Melancia Baby Super Doce',
      unit: 'unidade',
      price: '12,90',
      tag: 'Oferta',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const deliverySteps = [
    {
      step: '01',
      title: 'Mande sua lista no WhatsApp',
      desc: 'Pode ser em áudio, foto do papel ou digitado. Aceitamos qualquer formato.'
    },
    {
      step: '02',
      title: 'Nós escolhemos a dedo',
      desc: 'Nossa equipe seleciona os itens mais frescos, maduros e bonitos da feira.'
    },
    {
      step: '03',
      title: 'Entrega rápida na sua porta',
      desc: 'Receba em até 45 minutos no seu bairro. Pague com Pix, cartão ou dinheiro.'
    }
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Hortifrúti, Empório & Delivery em ${ctx.city}</title>
  <meta name="description" content="Frutas selecionadas, verduras frescas e empório no ${ctx.bname} em ${ctx.city}. Peça pelo WhatsApp e receba em até 45 minutos!">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #FAFDF7;
      --card: #FFFFFF;
      --card-border: #E2EED8;
      --green-dark: #064E3B;
      --green-primary: #059669;
      --green-light: #ECFDF5;
      --accent-orange: #EA580C;
      --text: #1F2937;
      --text-muted: #6B7280;
      --whatsapp: #25D366;
      --whatsapp-hover: #20BA5A;
      --yellow: #F59E0B;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

    /* Anti-wrap rules (GEMINI.md) */
    .btn, button, a.btn {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-weight: 700;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-green {
      background: var(--green-primary);
      color: #fff;
      padding: 13px 26px;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(5, 150, 105, 0.35);
    }
    .btn-green:hover { background: #047857; transform: translateY(-2px); }
    .btn-wa {
      background: var(--whatsapp);
      color: #fff;
      padding: 13px 24px;
      font-size: 14px;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.3);
    }
    .btn-wa:hover { background: var(--whatsapp-hover); transform: translateY(-2px); }
    .btn-outline {
      background: #FFFFFF;
      color: var(--green-dark);
      border: 1.5px solid var(--card-border);
      padding: 12px 22px;
      font-size: 14px;
    }
    .btn-outline:hover { border-color: var(--green-primary); color: var(--green-primary); }

    /* Announcement Banner */
    .top-banner {
      background: var(--green-dark);
      color: #D1FAE5;
      text-align: center;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
    }
    .top-banner strong { color: #FFFFFF; }

    /* Header */
    .header {
      background: #FFFFFF;
      border-bottom: 1px solid var(--card-border);
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-content { display: flex; align-items: center; justify-content: space-between; }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--green-dark);
      font-weight: 900;
      font-size: 22px;
    }
    .brand-leaf {
      color: var(--green-primary);
    }

    /* Hero */
    .hero {
      padding: 60px 0 70px;
      position: relative;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 48px;
      align-items: center;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--green-light);
      border: 1px solid #A7F3D0;
      color: var(--green-dark);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 44px;
      line-height: 1.15;
      font-weight: 900;
      color: var(--green-dark);
      letter-spacing: -0.5px;
      margin-bottom: 18px;
    }
    .hero-title span { color: var(--green-primary); }
    .hero-sub {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-muted);
      margin-bottom: 28px;
      max-width: 500px;
    }
    .hero-ctas {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }
    .hero-trust-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      padding-top: 24px;
      border-top: 1px solid var(--card-border);
    }
    .trust-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--green-dark);
    }
    .trust-chip svg { color: var(--green-primary); }

    /* Hero Image Side */
    .hero-image-wrap {
      position: relative;
    }
    .hero-img {
      width: 100%;
      height: 440px;
      object-fit: cover;
      border-radius: 28px;
      box-shadow: 0 16px 36px rgba(6, 78, 59, 0.12);
    }
    .hero-offer-floating {
      position: absolute;
      bottom: -16px;
      left: -16px;
      background: #FFFFFF;
      padding: 16px 22px;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .offer-bubble {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-orange);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 15px;
    }

    /* 3 Steps WhatsApp Delivery */
    .section-steps {
      padding: 60px 0;
      background: #FFFFFF;
      border-top: 1px solid var(--card-border);
      border-bottom: 1px solid var(--card-border);
    }
    .section-head { text-align: center; max-width: 600px; margin: 0 auto 40px; }
    .section-title { font-size: 32px; font-weight: 900; color: var(--green-dark); margin-bottom: 10px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
    }
    .step-card {
      background: var(--bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 28px;
      position: relative;
    }
    .step-num {
      font-size: 14px;
      font-weight: 900;
      color: var(--green-primary);
      margin-bottom: 12px;
      letter-spacing: 1px;
    }
    .step-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--green-dark);
      margin-bottom: 8px;
    }
    .step-desc {
      font-size: 13.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Products Grid */
    .section-products { padding: 70px 0; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .product-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
      transition: all 0.25s ease;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(6, 78, 59, 0.08);
      border-color: #A7F3D0;
    }
    .product-img-wrap {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-img { transform: scale(1.05); }
    .product-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #FFFFFF;
      color: var(--green-dark);
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .product-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex-grow: 1;
    }
    .product-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--green-dark);
      margin-bottom: 4px;
    }
    .product-unit {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    .product-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid #F1F5F9;
    }
    .product-price {
      font-size: 20px;
      font-weight: 900;
      color: var(--green-dark);
    }
    .product-price small {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .btn-product-wa {
      background: #ECFDF5;
      color: var(--green-primary);
      border: 1px solid #A7F3D0;
      padding: 8px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-product-wa:hover {
      background: var(--whatsapp);
      color: #fff;
      border-color: var(--whatsapp);
    }

    /* Satisfaction Guarantee Callout */
    .section-fresh-guarantee {
      background: linear-gradient(135deg, #064E3B 0%, #047857 100%);
      color: #FFFFFF;
      border-radius: 24px;
      padding: 44px;
      margin: 40px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      flex-wrap: wrap;
    }
    .guarantee-left { max-width: 600px; }
    .guarantee-title { font-size: 26px; font-weight: 900; margin-bottom: 8px; }
    .guarantee-desc { font-size: 14.5px; color: #D1FAE5; line-height: 1.6; }

    /* Footer */
    .footer {
      border-top: 1px solid var(--card-border);
      background: #FFFFFF;
      padding: 44px 0 34px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; gap: 36px; }
      .hero-img { height: 320px; }
      .steps-grid { grid-template-columns: 1fr; }
      .products-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .hero-title { font-size: 30px; }
      .hero-ctas { flex-direction: column; width: 100%; }
      .hero-ctas a { width: 100%; }
      .products-grid { grid-template-columns: 1fr; }
      .section-fresh-guarantee { padding: 28px 20px; text-align: center; }
      .section-fresh-guarantee a { width: 100%; }
      .footer-content { flex-direction: column; text-align: center; }
      .mobile-sticky-bar { display: flex !important; }
      body { padding-bottom: 70px; }
    }
  </style>
</head>
<body>
  <!-- Top Announcement -->
  <div class="top-banner">
    Feira Fresca de Hoje &bull; <strong>Peça pelo WhatsApp e receba em até 45 min em ${ctx.city}!</strong>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="container header-content">
      <a href="#" class="brand-logo font-heading">
        <span class="brand-leaf">${ICONS.check}</span>
        <span>${ctx.bname}</span>
      </a>
      <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Pedir no WhatsApp</span>
      </a>
    </div>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-left">
        <div class="hero-pill">
          ${ICONS.badgeCheck}
          <span>Hortifrúti Selecionado, Queijos & Mercearia Fina</span>
        </div>
        <h1 class="hero-title font-heading">
          Frutas, Verduras e Empório <span>selecionados como se fosse por você.</span>
        </h1>
        <p class="hero-sub">
          Diga adeus às frutas machucadas do supermercado. No ${ctx.bname}, escolhemos peça por peça os melhores itens do dia e levamos até a sua porta.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
            ${ICONS.whatsapp}
            <span>Enviar Lista pelo WhatsApp</span>
          </a>
          <a href="#ofertas" class="btn btn-outline">
            <span>Ver Ofertas de Hoje</span>
            <span style="margin-left: 6px;">&darr;</span>
          </a>
        </div>
        <div class="hero-trust-row">
          <div class="trust-chip">
            ${ICONS.clock}
            <span>Entrega em até 45 min</span>
          </div>
          <div class="trust-chip">
            ${ICONS.star}
            <span>${ctx.rating}★ no Google (${ctx.revCount} avaliações)</span>
          </div>
          <div class="trust-chip">
            ${ICONS.shield}
            <span>Garantia de Frescor 100%</span>
          </div>
        </div>
      </div>

      <div class="hero-image-side">
        <div class="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" alt="${ctx.bname} Feira Fresca" class="hero-img">
          <div class="hero-offer-floating">
            <div class="offer-bubble">%</div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: var(--green-dark);">Feira de Terça & Quarta</div>
              <div style="font-size: 12px; color: var(--text-muted);">Itens frescos com até 20% OFF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 3 Steps -->
  <section class="section-steps">
    <div class="container">
      <div class="section-head">
        <h2 class="section-title font-heading">Como Funciona o Delivery no WhatsApp?</h2>
        <p class="section-desc">Fácil, rápido e sem complicações de aplicativos pesados.</p>
      </div>
      <div class="steps-grid">
        ${deliverySteps.map(s => `
          <div class="step-card">
            <div class="step-num font-heading">PASSO ${s.step}</div>
            <div class="step-title font-heading">${s.title}</div>
            <div class="step-desc">${s.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Products / Ofertas Grid -->
  <section id="ofertas" class="section-products">
    <div class="container">
      <div class="section-head">
        <h2 class="section-title font-heading">Destaques Frescos de Hoje</h2>
        <p class="section-desc">Valores válidos para entrega ou retirada hoje em ${ctx.city}.</p>
      </div>

      <div class="products-grid">
        ${products.map(p => `
          <div class="product-card">
            <div class="product-img-wrap">
              <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
              <span class="product-tag">${p.tag}</span>
            </div>
            <div class="product-body">
              <div>
                <h3 class="product-title font-heading">${p.name}</h3>
                <div class="product-unit">Preço por ${p.unit}</div>
              </div>
              <div class="product-bottom-row">
                <div class="product-price font-heading">
                  <small>R$</small> ${p.price}
                </div>
                <a href="https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(`Olá! Gostaria de pedir ${p.name} (R$ ${p.price}/${p.unit}) pelo delivery do ${ctx.bname}.`)}" target="_blank" class="btn-product-wa">
                  ${ICONS.whatsapp}
                  <span>Pedir</span>
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Fresh Guarantee Callout -->
      <div class="section-fresh-guarantee">
        <div class="guarantee-left">
          <h3 class="guarantee-title font-heading">Garantia Absoluta de Satisfação</h3>
          <p class="guarantee-desc">Se qualquer fruta, legume ou verdura não chegar no ponto de maturação ideal para você, trocamos imediatamente sem burocracia ou devolvemos o valor no Pix.</p>
        </div>
        <a href="${ctx.waLink}" target="_blank" class="btn btn-wa" style="background: #FFFFFF; color: var(--green-dark);">
          ${ICONS.whatsapp}
          <span>Fazer Meu Primeiro Pedido</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <div>
        <div style="font-weight: 800; color: var(--green-dark); font-size: 16px; margin-bottom: 4px;">${ctx.bname} &bull; Hortifrúti & Empório</div>
        <div>${ctx.address} &bull; ${ctx.city}</div>
      </div>
      <div>
        <a href="${ctx.mapsLink}" target="_blank" style="color: var(--green-primary); text-decoration: none; font-weight: 700;">
          Ver localização no Google Maps &rarr;
        </a>
      </div>
    </div>
  </footer>

  <!-- Mobile Sticky Bar -->
  ${renderStickyBar(ctx)}

  <!-- GSAP Scroll Animations -->
  ${renderGsapScript()}
</body>
</html>`;
}

