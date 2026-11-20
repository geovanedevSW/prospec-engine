import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderAuto(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Mecânica & Auto Center em ${ctx.city}</title>
  <meta name="description" content="Diagnóstico por scanner em 30min, orçamento antes da execução e garantia de 6 meses na ${ctx.bname} em ${ctx.city}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --card-border: #E2E8F0;
      --dark: #0F172A;
      --accent: #EAB308;
      --accent-dark: #CA8A04;
      --text: #1E293B;
      --text-muted: #64748B;
      --whatsapp: #25D366;
      --whatsapp-hover: #20BA5A;
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .font-montserrat { font-family: 'Montserrat', sans-serif; letter-spacing: -0.02em; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

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
    .btn-primary {
      background: var(--dark);
      color: #fff;
      padding: 13px 26px;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.25);
    }
    .btn-primary:hover { background: #1E293B; transform: translateY(-2px); }
    .btn-accent {
      background: var(--accent);
      color: #0F172A;
      padding: 13px 26px;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 4px 18px rgba(234, 179, 8, 0.35);
    }
    .btn-accent:hover { background: var(--accent-dark); color: #fff; transform: translateY(-2px); }
    .btn-wa {
      background: var(--whatsapp);
      color: #fff;
      padding: 13px 24px;
      font-size: 14px;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.3);
    }
    .btn-wa:hover { background: var(--whatsapp-hover); transform: translateY(-2px); }

    /* Header */
    .header {
      background: var(--dark);
      color: #fff;
      border-bottom: 2px solid var(--accent);
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
    .brand-title { font-size: 20px; font-weight: 900; color: #fff; text-transform: uppercase; }
    .brand-title span { color: var(--accent); }
    .brand-sub { font-size: 11px; color: #94A3B8; display: block; }
    .nav-links { display: flex; gap: 24px; font-size: 13px; font-weight: 600; }
    .nav-links a { color: #94A3B8; text-decoration: none; }
    .nav-links a:hover { color: #fff; }

    /* Hero */
    .hero {
      background: linear-gradient(180deg, var(--dark) 0%, #1E293B 100%);
      color: #fff;
      padding: 60px 0 54px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 40px;
      align-items: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(234, 179, 8, 0.15);
      border: 1px solid rgba(234, 179, 8, 0.4);
      color: var(--accent);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 46px;
      line-height: 1.1;
      font-weight: 900;
      margin-bottom: 18px;
      text-transform: uppercase;
    }
    .hero-title span { color: var(--accent); }
    .hero-desc {
      font-size: 15.5px;
      color: #94A3B8;
      line-height: 1.6;
      margin-bottom: 28px;
      max-width: 520px;
    }
    .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; }
    .hero-img-wrap { position: relative; }
    .hero-img {
      width: 100%;
      height: 420px;
      object-fit: cover;
      border-radius: 16px;
      border: 2px solid #334155;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .hero-stat {
      position: absolute;
      bottom: -16px;
      left: -16px;
      background: var(--dark);
      border: 1px solid #334155;
      border-left: 4px solid var(--accent);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Symptom Triage Grid (Crucial for Auto Shop Conversion) */
    .section { padding: 64px 0; }
    .section-head { text-align: center; max-width: 640px; margin: 0 auto 40px; }
    .section-tag {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-dark);
      margin-bottom: 6px;
      display: block;
    }
    .section-title { font-size: 32px; font-weight: 900; text-transform: uppercase; color: var(--dark); margin-bottom: 10px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .symptom-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
    .symptom-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 22px;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .symptom-card:hover {
      border-color: var(--dark);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      transform: translateY(-2px);
    }
    .symptom-icon-wrap {
      width: 44px;
      height: 44px;
      background: #F1F5F9;
      color: var(--dark);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 14px;
    }
    .symptom-name { font-size: 17px; font-weight: 800; color: var(--dark); margin-bottom: 6px; }
    .symptom-detail { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; }
    .symptom-btn {
      align-self: flex-start;
      font-size: 12px;
      font-weight: 700;
      color: var(--dark);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
    }
    .symptom-btn:hover { color: var(--accent-dark); }

    /* 4-Step Process Section */
    .process-card {
      background: var(--dark);
      color: #fff;
      border-radius: 20px;
      padding: 44px 36px;
      margin: 40px 0;
    }
    .process-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 32px;
    }
    .process-step {
      position: relative;
    }
    .step-num {
      font-size: 32px;
      font-weight: 900;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 10px;
    }
    .step-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .step-desc { font-size: 12.5px; color: #94A3B8; line-height: 1.5; }

    /* Brands Banner */
    .brands-section {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px 32px;
      text-align: center;
      margin-bottom: 50px;
    }
    .brands-list {
      display: flex;
      justify-content: space-around;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 14px;
      font-weight: 800;
      font-size: 14px;
      color: #64748B;
      letter-spacing: 0.05em;
    }

    /* Footer & Sticky */
    .footer {
      background: var(--dark);
      color: #94A3B8;
      border-top: 2px solid var(--accent);
      padding: 44px 0 30px;
      font-size: 13px;
    }
    .mobile-sticky-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.98);
      border-top: 1px solid #334155;
      padding: 10px 16px;
      gap: 10px;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .btn-sticky-call {
      flex: 1;
      padding: 11px;
      background: #334155;
      color: #fff;
      border-radius: 10px;
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
      border-radius: 10px;
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
      .symptom-grid { grid-template-columns: repeat(2, 1fr); }
      .process-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      body { padding-bottom: 74px; }
      .hero-title { font-size: 32px; }
      .symptom-grid { grid-template-columns: 1fr; }
      .process-grid { grid-template-columns: 1fr; }
      .nav-links { display: none; }
      .mobile-sticky-bar { display: flex !important; }
      .hero-ctas .btn { width: 100%; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container header-inner">
      <div>
        <span class="brand-title font-montserrat">${ctx.bname} <span>AUTO</span></span>
        <span class="brand-sub">${ctx.category} • ${ctx.city}</span>
      </div>
      <div class="nav-links">
        <a href="#sintomas">Diagnóstico</a>
        <a href="#processo">Como Trabalhamos</a>
        <a href="#marcas">Marcas</a>
        <a href="#contato">Localização</a>
      </div>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Orçamento Rápido</span>
      </a>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="hero-badge font-montserrat">
          ${ICONS.shield}
          <span>ORÇAMENTO ANTES DE MEXER NO CARRO • GARANTIA 6 MESES</span>
        </div>
        <h1 class="hero-title font-montserrat">
          MECÂNICA DE PRECISÃO E <span>TRANSPARÊNCIA TOTAL</span> EM ${ctx.city}
        </h1>
        <p class="hero-desc">
          Chega de surpresas na conta. Diagnóstico computadorizado por scanner em 30 minutos, aprovação prévia com fotos no WhatsApp e peças com garantia de fábrica.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-accent">
            <span>Pedir Orçamento Gratuito no WhatsApp</span>
            ${ICONS.arrowRight}
          </a>
          <a href="#sintomas" class="btn btn-primary" style="background: rgba(255,255,255,0.1); border: 1px solid #475569;">
            <span>Identificar Problema no Carro</span>
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94A3B8;">
          <div style="display: flex; color: var(--accent);">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
          <span><strong>${ctx.rating}★</strong> no Google (${ctx.revCount} motoristas satisfeitos)</span>
        </div>
      </div>

      <div class="hero-img-wrap">
        <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1000&q=80" alt="${ctx.bname}" class="hero-img">
        <div class="hero-stat">
          <div style="color: var(--accent);">${ICONS.wrench}</div>
          <div>
            <strong style="color: #fff; font-size: 13px; display: block;">Scanner em 30 Minutos</strong>
            <span style="color: #94A3B8; font-size: 11px;">Sem compromisso no seu bairro</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SYMPTOM DIAGNOSIS SELECTOR -->
  <section class="section" id="sintomas">
    <div class="container">
      <div class="section-head">
        <span class="section-tag font-montserrat">Triagem Rápida</span>
        <h2 class="section-title font-montserrat">QUAL O SINTOMA DO SEU VEÍCULO?</h2>
        <p class="section-desc">Selecione o sintoma para saber o que pode ser e receber uma estimativa rápida via WhatsApp.</p>
      </div>

      <div class="symptom-grid">
        <div class="symptom-card">
          <div>
            <div class="symptom-icon-wrap">${ICONS.wrench}</div>
            <h3 class="symptom-name font-montserrat">Barulho ao Frear ou Pedal Duro</h3>
            <p class="symptom-detail">Pode indicar pastilhas gastas, disco riscado ou fluido de freio vencido. Segurança indispensável.</p>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="symptom-btn">
            <span>Avaliar Freios no WhatsApp</span>
            ${ICONS.arrowRight}
          </a>
        </div>

        <div class="symptom-card">
          <div>
            <div class="symptom-icon-wrap" style="color: #EAB308;">${ICONS.zap}</div>
            <h3 class="symptom-name font-montserrat">Luz da Injeção Acesa no Painel</h3>
            <p class="symptom-detail">Passamos o scanner para ler o código exato da falha: sonda lambda, bicos injetores ou combustível adulterado.</p>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="symptom-btn">
            <span>Passar Scanner Eletrônico</span>
            ${ICONS.arrowRight}
          </a>
        </div>

        <div class="symptom-card">
          <div>
            <div class="symptom-icon-wrap" style="color: #0284C7;">${ICONS.car}</div>
            <h3 class="symptom-name font-montserrat">Carro Puxando ou Vibração no Volante</h3>
            <p class="symptom-detail">Alinhamento 3D a laser e balanceamento dinâmico evitam o desgaste irregular dos seus pneus.</p>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="symptom-btn">
            <span>Agendar Alinhamento 3D</span>
            ${ICONS.arrowRight}
          </a>
        </div>

        <div class="symptom-card">
          <div>
            <div class="symptom-icon-wrap">${ICONS.clock}</div>
            <h3 class="symptom-name font-montserrat">Troca de Óleo & Revisão Periódica</h3>
            <p class="symptom-detail">Óleos sintéticos homologados pelas montadoras com substituição dos filtros de óleo, ar, cabine e combustível.</p>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="symptom-btn">
            <span>Consultar Valor da Troca</span>
            ${ICONS.arrowRight}
          </a>
        </div>

        <div class="symptom-card">
          <div>
            <div class="symptom-icon-wrap" style="color: #059669;">${ICONS.shield}</div>
            <h3 class="symptom-name font-montserrat">Ar Condicionado Sem Gelar / Cheiro Ruim</h3>
            <p class="symptom-detail">Higienização por ozônio (elimina fungos e ácaros), troca do filtro de pólen e recarga com gás R134a.</p>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="symptom-btn">
            <span>Higienizar Ar Condicionado</span>
            ${ICONS.arrowRight}
          </a>
        </div>

        <div class="symptom-card">
          <div>
            <div class="symptom-icon-wrap">${ICONS.wrench}</div>
            <h3 class="symptom-name font-montserrat">Barulho em Buracos & Suspensão</h3>
            <p class="symptom-detail">Inspeção completa de amortecedores, batentes, buchas, pivôs e bandejas com teste de curso.</p>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="symptom-btn">
            <span>Revisar Suspensão</span>
            ${ICONS.arrowRight}
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- 4-STEP TRANSPARENT WORKFLOW -->
  <div class="container" id="processo">
    <div class="process-card">
      <div style="text-align: center; max-width: 600px; margin: 0 auto;">
        <span style="color: var(--accent); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">Zero Surpresas</span>
        <h3 class="font-montserrat" style="font-size: 26px; color: #fff; text-transform: uppercase;">Como Funciona Nosso Atendimento</h3>
      </div>
      <div class="process-grid">
        <div class="process-step">
          <div class="step-num font-montserrat">01</div>
          <h4 class="step-title font-montserrat">Check-up & Scanner</h4>
          <p class="step-desc">Avaliamos o veículo na hora e identificamos as anomalias técnicas.</p>
        </div>
        <div class="process-step">
          <div class="step-num font-montserrat">02</div>
          <h4 class="step-title font-montserrat">Fotos no WhatsApp</h4>
          <p class="step-desc">Enviamos fotos das peças desgastadas e o orçamento discriminado.</p>
        </div>
        <div class="process-step">
          <div class="step-num font-montserrat">03</div>
          <h4 class="step-title font-montserrat">Sua Autorização</h4>
          <p class="step-desc">Nenhum parafuso é mexido sem a sua prévia aprovação.</p>
        </div>
        <div class="process-step">
          <div class="step-num font-montserrat">04</div>
          <h4 class="step-title font-montserrat">Garantia de 6 Meses</h4>
          <p class="step-desc">Veículo testado e entregue com nota e certificado de garantia.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- SUPPORTED BRANDS -->
  <div class="container" id="marcas">
    <div class="brands-section">
      <span style="font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;">
        Especialistas em Nacionais e Importados
      </span>
      <div class="brands-list font-montserrat">
        <span>VOLKSWAGEN</span>
        <span>CHEVROLET</span>
        <span>FIAT</span>
        <span>TOYOTA</span>
        <span>HYUNDAI</span>
        <span>HONDA</span>
        <span>JEEP</span>
        <span>RENAULT</span>
        <span>NISSAN</span>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="footer" id="contato">
    <div class="container" style="text-align: center;">
      <h4 class="font-montserrat" style="font-size: 20px; color: #fff; text-transform: uppercase; margin-bottom: 8px;">
        ${ctx.bname} Auto Center
      </h4>
      <p style="margin-bottom: 8px;">${ctx.address} • ${ctx.city}</p>
      <p style="margin-bottom: 24px;">Atendimento: Segunda a Sexta das 08h às 18h • Sábados das 08h às 12h</p>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Falar com o Chefe de Oficina</span>
      </a>
      <p style="font-size: 11px; margin-top: 36px; opacity: 0.6;">© 2026 ${ctx.bname}. Todos os direitos reservados. Presença digital oficial com triagem WhatsApp.</p>
    </div>
  </footer>

  ${renderStickyBar(ctx)}

  <!-- GSAP Scroll Animations -->
  ${renderGsapScript()}
</body>
</html>`;
}

