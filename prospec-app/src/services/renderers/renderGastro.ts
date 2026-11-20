import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderGastro(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Restaurante & Cardápio em ${ctx.city}</title>
  <meta name="description" content="Gastronomia autoral com ingredientes frescos. Almoço executivo, jantar intimista e delivery artesanal em ${ctx.city}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #FDFBF7;
      --card: #FFFFFF;
      --card-border: #EADBCE;
      --accent: #C2410C;
      --accent-hover: #9A3412;
      --brown: #431407;
      --text: #26211E;
      --text-muted: #6B5E55;
      --whatsapp: #25D366;
      --whatsapp-hover: #20BA5A;
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
    .font-serif { font-family: 'DM Serif Display', Georgia, serif; }
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
    .btn-primary {
      background: var(--accent);
      color: #fff;
      padding: 13px 26px;
      font-size: 14px;
      box-shadow: 0 4px 18px rgba(194, 65, 12, 0.35);
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .btn-wa {
      background: var(--whatsapp);
      color: #fff;
      padding: 13px 24px;
      font-size: 14px;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.3);
    }
    .btn-wa:hover { background: var(--whatsapp-hover); transform: translateY(-2px); }
    .btn-secondary {
      background: #FFFFFF;
      color: var(--brown);
      border: 1px solid var(--card-border);
      padding: 12px 22px;
      font-size: 14px;
    }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

    /* Header */
    .header {
      background: rgba(253, 251, 247, 0.94);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 74px;
    }
    .brand-title { font-size: 22px; font-weight: 700; color: var(--brown); }
    .brand-subtitle { font-size: 11.5px; color: var(--text-muted); display: block; }
    .nav-links { display: flex; gap: 24px; font-size: 13.5px; font-weight: 600; }
    .nav-links a { color: var(--text-muted); text-decoration: none; }
    .nav-links a:hover { color: var(--accent); }

    /* Hero */
    .hero {
      padding: 60px 0 50px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
    }
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFEDD5;
      color: #9A3412;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 46px;
      line-height: 1.15;
      color: var(--brown);
      margin-bottom: 18px;
    }
    .hero-desc {
      font-size: 15.5px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 26px;
    }
    .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 24px; }
    .hero-img-wrap {
      position: relative;
    }
    .hero-img {
      width: 100%;
      height: 440px;
      object-fit: cover;
      border-radius: 24px;
      box-shadow: 0 16px 36px rgba(67, 20, 7, 0.12);
    }
    .hero-badge-float {
      position: absolute;
      bottom: -16px;
      right: -16px;
      background: #FFFFFF;
      padding: 14px 20px;
      border-radius: 18px;
      border: 1px solid var(--card-border);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Chef Spotlight Section */
    .spotlight-card {
      background: linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%);
      border: 1px solid #FDBA74;
      border-radius: 24px;
      padding: 32px;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
      align-items: center;
      margin: 40px 0 60px;
      box-shadow: 0 8px 24px rgba(194, 65, 12, 0.06);
    }
    .spotlight-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 18px;
    }
    .spotlight-tag {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--accent);
      background: #FFEDD5;
      padding: 3px 10px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 10px;
    }
    .spotlight-title { font-size: 26px; color: var(--brown); margin-bottom: 8px; }
    .spotlight-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }
    .spotlight-price { font-size: 26px; font-weight: 800; color: var(--accent); margin-right: 20px; }

    /* Menu Section with Real Prices in R$ */
    .section { padding: 60px 0; }
    .section-head { text-align: center; max-width: 600px; margin: 0 auto 40px; }
    .section-title { font-size: 34px; color: var(--brown); margin-bottom: 10px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .menu-item-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
      transition: all 0.2s ease;
    }
    .menu-item-card:hover {
      border-color: var(--accent);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    .menu-item-img {
      width: 100px;
      height: 100px;
      border-radius: 14px;
      object-fit: cover;
      shrink: 0;
    }
    .menu-item-info { flex: 1; min-width: 0; }
    .menu-item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .menu-item-title { font-size: 16px; font-weight: 700; color: var(--brown); }
    .menu-item-price { font-size: 16px; font-weight: 800; color: var(--accent); white-space: nowrap; }
    .menu-item-desc { font-size: 12.5px; color: var(--text-muted); line-height: 1.45; margin-bottom: 8px; }
    .menu-item-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--whatsapp);
      text-decoration: none;
      cursor: pointer;
    }
    .menu-item-action:hover { text-decoration: underline; }

    /* Ambience Collage */
    .ambience-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 40px;
    }
    .ambience-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 16px;
    }

    /* Footer & Sticky */
    .footer {
      border-top: 1px solid var(--card-border);
      background: #FFFFFF;
      padding: 44px 0 34px;
      margin-top: 60px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .mobile-sticky-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(253, 251, 247, 0.96);
      border-top: 1px solid var(--card-border);
      padding: 10px 16px;
      gap: 10px;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .btn-sticky-call {
      flex: 1;
      padding: 11px;
      background: #FFFFFF;
      color: var(--brown);
      border: 1px solid var(--card-border);
      border-radius: 9999px;
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-sticky-wa {
      flex: 2;
      padding: 11px 18px;
      background: var(--whatsapp);
      color: #fff;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }

    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; gap: 32px; }
      .spotlight-card { grid-template-columns: 1fr; }
      .ambience-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      body { padding-bottom: 74px; }
      .hero-title { font-size: 32px; }
      .menu-grid { grid-template-columns: 1fr; }
      .nav-links { display: none; }
      .mobile-sticky-bar { display: flex !important; }
      .hero-ctas .btn { width: 100%; }
      .ambience-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container header-inner">
      <div>
        <span class="brand-title font-serif">${ctx.bname}</span>
        <span class="brand-subtitle">${ctx.category} • ${ctx.city}</span>
      </div>
      <div class="nav-links">
        <a href="#cardapio">Cardápio</a>
        <a href="#destaque">Especial do Chef</a>
        <a href="#ambiente">Ambiente</a>
        <a href="#reservas">Reservas</a>
      </div>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Reservar Mesa</span>
      </a>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="hero-eyebrow">
          ${ICONS.clock}
          <span>Almoço: 11h30 às 15h • Jantar: 18h30 às 23h30</span>
        </div>
        <h1 class="hero-title font-serif">
          Sabores Autênticos, Ingredientes Frescos e Afeto à Mesa
        </h1>
        <p class="hero-desc">
          Uma experiência gastronômica memorável na ${ctx.bname}. Pratos artesanais com massas frescas, cortes nobres e sobremesas feitas diariamente em ${ctx.city}.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            <span>Fazer Pedido / Reservar no WhatsApp</span>
            ${ICONS.arrowRight}
          </a>
          <a href="#cardapio" class="btn btn-secondary">
            <span>Ver Cardápio com Preços</span>
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted);">
          <div style="display: flex; color: #F59E0B;">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
          <span><strong>${ctx.rating}★</strong> no Google (${ctx.revCount} avaliações gastronômicas)</span>
        </div>
      </div>

      <div class="hero-img-wrap">
        <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80" alt="${ctx.bname}" class="hero-img">
        <div class="hero-badge-float">
          <div style="color: var(--accent);">${ICONS.award}</div>
          <div>
            <strong style="color: var(--brown); font-size: 13px; display: block;">Cozinha Autoral</strong>
            <span style="color: var(--text-muted); font-size: 11px;">Receitas clássicas revisitadas</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CHEF SPOTLIGHT -->
  <div class="container" id="destaque">
    <div class="spotlight-card">
      <img src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" alt="Prato do Chef" class="spotlight-img">
      <div>
        <span class="spotlight-tag">Prato Assinatura do Chef</span>
        <h3 class="spotlight-title font-serif">Risoto de Filé Mignon ao Gorgonzola Dulce</h3>
        <p class="spotlight-desc">
          Arroz arbóreo italiano mantecado com queijo gorgonzola dolce, lâminas de filé mignon grelhadas no ponto perfeito, finalizado com nozes tostadas e azeite trufado.
        </p>
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <span class="spotlight-price">R$ 68,90</span>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
            ${ICONS.whatsapp}
            <span>Pedir Este Prato</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- MENU SECTION (Prices in R$ & Direct WhatsApp link per item) -->
  <section class="section" id="cardapio">
    <div class="container">
      <div class="section-head">
        <span style="font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">Seleção de Pratos</span>
        <h2 class="section-title font-serif">CARDÁPIO DESTAQUE</h2>
        <p class="section-desc">Todos os pratos são preparados na hora com insumos de produtores locais selecionados.</p>
      </div>

      <div class="menu-grid">
        <div class="menu-item-card">
          <img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80" alt="Fettuccine" class="menu-item-img">
          <div class="menu-item-info">
            <div class="menu-item-header">
              <h4 class="menu-item-title font-serif">Fettuccine Frutos do Mar</h4>
              <span class="menu-item-price">R$ 74,00</span>
            </div>
            <p class="menu-item-desc">Massa fresca artesanal, camarões médios salteados, anéis de lula e molho bisque aveludado.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="menu-item-action">
              ${ICONS.whatsapp}
              <span>Pedir no WhatsApp</span>
            </a>
          </div>
        </div>

        <div class="menu-item-card">
          <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80" alt="Pizza Napolitana" class="menu-item-img">
          <div class="menu-item-info">
            <div class="menu-item-header">
              <h4 class="menu-item-title font-serif">Pizza Napolitana Parma</h4>
              <span class="menu-item-price">R$ 58,00</span>
            </div>
            <p class="menu-item-desc">Fermentação lenta de 48h, molho San Marzano, mozzarella di bufala e presunto de Parma D.O.P.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="menu-item-action">
              ${ICONS.whatsapp}
              <span>Pedir no WhatsApp</span>
            </a>
          </div>
        </div>

        <div class="menu-item-card">
          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80" alt="Burrata Artesanal" class="menu-item-img">
          <div class="menu-item-info">
            <div class="menu-item-header">
              <h4 class="menu-item-title font-serif">Burrata Cremosa com Pesto</h4>
              <span class="menu-item-price">R$ 49,90</span>
            </div>
            <p class="menu-item-desc">Burrata de búfala fresca, tomatinhos confitados na brasa, pesto genovês de manjericão e foccacia.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="menu-item-action">
              ${ICONS.whatsapp}
              <span>Pedir no WhatsApp</span>
            </a>
          </div>
        </div>

        <div class="menu-item-card">
          <img src="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=300&q=80" alt="Tiramisù" class="menu-item-img">
          <div class="menu-item-info">
            <div class="menu-item-header">
              <h4 class="menu-item-title font-serif">Tiramisù Tradizionale</h4>
              <span class="menu-item-price">R$ 28,00</span>
            </div>
            <p class="menu-item-desc">Biscoitos champanhe embebidos em café expresso especial, creme de mascarpone fresco e cacau 70%.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="menu-item-action">
              ${ICONS.whatsapp}
              <span>Pedir no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- AMBIENCE GALLERY -->
  <section class="container" id="ambiente">
    <div style="text-align: center; margin-bottom: 24px;">
      <h3 class="font-serif" style="font-size: 26px; color: var(--brown);">Ambiente Acolhedor & Sofisticado</h3>
      <p style="font-size: 14px; color: var(--text-muted);">Ideal para jantares românticos, confraternizações e almoços em família.</p>
    </div>
    <div class="ambience-grid">
      <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80" alt="Salão" class="ambience-img">
      <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=500&q=80" alt="Mesas" class="ambience-img">
      <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=500&q=80" alt="Bar" class="ambience-img">
      <img src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=500&q=80" alt="Varanda" class="ambience-img">
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer" id="reservas">
    <div class="container" style="text-align: center;">
      <h4 class="font-serif" style="font-size: 22px; color: var(--brown); margin-bottom: 8px;">${ctx.bname}</h4>
      <p style="margin-bottom: 12px;">${ctx.address} • ${ctx.city}</p>
      <p style="margin-bottom: 20px;">Reservas e Delivery: <strong>${ctx.phone}</strong></p>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Conversar no WhatsApp</span>
      </a>
      <p style="font-size: 11px; margin-top: 32px; opacity: 0.7;">© 2026 ${ctx.bname}. Todos os direitos reservados. Presença digital otimizada para pedidos rápidos.</p>
    </div>
  </footer>

  ${renderStickyBar(ctx)}

  <!-- GSAP Scroll Animations -->
  ${renderGsapScript()}
</body>
</html>`;
}

