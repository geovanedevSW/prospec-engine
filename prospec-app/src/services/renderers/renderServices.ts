import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderServices(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  const emergencyProblems = [
    { title: 'Curto-Circuito / Sem Luz', desc: 'Cheiro de queimado ou disjuntor desarmando', tag: 'Urgente' },
    { title: 'Vazamento ou Infiltração', desc: 'Cano furado, registros ou caça-vazamento', tag: 'Chegada Rápida' },
    { title: 'Desentupimento sem Quebrar', desc: 'Pias, ralos, vasos e esgotos com maquinário', tag: 'Sem Quebra' },
    { title: 'Ar-Condicionado & Climatização', desc: 'Higienização profunda, recarga de gás ou instalação', tag: 'Garantia' },
  ];

  const serviceCategories = [
    {
      category: 'Elétrica Residencial & Predial',
      icon: ICONS.zap,
      items: [
        'Troca de fiação antiga e quadros de distribuição',
        'Instalação de disjuntores DR e DPS contra raios',
        'Instalação de luminárias, pendentes, spots e LED',
        'Conserto de tomadas, interruptores e chuveiros',
        'Laudo técnico para concessionária de energia'
      ],
      ctaText: 'Chamar Eletricista'
    },
    {
      category: 'Hidráulica & Caça-Vazamentos',
      icon: ICONS.shield,
      items: [
        'Localização eletrônica de vazamentos invisíveis (geofone)',
        'Troca de reparos de válvulas Hydra e caixas acopladas',
        'Instalação de torneiras monocomando e pressurizadores',
        'Substituição de colunas prediais e encanamentos de PVC/Cobre/PEX',
        'Reparo emergencial de canos furados'
      ],
      ctaText: 'Chamar Encanador'
    },
    {
      category: 'Manutenção Preventiva & Ar',
      icon: ICONS.tool,
      items: [
        'Higienização química anti-bactéria de splits',
        'Recarga de gás ecológico (R410A / R32)',
        'Instalação com teste de vácuo e suporte reforçado',
        'Manutenção de bombas d’água e caixas d’água',
        'Contratos PMOC para condomínios e empresas'
      ],
      ctaText: 'Solicitar Orçamento'
    }
  ];

  const guarantees = [
    {
      title: 'Técnicos Verificados',
      desc: 'Profissionais uniformizados, com crachá e checagem rigorosa de antecedentes criminais.',
      icon: ICONS.shield
    },
    {
      title: 'Preço Tabelado & Sem Surpresa',
      desc: 'Orçamento formal passado antes de iniciar o serviço. Você só paga o que aprovou.',
      icon: ICONS.badgeCheck
    },
    {
      title: 'Garantia de 90 Dias com NF',
      desc: 'Todos os serviços acompanham garantia documentada e nota fiscal para sua segurança.',
      icon: ICONS.check
    },
    {
      title: 'Atendimento Rápido em 40 Min',
      desc: 'Média de chegada entre 30 e 45 minutos em todos os bairros centrais e regiões.',
      icon: ICONS.clock
    }
  ];

  const neighborhoods = [
    'Centro & Região Hospitalar', 'Bairros Zona Sul', 'Zona Oeste & Região',
    'Zona Leste', 'Zona Norte', 'Condomínios Fechados'
  ];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Eletricista, Encanador e Reparos 24 Horas em ${ctx.city}</title>
  <meta name="description" content="Atendimento rápido em até 40 min em ${ctx.city}. Eletricista e encanador com 90 dias de garantia e técnicos verificados. Chame no WhatsApp!">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F8FAFC;
      --navy: #0F172A;
      --navy-light: #1E293B;
      --primary: #1E3A8A;
      --accent: #EA580C;
      --accent-hover: #C2410C;
      --card: #FFFFFF;
      --card-border: #E2E8F0;
      --text: #0F172A;
      --text-muted: #64748B;
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
    .font-montserrat { font-family: 'Montserrat', sans-serif; }
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
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-accent {
      background: var(--accent);
      color: #fff;
      padding: 14px 28px;
      font-size: 15px;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
    }
    .btn-accent:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .btn-wa {
      background: var(--whatsapp);
      color: #fff;
      padding: 14px 26px;
      font-size: 15px;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
    }
    .btn-wa:hover { background: var(--whatsapp-hover); transform: translateY(-2px); }
    .btn-outline {
      background: transparent;
      color: #FFFFFF;
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      padding: 13px 24px;
      font-size: 14px;
    }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.1); border-color: #fff; }

    /* Top Emergency Alert Bar */
    .alert-bar {
      background: #DC2626;
      color: #FFFFFF;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }

    /* Header */
    .header {
      background: var(--navy);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 16px 0;
    }
    .header-content { display: flex; align-items: center; justify-content: space-between; }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 20px;
    }
    .logo-badge {
      background: var(--accent);
      color: #fff;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .header-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .header-phone-box {
      text-align: right;
      color: #FFFFFF;
      font-size: 12px;
    }
    .header-phone-number {
      font-size: 16px;
      font-weight: 800;
      color: #F8FAFC;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(180deg, var(--navy) 0%, #172554 100%);
      color: #FFFFFF;
      padding: 64px 0 72px;
      position: relative;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 48px;
      align-items: center;
    }
    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      color: #93C5FD;
      margin-bottom: 20px;
    }
    .hero-title {
      font-size: 42px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin-bottom: 18px;
    }
    .hero-title span { color: #F59E0B; }
    .hero-sub {
      font-size: 16px;
      line-height: 1.6;
      color: #CBD5E1;
      margin-bottom: 30px;
      max-width: 520px;
    }
    .hero-ctas {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }
    .hero-stats-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #E2E8F0;
    }
    .stat-item svg { color: #F59E0B; shrink: 0; }

    /* Urgency Triage Box (Right Column) */
    .triage-card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      color: var(--text);
    }
    .triage-head {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
    }
    .triage-badge {
      display: inline-block;
      background: #FEE2E2;
      color: #DC2626;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .triage-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--navy);
    }
    .triage-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .triage-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border: 1.5px solid var(--card-border);
      border-radius: 12px;
      background: #F8FAFC;
      text-decoration: none;
      color: var(--text);
      transition: all 0.2s ease;
    }
    .triage-btn:hover {
      border-color: var(--accent);
      background: #FFF7ED;
      transform: translateX(3px);
    }
    .triage-btn-left {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .triage-btn-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--navy);
    }
    .triage-btn-desc {
      font-size: 11px;
      color: var(--text-muted);
    }
    .triage-btn-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: #E2E8F0;
      color: #334155;
      white-space: nowrap;
    }
    .triage-btn:hover .triage-btn-tag {
      background: var(--accent);
      color: #fff;
    }

    /* 4 Guarantees Section */
    .section-guarantees {
      padding: 50px 0;
      background: #FFFFFF;
      border-bottom: 1px solid var(--card-border);
    }
    .guarantees-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .guarantee-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .guarantee-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #EFF6FF;
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .guarantee-title {
      font-size: 16px;
      font-weight: 800;
      color: var(--navy);
    }
    .guarantee-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Categories Bento Grid */
    .section-services { padding: 64px 0; }
    .section-head { text-align: center; max-width: 680px; margin: 0 auto 44px; }
    .section-pill {
      display: inline-block;
      background: #E0E7FF;
      color: var(--primary);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 10px;
    }
    .section-title { font-size: 32px; font-weight: 900; color: var(--navy); margin-bottom: 12px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .service-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 30px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s ease;
    }
    .service-card:hover {
      border-color: #93C5FD;
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(30, 58, 138, 0.08);
    }
    .service-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .service-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #F1F5F9;
      color: var(--navy);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .service-card-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--navy);
    }
    .service-list {
      list-style: none;
      margin-bottom: 26px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .service-list li {
      font-size: 13.5px;
      color: #334155;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .service-list svg {
      color: #10B981;
      shrink: 0;
      margin-top: 3px;
    }

    /* Coverage / Bairros */
    .section-coverage {
      background: var(--navy);
      color: #FFFFFF;
      padding: 56px 0;
      border-radius: 24px;
      margin: 40px auto;
    }
    .coverage-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      align-items: center;
    }
    .coverage-title {
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .coverage-desc {
      font-size: 14.5px;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .neighborhoods-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .neighborhood-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      color: #F1F5F9;
    }
    .neighborhood-badge svg { color: #F59E0B; shrink: 0; }

    /* Reviews Bar */
    .section-reviews {
      padding: 40px 0 60px;
      text-align: center;
    }
    .reviews-badge-line {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      padding: 12px 24px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
    }
    .stars-flex { display: flex; gap: 3px; color: var(--yellow); }

    /* Footer & Sticky */
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

    /* Mobile overrides */
    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; gap: 36px; }
      .guarantees-grid { grid-template-columns: 1fr 1fr; }
      .services-grid { grid-template-columns: 1fr; }
      .coverage-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .header-info { display: none; }
      .hero-title { font-size: 28px; }
      .hero-ctas { flex-direction: column; width: 100%; }
      .hero-ctas a { width: 100%; }
      .guarantees-grid { grid-template-columns: 1fr; }
      .neighborhoods-grid { grid-template-columns: 1fr; }
      .footer-content { flex-direction: column; text-align: center; }
      .section-coverage { padding: 32px 16px; margin: 24px 0; border-radius: 16px; }
      .section-coverage .coverage-grid { padding: 0 !important; }
      .section-coverage .btn-wa { width: 100%; font-size: 13.5px; padding: 12px 16px; }
      .reviews-badge-line {
        display: flex;
        flex-direction: column;
        gap: 6px;
        border-radius: 16px;
        padding: 14px 16px;
        max-width: 100%;
        box-sizing: border-box;
      }
      .mobile-sticky-bar { display: flex !important; }
      body { padding-bottom: 70px; }
    }
  </style>
</head>
<body>
  <!-- Emergency Alert Bar -->
  <div class="alert-bar">
    <span class="pulse-dot"></span>
    <span>Plantão de Emergência 24h em ${ctx.city} &bull; Média de Chegada em 40 Minutos</span>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="container header-content">
      <a href="#" class="logo font-montserrat">
        <span>${ctx.bname}</span>
        <span class="logo-badge">24H</span>
      </a>
      <div class="header-info">
        <div class="header-phone-box">
          <div>Plantão Emergencial</div>
          <div class="header-phone-number font-montserrat">${ctx.phone}</div>
        </div>
        <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
          ${ICONS.whatsapp}
          <span>Pedir Técnico</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-left">
        <div class="hero-pill">
          ${ICONS.badgeCheck}
          <span>Eletricista, Encanador e Climatização com Garantia Formal</span>
        </div>
        <h1 class="hero-title font-montserrat">
          Problemas Elétricos ou Hidráulicos? <span>Técnico no seu local em até 40 min.</span>
        </h1>
        <p class="hero-sub">
          Sem enrolação e sem surpresas na conta. Diagnóstico honesto, orçamento sem compromisso e serviço executado com 90 dias de garantia e Nota Fiscal.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
            ${ICONS.whatsapp}
            <span>Chamar Técnico no WhatsApp</span>
          </a>
          <a href="tel:${ctx.phoneClean}" class="btn btn-outline">
            ${ICONS.phone}
            <span>Ligar para o Plantão</span>
          </a>
        </div>
        <div class="hero-stats-row">
          <div class="stat-item">
            ${ICONS.star}
            <span><strong>${ctx.rating}★ no Google</strong> (${ctx.revCount} clientes atendidos)</span>
          </div>
          <div class="stat-item">
            ${ICONS.shield}
            <span><strong>100%</strong> Profissionais com Checagem</span>
          </div>
        </div>
      </div>

      <!-- Urgency Triage Box -->
      <div class="hero-right">
        <div class="triage-card">
          <div class="triage-head">
            <span class="triage-badge">Prioridade no Atendimento</span>
            <div class="triage-title">Qual é a sua urgência hoje?</div>
          </div>
          <div class="triage-options">
            ${emergencyProblems.map(p => `
              <a href="https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(`Olá! Estou com uma emergência de ${p.title} em ${ctx.city} e preciso de um técnico rápido.`)}" target="_blank" class="triage-btn">
                <div class="triage-btn-left">
                  <span class="triage-btn-title">${p.title}</span>
                  <span class="triage-btn-desc">${p.desc}</span>
                </div>
                <span class="triage-btn-tag">${p.tag}</span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 4 Guarantees -->
  <section class="section-guarantees">
    <div class="container guarantees-grid">
      ${guarantees.map(g => `
        <div class="guarantee-box">
          <div class="guarantee-icon">${g.icon}</div>
          <div class="guarantee-title">${g.title}</div>
          <div class="guarantee-desc">${g.desc}</div>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- Services Bento Grid -->
  <section class="section-services">
    <div class="container">
      <div class="section-head">
        <span class="section-pill">Especialidades</span>
        <h2 class="section-title font-montserrat">Serviços Executados com Padrão Profissional</h2>
        <p class="section-desc">Atendemos residências, apartamentos, comércios e condomínios com maquinário próprio e ferramental calibrado.</p>
      </div>

      <div class="services-grid">
        ${serviceCategories.map(cat => `
          <div class="service-card">
            <div>
              <div class="service-header">
                <div class="service-icon-wrap">${cat.icon}</div>
                <h3 class="service-card-title">${cat.category}</h3>
              </div>
              <ul class="service-list">
                ${cat.items.map(item => `
                  <li>
                    ${ICONS.check}
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <a href="https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(`Olá! Gostaria de um orçamento para serviços de ${cat.category} em ${ctx.city}.`)}" target="_blank" class="btn btn-accent" style="width: 100%;">
              <span>${cat.ctaText}</span>
              <span style="margin-left: 8px;">&rarr;</span>
            </a>
          </div>
        `).join('')}
      </div>

      <!-- Coverage Callout -->
      <div class="section-coverage">
        <div class="coverage-grid" style="padding: 0 28px;">
          <div>
            <h3 class="coverage-title font-montserrat">Atendimento Rápido em Toda ${ctx.city}</h3>
            <p class="coverage-desc">Nossa frota de técnicos motorizados circula estrategicamente pelos principais eixos da cidade para garantir chegada em menos de 45 minutos.</p>
            <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
              ${ICONS.whatsapp}
              <span>Consultar Meu Bairro</span>
            </a>
          </div>
          <div class="neighborhoods-grid">
            ${neighborhoods.map(nb => `
              <div class="neighborhood-badge">
                ${ICONS.mapPin}
                <span>${nb}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Google Reviews Floating Bar -->
  <section class="section-reviews">
    <div class="container">
      <div class="reviews-badge-line">
        <div class="stars-flex">${ICONS.star.repeat(5)}</div>
        <span style="font-size: 14px; font-weight: 700; color: var(--navy);">${ctx.rating} de avaliação no Google</span>
        <span style="color: var(--text-muted); font-size: 13px;">(${ctx.revCount} clientes atendidos e satisfeitos em ${ctx.city})</span>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <div>
        <div style="font-weight: 800; color: var(--navy); font-size: 16px; margin-bottom: 4px;">${ctx.bname} &bull; Plantão 24 Horas</div>
        <div>${ctx.address} &bull; ${ctx.city}</div>
      </div>
      <div>
        <a href="${ctx.waLink}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 700;">
          Falar com Atendente de Plantão &rarr;
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
