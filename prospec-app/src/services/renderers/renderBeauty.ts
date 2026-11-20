import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderBeauty(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Estética Avançada & Cuidado em ${ctx.city}</title>
  <meta name="description" content="Ambiente acolhedor, procedimentos personalizados e foco total na sua autoestima na ${ctx.bname} em ${ctx.city}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --ground: #FAF8F5;
      --card-bg: #FFFFFF;
      --border: #E8E2D9;
      --accent: #8A3D4D;
      --accent-hover: #72323F;
      --accent-light: #FBF4F5;
      --text-main: #1C1917;
      --text-muted: #57534E;
      --whatsapp: #25D366;
      --whatsapp-hover: #20BA5A;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--ground);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .font-serif { font-family: 'Playfair Display', Georgia, serif; }
    .container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

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
      box-shadow: 0 4px 18px rgba(138, 61, 77, 0.3);
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .btn-wa {
      background: var(--whatsapp);
      color: #fff;
      padding: 13px 24px;
      font-size: 14px;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.28);
    }
    .btn-wa:hover { background: var(--whatsapp-hover); transform: translateY(-2px); }
    .btn-secondary {
      background: #FFFFFF;
      color: var(--text-main);
      border: 1px solid var(--border);
      padding: 12px 22px;
      font-size: 14px;
    }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

    /* Header */
    .header {
      background: rgba(250, 248, 245, 0.95);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(8px);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 74px;
    }
    .brand-title { font-size: 21px; font-weight: 700; color: var(--accent); }
    .brand-sub { font-size: 11px; color: var(--text-muted); display: block; }
    .nav-links { display: flex; gap: 24px; font-size: 13px; font-weight: 600; }
    .nav-links a { color: var(--text-muted); text-decoration: none; }
    .nav-links a:hover { color: var(--accent); }

    /* Hero */
    .hero {
      padding: 60px 0 50px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 48px;
      align-items: center;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--accent-light);
      border: 1px solid rgba(138, 61, 77, 0.25);
      color: var(--accent);
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 46px;
      line-height: 1.15;
      color: var(--text-main);
      margin-bottom: 18px;
    }
    .hero-title em { font-style: italic; color: var(--accent); }
    .hero-desc {
      font-size: 15.5px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 26px;
    }
    .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 24px; }
    .hero-visual { position: relative; }
    .hero-img {
      width: 100%;
      height: 450px;
      object-fit: cover;
      border-radius: 28px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border);
    }
    .hero-badge-float {
      position: absolute;
      bottom: -16px;
      right: -16px;
      background: #FFFFFF;
      padding: 14px 18px;
      border-radius: 18px;
      border: 1px solid var(--border);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Editorial Procedures Menu with Duration */
    .section { padding: 60px 0; }
    .section-head { text-align: center; max-width: 620px; margin: 0 auto 40px; }
    .section-title { font-size: 34px; color: var(--text-main); margin-bottom: 10px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .procedures-table {
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
    }
    .procedure-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      padding: 22px 28px;
      align-items: center;
      border-bottom: 1px solid var(--border);
      transition: background 0.15s ease;
    }
    .procedure-row:last-child { border-bottom: none; }
    .procedure-row:hover { background: var(--accent-light); }
    .procedure-title { font-size: 17px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
    .procedure-sub { font-size: 12.5px; color: var(--text-muted); }
    .procedure-time {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--accent);
      font-weight: 700;
    }

    /* Experience & Ambience Gallery */
    .experience-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 36px;
    }
    .experience-card {
      position: relative;
      border-radius: 18px;
      overflow: hidden;
    }
    .experience-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }
    .experience-card:hover .experience-img { transform: scale(1.04); }
    .experience-label {
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.94);
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-main);
      text-align: center;
      backdrop-filter: blur(4px);
    }

    /* Footer & Sticky */
    .footer {
      border-top: 1px solid var(--border);
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
      background: rgba(250, 248, 245, 0.96);
      border-top: 1px solid var(--border);
      padding: 10px 16px;
      gap: 10px;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .btn-sticky-call {
      flex: 1;
      padding: 11px;
      background: #FFFFFF;
      color: var(--text-main);
      border: 1px solid var(--border);
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
      .experience-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      body { padding-bottom: 74px; }
      .hero-title { font-size: 32px; }
      .procedure-row { grid-template-columns: 1fr; gap: 10px; padding: 18px; }
      .nav-links { display: none; }
      .mobile-sticky-bar { display: flex !important; }
      .hero-ctas .btn { width: 100%; }
      .experience-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container header-inner">
      <div>
        <span class="brand-title font-serif">${ctx.bname}</span>
        <span class="brand-sub">${ctx.category} • ${ctx.city}</span>
      </div>
      <div class="nav-links">
        <a href="#procedimentos">Procedimentos</a>
        <a href="#experiencia">O Espaço</a>
        <a href="#especialista">Especialista</a>
      </div>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Agendar Horário</span>
      </a>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="hero-pill">
          ${ICONS.clock}
          <span>ATENDIMENTO EXCLUSIVO COM HORA MARCADA</span>
        </div>
        <h1 class="hero-title font-serif">
          Realce Sua Beleza Natural com <em>Cuidado Personalizado</em>
        </h1>
        <p class="hero-desc">
          Ambiente privativo, técnicas contemporâneas e produtos de padrão internacional na ${ctx.bname} em ${ctx.city}. Um momento de pausa dedicado ao seu bem-estar.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            <span>Consultar Horários Disponíveis</span>
            ${ICONS.arrowRight}
          </a>
          <a href="#procedimentos" class="btn btn-secondary">
            <span>Conhecer Procedimentos</span>
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted);">
          <div style="display: flex; color: #F59E0B;">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
          <span><strong>${ctx.rating}★</strong> no Google (${ctx.revCount} clientes acolhidas)</span>
        </div>
      </div>

      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80" alt="${ctx.bname}" class="hero-img">
        <div class="hero-badge-float">
          <div style="color: var(--accent);">${ICONS.award}</div>
          <div>
            <strong style="color: var(--text-main); font-size: 13px; display: block;">Espaço Privativo</strong>
            <span style="color: var(--text-muted); font-size: 11px;">1 cliente por horário de atendimento</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- EDITORIAL PROCEDURES TABLE -->
  <section class="section" id="procedimentos">
    <div class="container">
      <div class="section-head">
        <span style="font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">Cardápio de Tratamentos</span>
        <h2 class="section-title font-serif">PROCEDIMENTOS & PROTOCOLOS</h2>
        <p class="section-desc">Protocolos desenvolvidos para resultados naturais sem alterar sua identidade.</p>
      </div>

      <div class="procedures-table">
        <div class="procedure-row">
          <div>
            <h3 class="procedure-title font-serif">Limpeza de Pele Profunda HydraGlow</h3>
            <p class="procedure-sub">Remoção de impurezas e comedões sem marcas com hidrossucção, vapor de ozônio e máscara de ouro.</p>
          </div>
          <div class="procedure-time">
            ${ICONS.clock}
            <span>Duração: 60 min</span>
          </div>
          <div style="text-align: right;">
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="font-size: 12px; padding: 9px 16px;">
              Agendar no WhatsApp
            </a>
          </div>
        </div>

        <div class="procedure-row">
          <div>
            <h3 class="procedure-title font-serif">Harmonização Facial & Preenchimento Labial</h3>
            <p class="procedure-sub">Ácido hialurônico de alta tecnologia para contorno labial sutil e estruturação dos pontos de sustentação.</p>
          </div>
          <div class="procedure-time">
            ${ICONS.clock}
            <span>Duração: 50 min</span>
          </div>
          <div style="text-align: right;">
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="font-size: 12px; padding: 9px 16px;">
              Agendar no WhatsApp
            </a>
          </div>
        </div>

        <div class="procedure-row">
          <div>
            <h3 class="procedure-title font-serif">Drenagem Linfática Método Exclusivo</h3>
            <p class="procedure-sub">Manobras firmes e ritmo acelerado que reduzem edemas, ativam a circulação e desenham a silhueta.</p>
          </div>
          <div class="procedure-time">
            ${ICONS.clock}
            <span>Duração: 50 min</span>
          </div>
          <div style="text-align: right;">
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="font-size: 12px; padding: 9px 16px;">
              Agendar no WhatsApp
            </a>
          </div>
        </div>

        <div class="procedure-row">
          <div>
            <h3 class="procedure-title font-serif">Design de Sobrancelhas & Lash Lifting</h3>
            <p class="procedure-sub">Curvatura dos cílios naturais e alinhamento milimétrico das sobrancelhas para valorizar o olhar.</p>
          </div>
          <div class="procedure-time">
            ${ICONS.clock}
            <span>Duração: 40 min</span>
          </div>
          <div style="text-align: right;">
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="font-size: 12px; padding: 9px 16px;">
              Agendar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- AMBIENCE / ESPAÇO -->
  <section class="container" id="experiencia" style="padding-bottom: 40px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h3 class="font-serif" style="font-size: 26px; color: var(--text-main);">O Espaço & Experiência</h3>
      <p style="font-size: 14px; color: var(--text-muted);">Projetado nos mínimos detalhes para garantir seu relaxamento absoluto.</p>
    </div>
    <div class="experience-grid">
      <div class="experience-card">
        <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80" alt="Sala de Atendimento" class="experience-img">
        <span class="experience-label">Maca Aquecida & Conforto</span>
      </div>
      <div class="experience-card">
        <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=500&q=80" alt="Cosméticos Premium" class="experience-img">
        <span class="experience-label">Cosméticos de Padrão Ouro</span>
      </div>
      <div class="experience-card">
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80" alt="Lounge de Espera" class="experience-img">
        <span class="experience-label">Café Especial & Recepção</span>
      </div>
      <div class="experience-card">
        <img src="https://images.unsplash.com/photo-1512290900672-1f02f928e469?auto=format&fit=crop&w=500&q=80" alt="Aromaterapia" class="experience-img">
        <span class="experience-label">Aromaterapia Relaxante</span>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container" style="text-align: center;">
      <h4 class="font-serif" style="font-size: 22px; color: var(--accent); margin-bottom: 6px;">${ctx.bname}</h4>
      <p style="margin-bottom: 12px;">${ctx.address} • ${ctx.city}</p>
      <p style="margin-bottom: 24px;">Atendimentos com hora marcada de Segunda a Sábado</p>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Agendar pelo WhatsApp</span>
      </a>
      <p style="font-size: 11px; margin-top: 36px; opacity: 0.65;">© 2026 ${ctx.bname}. Todos os direitos reservados. Presença digital oficial com confirmação em 1 toque.</p>
    </div>
  </footer>

  ${renderStickyBar(ctx)}

  <!-- GSAP Scroll Animations -->
  ${renderGsapScript()}
</body>
</html>`;
}

