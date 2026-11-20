import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderPet(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Clínica Veterinária & Pet Shop em ${ctx.city}</title>
  <meta name="description" content="Cuidado com amor, banho e tosa sem estresse e consultas veterinárias na ${ctx.bname} em ${ctx.city}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F0FDF4;
      --card: #FFFFFF;
      --card-border: #D1FAE5;
      --teal: #0D9488;
      --teal-hover: #0F766E;
      --green-dark: #064E3B;
      --yellow: #F59E0B;
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
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .font-nunito { font-family: 'Nunito', sans-serif; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

    /* Anti-wrap rules (GEMINI.md) */
    .btn, button, a.btn {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-weight: 800;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-teal {
      background: var(--teal);
      color: #fff;
      padding: 13px 26px;
      font-size: 14px;
      box-shadow: 0 4px 18px rgba(13, 148, 136, 0.35);
    }
    .btn-teal:hover { background: var(--teal-hover); transform: translateY(-2px); }
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
      color: var(--teal);
      border: 1px solid var(--card-border);
      padding: 12px 22px;
      font-size: 14px;
    }
    .btn-outline:hover { border-color: var(--teal); background: #F0FDF4; }

    /* Header */
    .header {
      background: rgba(240, 253, 244, 0.95);
      border-bottom: 1px solid var(--card-border);
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
    .brand-title { font-size: 21px; font-weight: 900; color: var(--green-dark); }
    .brand-title span { color: var(--teal); }
    .brand-sub { font-size: 11px; color: var(--text-muted); display: block; }
    .nav-links { display: flex; gap: 24px; font-size: 13.5px; font-weight: 700; }
    .nav-links a { color: var(--text-muted); text-decoration: none; }
    .nav-links a:hover { color: var(--teal); }

    /* Hero */
    .hero { padding: 60px 0 50px; }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 40px;
      align-items: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #D1FAE5;
      color: var(--green-dark);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 46px;
      line-height: 1.15;
      color: var(--green-dark);
      margin-bottom: 18px;
    }
    .hero-title span { color: var(--teal); }
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
      height: 440px;
      object-fit: cover;
      border-radius: 28px;
      box-shadow: 0 16px 36px rgba(13, 148, 136, 0.12);
      border: 1px solid var(--card-border);
    }
    .hero-badge-float {
      position: absolute;
      bottom: -16px;
      left: -16px;
      background: #FFFFFF;
      padding: 14px 20px;
      border-radius: 18px;
      border: 1px solid var(--card-border);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* 2 Big Pillars: Clínica Vet vs Banho & Tosa */
    .section { padding: 60px 0; }
    .section-head { text-align: center; max-width: 620px; margin: 0 auto 40px; }
    .section-title { font-size: 34px; color: var(--green-dark); margin-bottom: 10px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }
    .pillar-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .pillar-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .pillar-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--bg);
      color: var(--teal);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pillar-title { font-size: 22px; font-weight: 900; color: var(--green-dark); }
    .pillar-list { list-style: none; space-y: 12px; margin-bottom: 28px; }
    .pillar-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; color: var(--text); }
    .pillar-list svg { color: var(--teal); shrink: 0; margin-top: 3px; }

    /* Trust Seals (Camera ao vivo, sem sedativos, etc.) */
    .seals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 40px 0;
    }
    .seal-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 20px;
      text-align: center;
    }
    .seal-icon {
      color: var(--teal);
      margin: 0 auto 10px;
    }
    .seal-title { font-size: 15px; font-weight: 800; color: var(--green-dark); margin-bottom: 4px; }
    .seal-desc { font-size: 12px; color: var(--text-muted); }

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
      background: rgba(240, 253, 244, 0.96);
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
      color: var(--green-dark);
      border: 1px solid var(--card-border);
      border-radius: 9999px;
      font-weight: 800;
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
      font-weight: 800;
      font-size: 13.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }

    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; gap: 32px; }
      .pillars-grid { grid-template-columns: 1fr; }
      .seals-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      body { padding-bottom: 74px; }
      .hero-title { font-size: 32px; }
      .nav-links { display: none; }
      .mobile-sticky-bar { display: flex !important; }
      .hero-ctas .btn { width: 100%; }
      .seals-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container header-inner">
      <div>
        <span class="brand-title font-nunito">${ctx.bname} <span>PET</span></span>
        <span class="brand-sub">${ctx.category} • ${ctx.city}</span>
      </div>
      <div class="nav-links">
        <a href="#pilares">Serviços</a>
        <a href="#diferenciais">Cuidados</a>
        <a href="#contato">Localização</a>
      </div>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Agendar Banho / Consulta</span>
      </a>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="hero-badge font-nunito">
          ${ICONS.heart}
          <span>CUIDADO COM AMOR • TÁXI DOG LEVA E TRAZ</span>
        </div>
        <h1 class="hero-title font-nunito">
          Saúde Veterinária & Estética Pet com <span>Respeito e Carinho</span>
        </h1>
        <p class="hero-desc">
          Chega de pets estressados no banho. Na ${ctx.bname}, usamos toalhas individuais esterilizadas, xampus dermatológicos e consultas sem pressa em ${ctx.city}.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-teal">
            <span>Chamar no WhatsApp do Pet Shop</span>
            ${ICONS.arrowRight}
          </a>
          <a href="#pilares" class="btn btn-outline">
            <span>Conhecer Nossos Serviços</span>
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted);">
          <div style="display: flex; color: #F59E0B;">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
          <span><strong>${ctx.rating}★</strong> no Google (${ctx.revCount} tutores satisfeitos)</span>
        </div>
      </div>

      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80" alt="${ctx.bname}" class="hero-img">
        <div class="hero-badge-float">
          <div style="color: var(--teal);">${ICONS.award}</div>
          <div>
            <strong style="color: var(--green-dark); font-size: 13px; display: block;">Vidro Panorâmico</strong>
            <span style="color: var(--text-muted); font-size: 11px;">Você assiste ao banho do seu pet</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 2 PILLARS: CLINICA VET VS BANHO & TOSA -->
  <section class="section" id="pilares">
    <div class="container">
      <div class="section-head">
        <span style="font-size: 11px; font-weight: 800; color: var(--teal); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">Atendimento Completo</span>
        <h2 class="section-title font-nunito">TUDO O QUE SEU PET PRECISA EM UM SÓ LUGAR</h2>
        <p class="section-desc">Estrutura integrada para manter a saúde e a estética do seu melhor amigo em dia.</p>
      </div>

      <div class="pillars-grid">
        <div class="pillar-card">
          <div>
            <div class="pillar-header">
              <div class="pillar-icon">${ICONS.shield}</div>
              <div>
                <h3 class="pillar-title font-nunito">Clínica Veterinária</h3>
                <span style="font-size: 12px; color: var(--text-muted);">Consultas preventivas e tratamentos</span>
              </div>
            </div>
            <ul class="pillar-list">
              <li>${ICONS.check} <strong>Consultas com Hora Marcada:</strong> Sem espera na recepção e sem estresse para seu cão ou gato.</li>
              <li>${ICONS.check} <strong>Vacinas Importadas (V10, Gripe e Raiva):</strong> Carteirinha digital e controle rigoroso de datas.</li>
              <li>${ICONS.check} <strong>Exames Laboratoriais Rápidos:</strong> Hemograma e bioquímica para diagnósticos precisos.</li>
              <li>${ICONS.check} <strong>Cirurgias & Castração Segura:</strong> Centro cirúrgico com anestesia inalatória monitorada.</li>
            </ul>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-teal" style="width: 100%;">
            Agendar Consulta Veterinária
          </a>
        </div>

        <div class="pillar-card">
          <div>
            <div class="pillar-header">
              <div class="pillar-icon" style="background: #FEF3C7; color: #B45309;">${ICONS.award}</div>
              <div>
                <h3 class="pillar-title font-nunito">Banho, Tosa & Estética</h3>
                <span style="font-size: 12px; color: var(--text-muted);">Cuidado especial e relaxamento</span>
              </div>
            </div>
            <ul class="pillar-list">
              <li>${ICONS.check} <strong>Toalhas Esterilizadas Individuais:</strong> Seladas e higienizadas em lavanderia industrial.</li>
              <li>${ICONS.check} <strong>Tosa Higiênica e Tosa na Tesoura:</strong> Tosadores especialistas nas raças Shih-tzu, Spitz e Poodle.</li>
              <li>${ICONS.check} <strong>Hidratação Profunda de Pelos:</strong> Máscaras com queratina vegetal e óleo de argan.</li>
              <li>${ICONS.check} <strong>Táxi Dog Climatizado:</strong> Buscamos e entregamos na porta da sua casa em ${ctx.city}.</li>
            </ul>
          </div>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="width: 100%;">
            Agendar Banho no WhatsApp
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- 4 SEALS OF CARE -->
  <div class="container" id="diferenciais">
    <div class="seals-grid">
      <div class="seal-card">
        <div class="seal-icon">${ICONS.shield}</div>
        <h4 class="seal-title font-nunito">Zero Sedativos</h4>
        <p class="seal-desc">Manejo respeitoso no tempo do pet, com pausas se ele se sentir ansioso.</p>
      </div>
      <div class="seal-card">
        <div class="seal-icon">${ICONS.check}</div>
        <h4 class="seal-title font-nunito">Dermatológico</h4>
        <p class="seal-desc">Produtos hipoalergênicos e água em temperatura controlada.</p>
      </div>
      <div class="seal-card">
        <div class="seal-icon">${ICONS.clock}</div>
        <h4 class="seal-title font-nunito">Táxi Pet Pontual</h4>
        <p class="seal-desc">Transporte climatizado com caixas higienizadas e cinto de segurança.</p>
      </div>
      <div class="seal-card">
        <div class="seal-icon">${ICONS.award}</div>
        <h4 class="seal-title font-nunito">CRMV Ativo</h4>
        <p class="seal-desc">Veterinários formados e presentes durante todo o expediente.</p>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="footer" id="contato">
    <div class="container" style="text-align: center;">
      <h4 class="font-nunito" style="font-size: 22px; color: var(--green-dark); margin-bottom: 6px;">${ctx.bname}</h4>
      <p style="margin-bottom: 12px;">${ctx.address} • ${ctx.city}</p>
      <p style="margin-bottom: 24px;">Atendimento: Segunda a Sábado das 08h às 18h • Plantão Emergencial via WhatsApp</p>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Falar com o Plantão Pet</span>
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

