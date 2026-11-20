import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderFitness(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Academia & Treino em ${ctx.city}</title>
  <meta name="description" content="Sem taxa de matrícula. Musculação completa, aulas coletivas e treinos personalizados na ${ctx.bname} em ${ctx.city}.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #09090B;
      --card: #141416;
      --card-border: #27272A;
      --accent: #EA580C;
      --accent-hover: #C2410C;
      --text: #F4F4F5;
      --text-muted: #A1A1AA;
      --whatsapp: #25D366;
      --whatsapp-hover: #20BA5A;
      --radius: 14px;
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
    .font-oswald { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.02em; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

    /* Anti-wrap rule (GEMINI.md) */
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
      color: #FFFFFF;
      padding: 13px 26px;
      font-size: 14px;
      box-shadow: 0 0 24px rgba(234, 88, 12, 0.4);
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .btn-wa {
      background: var(--whatsapp);
      color: #FFFFFF;
      padding: 13px 24px;
      font-size: 14px;
      box-shadow: 0 4px 18px rgba(37, 211, 102, 0.35);
      gap: 8px;
    }
    .btn-wa:hover { background: var(--whatsapp-hover); transform: translateY(-2px); }
    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--card-border);
      padding: 12px 22px;
      font-size: 14px;
    }
    .btn-outline:hover { border-color: var(--accent); color: var(--accent); }

    /* Header */
    .header {
      border-bottom: 1px solid var(--card-border);
      background: rgba(9, 9, 11, 0.9);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-badge {
      width: 42px;
      height: 42px;
      background: var(--accent);
      color: #fff;
      font-weight: 900;
      font-size: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name { font-size: 17px; font-weight: 700; color: #fff; }
    .brand-sub { font-size: 11px; color: var(--text-muted); display: block; }
    .nav-links { display: flex; gap: 24px; font-size: 13px; font-weight: 600; }
    .nav-links a { color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
    .nav-links a:hover { color: #fff; }

    /* Hero Section */
    .hero {
      position: relative;
      padding: 70px 0 60px;
      background: radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.15) 0%, transparent 60%);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 40px;
      align-items: center;
    }
    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(234, 88, 12, 0.15);
      border: 1px solid rgba(234, 88, 12, 0.35);
      color: #FDBA74;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 52px;
      line-height: 1.05;
      font-weight: 700;
      color: #fff;
      margin-bottom: 18px;
    }
    .hero-title span { color: var(--accent); }
    .hero-sub {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 28px;
      max-width: 500px;
    }
    .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; }
    .hero-visual {
      position: relative;
    }
    .hero-img {
      width: 100%;
      height: 460px;
      object-fit: cover;
      border-radius: 20px;
      border: 1px solid var(--card-border);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .hero-stat-card {
      position: absolute;
      bottom: -16px;
      left: -16px;
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    /* Energy Marquee Band */
    .energy-band {
      background: var(--accent);
      color: #fff;
      padding: 14px 0;
      overflow: hidden;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.05em;
    }
    .energy-band-inner {
      display: flex;
      justify-content: space-around;
      gap: 20px;
      flex-wrap: wrap;
    }

    /* Modalities Section */
    .section { padding: 70px 0; }
    .section-head { text-align: center; max-width: 650px; margin: 0 auto 44px; }
    .section-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 6px;
      display: block;
    }
    .section-title { font-size: 34px; line-height: 1.15; color: #fff; margin-bottom: 12px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .modalities-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }
    .modality-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s ease;
      display: flex;
      flex-col: column;
    }
    .modality-card:hover { border-color: var(--accent); transform: translateY(-4px); }
    .modality-img { width: 100%; height: 180px; object-fit: cover; }
    .modality-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
    .modality-badge {
      align-self: flex-start;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      background: rgba(234, 88, 12, 0.15);
      color: #FB923C;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .modality-title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .modality-desc { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; flex: 1; }

    /* Plans & Pricing Cards (Crucial for Gym conversion) */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      align-items: stretch;
    }
    .price-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .price-card.featured {
      border-color: var(--accent);
      background: linear-gradient(180deg, #181411 0%, var(--card) 100%);
      box-shadow: 0 0 32px rgba(234, 88, 12, 0.2);
    }
    .featured-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .plan-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .plan-price { font-size: 42px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 4px; }
    .plan-price span { font-size: 14px; font-weight: 400; color: var(--text-muted); }
    .plan-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--card-border); }
    .plan-features { list-style: none; space-y: 12px; margin-bottom: 28px; flex: 1; }
    .plan-features li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text); }
    .plan-features svg { color: var(--accent); shrink: 0; }

    /* Footer & Sticky */
    .footer {
      border-top: 1px solid var(--card-border);
      padding: 40px 0;
      font-size: 12.5px;
      color: var(--text-muted);
      text-align: center;
    }
    .mobile-sticky-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(9, 9, 11, 0.95);
      border-top: 1px solid var(--card-border);
      padding: 10px 16px;
      gap: 10px;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .btn-sticky-call {
      flex: 1;
      padding: 12px;
      background: #27272A;
      color: #fff;
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
      padding: 12px 18px;
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
      .hero-grid { grid-template-columns: 1fr; }
      .hero-img { height: 320px; }
      .modalities-grid { grid-template-columns: repeat(2, 1fr); }
      .pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
    }
    @media (max-width: 640px) {
      body { padding-bottom: 74px; }
      .hero-title { font-size: 34px; }
      .modalities-grid { grid-template-columns: 1fr; }
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
      <div class="brand">
        <div class="brand-badge font-oswald">${ctx.bname.charAt(0)}</div>
        <div>
          <span class="brand-name">${ctx.bname}</span>
          <span class="brand-sub">${ctx.category} • ${ctx.city}</span>
        </div>
      </div>
      <div class="nav-links">
        <a href="#modalidades">Modalidades</a>
        <a href="#planos">Planos & Preços</a>
        <a href="#localizacao">Estrutura</a>
      </div>
      <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
        ${ICONS.whatsapp}
        <span>Aula Grátis</span>
      </a>
    </div>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="hero-tag">
          ${ICONS.zap}
          <span>SEM TAXA DE MATRÍCULA • VAGAS LIMITADAS</span>
        </div>
        <h1 class="hero-title font-oswald">
          TREINO DE ALTA PERFORMANCE COM <span>ACOMPANHAMENTO REAL</span>
        </h1>
        <p class="hero-sub">
          Musculação de ponta, professores dedicados no salão e treinos personalizados para o seu objetivo em ${ctx.city}. Comece hoje mesmo.
        </p>
        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            <span>Agendar Aula Experimental no WhatsApp</span>
            ${ICONS.arrowRight}
          </a>
          <a href="#planos" class="btn btn-outline">
            <span>Ver Planos Mensais</span>
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-muted);">
          <div style="display: flex; color: #F59E0B;">${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}${ICONS.star}</div>
          <span><strong>${ctx.rating}</strong> no Google (${ctx.revCount} avaliações de alunos)</span>
        </div>
      </div>

      <div class="hero-visual">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80" alt="${ctx.bname}" class="hero-img">
        <div class="hero-stat-card">
          <div style="color: var(--accent);">${ICONS.award}</div>
          <div>
            <strong style="color: #fff; font-size: 13px; display: block;">Instrutores no Salão</strong>
            <span style="color: var(--text-muted); font-size: 11px;">Correção de postura e acompanhamento</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- MARQUEE ENERGY BAND -->
  <div class="energy-band font-oswald">
    <div class="energy-band-inner container">
      <span>• MUSCULAÇÃO COMPLETA</span>
      <span>• CROSS & FUNCIONAL</span>
      <span>• AULAS DE RITMOS & SPINNING</span>
      <span>• BIOIMPEDÂNCIA MENSAL</span>
      <span>• ESTACIONAMENTO GRÁTIS</span>
    </div>
  </div>

  <!-- MODALITIES -->
  <section class="section" id="modalidades">
    <div class="container">
      <div class="section-head">
        <span class="section-tag">Variedade de Treinos</span>
        <h2 class="section-title font-oswald">MODALIDADES PARA TODOS OS OBJETIVOS</h2>
        <p class="section-desc">Treine no seu ritmo com infraestrutura climatizada e aparelhos biomecânicos de última geração.</p>
      </div>

      <div class="modalities-grid">
        <div class="modality-card">
          <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" alt="Musculação" class="modality-img">
          <div class="modality-body">
            <span class="modality-badge">Hipertrofia & Força</span>
            <h3 class="modality-title font-oswald">Musculação Guiada</h3>
            <p class="modality-desc">Treinos montados no app com acompanhamento contínuo dos instrutores em todos os horários.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 12px; padding: 8px 14px;">Quero Conhecer</a>
          </div>
        </div>

        <div class="modality-card">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80" alt="Cross Funcional" class="modality-img">
          <div class="modality-body">
            <span class="modality-badge">Alta Intensidade</span>
            <h3 class="modality-title font-oswald">Cross Training</h3>
            <p class="modality-desc">Condicionamento cardiorrespiratório e queima calórica intensa em aulas dinâmicas em grupo.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 12px; padding: 8px 14px;">Quero Conhecer</a>
          </div>
        </div>

        <div class="modality-card">
          <img src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=600&q=80" alt="Spinning" class="modality-img">
          <div class="modality-body">
            <span class="modality-badge">Cardio & Energia</span>
            <h3 class="modality-title font-oswald">Spinning Indoor</h3>
            <p class="modality-desc">Sala exclusiva com som e iluminação imersiva para queimar até 700 calorias por aula.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 12px; padding: 8px 14px;">Quero Conhecer</a>
          </div>
        </div>

        <div class="modality-card">
          <img src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80" alt="Pilates" class="modality-img">
          <div class="modality-body">
            <span class="modality-badge">Postura & Mobilidade</span>
            <h3 class="modality-title font-oswald">Pilates & Alongamento</h3>
            <p class="modality-desc">Alívio de dores nas costas, melhora da flexibilidade e fortalecimento do core muscular.</p>
            <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 12px; padding: 8px 14px;">Quero Conhecer</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING TABLE (Key Brazilian Gym Conversion mechanic) -->
  <section class="section" id="planos" style="background: #0D0D0F;">
    <div class="container">
      <div class="section-head">
        <span class="section-tag">Transparência Total</span>
        <h2 class="section-title font-oswald">ESCOLHA O PLANO IDEAL PARA A SUA ROTINA</h2>
        <p class="section-desc">Sem pegadinhas, sem taxas ocultas. Pagamento facilitado no Pix, Boleto ou Cartão sem bloquear o limite.</p>
      </div>

      <div class="pricing-grid">
        <div class="price-card">
          <h3 class="plan-name font-oswald">Plano Mensal Livre</h3>
          <div class="plan-price font-oswald">R$ 119<span>/mês</span></div>
          <div class="plan-sub">Sem taxa de matrícula • Sem fidelidade</div>
          <ul class="plan-features">
            <li>${ICONS.check} Acesso livre à Musculação</li>
            <li>${ICONS.check} Horário livre (Segunda a Sábado)</li>
            <li>${ICONS.check} Treino no Aplicativo</li>
            <li style="color: var(--text-muted); opacity: 0.6;">- Aulas coletivas não inclusas</li>
          </ul>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="width: 100%;">
            Matricular pelo WhatsApp
          </a>
        </div>

        <div class="price-card featured">
          <span class="featured-badge font-oswald">Mais Popular</span>
          <h3 class="plan-name font-oswald">Plano Semestral VIP</h3>
          <div class="plan-price font-oswald" style="color: var(--accent);">R$ 99<span>/mês</span></div>
          <div class="plan-sub">Todas as modalidades inclusas • Sem taxa</div>
          <ul class="plan-features">
            <li>${ICONS.check} Musculação + Todas as Aulas Coletivas</li>
            <li>${ICONS.check} Spinning, Cross, Ritmos e Pilates</li>
            <li>${ICONS.check} Avaliação Física e Bioimpedância</li>
            <li>${ICONS.check} Direito a 2 convidados por mês</li>
          </ul>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%;">
            Garantir Vaga Promocional
          </a>
        </div>

        <div class="price-card">
          <h3 class="plan-name font-oswald">Plano Anual Total</h3>
          <div class="plan-price font-oswald">R$ 79<span>/mês</span></div>
          <div class="plan-sub">Maior economia • Recorrência no cartão</div>
          <ul class="plan-features">
            <li>${ICONS.check} Acesso total sem restrição</li>
            <li>${ICONS.check} Trancamento de férias (30 dias)</li>
            <li>${ICONS.check} Bioimpedância mensal gratuita</li>
            <li>${ICONS.check} Camiseta exclusiva de boas-vindas</li>
          </ul>
          <a href="${ctx.waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="width: 100%;">
            Matricular no Anual
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div style="margin-bottom: 12px; font-weight: 700; color: #fff;">${ctx.bname} • ${ctx.city}</div>
      <p style="margin-bottom: 16px;">${ctx.address} • Atendimento de Segunda a Sábado</p>
      <p style="font-size: 11px; opacity: 0.7;">© 2026 ${ctx.bname}. Todos os direitos reservados. Presença digital oficial com WhatsApp direto.</p>
    </div>
  </footer>

  ${renderStickyBar(ctx)}

  <!-- GSAP Scroll Animations -->
  ${renderGsapScript()}
</body>
</html>`;
}

