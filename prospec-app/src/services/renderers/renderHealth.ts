import { NicheKit } from '../nicheKits.js';
import { Lead } from '../../domain/types.js';
import { resolveContext, ICONS, renderStickyBar, renderGsapScript } from './common.js';

export function renderHealth(kit: NicheKit, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
  const ctx = resolveContext(kit, options);

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

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ctx.bname} | Clínica Odontológica & Saúde em ${ctx.city}</title>
  <meta name="description" content="Implantes sem dor, alinhadores transparentes e estética do sorriso no ${ctx.bname} em ${ctx.city}. Atendimento de segunda a sábado!">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #F8FAFC;
      --card: #FFFFFF;
      --card-border: #E2E8F0;
      --wine: #5B2329;
      --wine-dark: #3F151B;
      --wine-light: #FDF2F4;
      --gold: #C5A880;
      --cyan: #0284C7;
      --cyan-light: #E0F2FE;
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
    .btn-wine {
      background: var(--wine);
      color: #FFFFFF;
      padding: 13px 26px;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(91, 35, 41, 0.3);
    }
    .btn-wine:hover { background: var(--wine-dark); transform: translateY(-2px); }
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
      color: var(--wine);
      border: 1.5px solid var(--card-border);
      padding: 12px 22px;
      font-size: 14px;
    }
    .btn-outline:hover { border-color: var(--wine); background: var(--wine-light); }

    /* Top Strip */
    .top-strip {
      background: var(--wine-dark);
      color: #F8FAFC;
      padding: 8px 16px;
      font-size: 12.5px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .top-strip strong { color: var(--gold); }

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
      color: var(--wine);
      font-weight: 900;
      font-size: 22px;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* Hero */
    .hero {
      padding: 56px 0 68px;
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
      background: var(--wine-light);
      border: 1px solid #FBCFE8;
      color: var(--wine);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .hero-title {
      font-size: 42px;
      line-height: 1.15;
      font-weight: 900;
      color: var(--wine-dark);
      letter-spacing: -0.5px;
      margin-bottom: 18px;
    }
    .hero-title span { color: var(--wine); }
    .hero-sub {
      font-size: 16px;
      line-height: 1.6;
      color: var(--text-muted);
      margin-bottom: 24px;
      max-width: 520px;
    }

    /* Quick Filter Chips (like reference image) */
    .treatment-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 28px;
    }
    .t-chip {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .t-chip:hover {
      border-color: var(--wine);
      color: var(--wine);
      background: var(--wine-light);
    }

    .hero-ctas {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    /* Hero Right Image & Doctor Card */
    .hero-image-wrap {
      position: relative;
    }
    .hero-img {
      width: 100%;
      height: 460px;
      object-fit: cover;
      border-radius: 28px;
      box-shadow: 0 20px 40px rgba(91, 35, 41, 0.12);
    }
    .doctor-float-card {
      position: absolute;
      bottom: -20px;
      right: -16px;
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 16px 20px;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 320px;
    }
    .doctor-avatar {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      object-fit: cover;
    }
    .doctor-info-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--wine-dark);
    }
    .doctor-info-sub {
      font-size: 11.5px;
      color: var(--text-muted);
    }
    .doctor-info-rating {
      font-size: 12px;
      font-weight: 700;
      color: var(--yellow);
      margin-top: 2px;
    }

    /* 4 Trust Metrics Bar (Dentacare reference style) */
    .section-metrics {
      padding: 30px 0 50px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .metric-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 22px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
    }
    .metric-icon-box {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: var(--wine-light);
      color: var(--wine);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .metric-val {
      font-size: 22px;
      font-weight: 900;
      color: var(--wine-dark);
      line-height: 1.1;
    }
    .metric-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Treatments Section */
    .section-treatments {
      padding: 60px 0 70px;
      background: #FFFFFF;
      border-top: 1px solid var(--card-border);
      border-bottom: 1px solid var(--card-border);
    }
    .section-head { text-align: center; max-width: 640px; margin: 0 auto 44px; }
    .section-pill {
      display: inline-block;
      background: var(--wine-light);
      color: var(--wine);
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 10px;
    }
    .section-title { font-size: 32px; font-weight: 900; color: var(--wine-dark); margin-bottom: 12px; }
    .section-desc { font-size: 15px; color: var(--text-muted); }

    .treatments-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 26px;
    }
    .treatment-card {
      background: var(--bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      transition: all 0.25s ease;
    }
    .treatment-card:hover {
      border-color: #FBCFE8;
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(91, 35, 41, 0.08);
    }
    .treatment-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      min-height: 200px;
    }
    .treatment-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .treatment-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      background: #FFFFFF;
      color: var(--wine);
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid #FBCFE8;
      margin-bottom: 8px;
    }
    .treatment-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--wine-dark);
      margin-bottom: 8px;
    }
    .treatment-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 18px;
    }
    .treatment-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--wine);
      text-decoration: none;
    }
    .treatment-link:hover { text-decoration: underline; }

    /* Doctor Authority Section */
    .section-doctors {
      padding: 60px 0;
    }
    .doctors-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }
    .doctor-profile-card {
      background: #FFFFFF;
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 28px;
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .doc-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .doc-name { font-size: 18px; font-weight: 800; color: var(--wine-dark); }
    .doc-role { font-size: 13px; color: var(--wine); font-weight: 600; margin-bottom: 4px; }
    .doc-cro { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }

    /* Banner Facilitado */
    .banner-facilidades {
      background: linear-gradient(135deg, var(--wine) 0%, var(--wine-dark) 100%);
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
    .banner-facilidades h3 { font-size: 26px; font-weight: 900; margin-bottom: 8px; }
    .banner-facilidades p { font-size: 14.5px; color: #FDF2F4; }

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
      .metrics-grid { grid-template-columns: 1fr 1fr; }
      .treatments-grid { grid-template-columns: 1fr; }
      .doctors-grid { grid-template-columns: 1fr; }
      .doctor-float-card { position: static; margin-top: 16px; max-width: 100%; }
    }
    @media (max-width: 640px) {
      .header-actions { display: none; }
      .hero-title { font-size: 29px; }
      .hero-ctas { flex-direction: column; width: 100%; }
      .hero-ctas a { width: 100%; }
      .treatment-card { grid-template-columns: 1fr; }
      .treatment-img { height: 180px; }
      .metrics-grid { grid-template-columns: 1fr; }
      .banner-facilidades { padding: 28px 20px; text-align: center; }
      .banner-facilidades a { width: 100%; }
      .footer-content { flex-direction: column; text-align: center; }
      .mobile-sticky-bar { display: flex !important; }
      body { padding-bottom: 70px; }
    }
  </style>
</head>
<body>
  <!-- Top Strip -->
  <div class="top-strip">
    <span>${ctx.bname} &bull; Clínica Odontológica em ${ctx.city}</span>
    <span>&bull;</span>
    <span><strong>Atendimento de Segunda a Sábado!</strong></span>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="container header-content">
      <a href="#" class="brand-logo font-heading">
        <div>
          <div>${ctx.bname}</div>
          <div class="brand-sub">Odontologia Especializada</div>
        </div>
      </a>
      <div class="header-actions">
        <a href="tel:${ctx.phoneClean}" class="btn btn-outline">
          ${ICONS.phone}
          <span>${ctx.phone}</span>
        </a>
        <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
          ${ICONS.whatsapp}
          <span>Agendar Consulta</span>
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
          <span>Odontologia Moderna & Cuidado Humanizado</span>
        </div>
        <h1 class="hero-title font-heading">
          A clínica odontológica ideal <span>para você e sua família.</span>
        </h1>
        <p class="hero-sub">
          Tratamentos modernos, scanner 3D sem moldagem desagradável e procedimentos planejados para serem tranquilos e sem dor.
        </p>

        <!-- Treatment Filter Chips (reference style) -->
        <div class="treatment-chips">
          <a href="#tratamentos" class="t-chip">Implantes</a>
          <a href="#tratamentos" class="t-chip">Invisalign</a>
          <a href="#tratamentos" class="t-chip">Clareamento a Laser</a>
          <a href="#tratamentos" class="t-chip">Lentes em Porcelana</a>
          <a href="#tratamentos" class="t-chip">Canal sem Dor</a>
          <a href="#tratamentos" class="t-chip">Odontopediatria</a>
        </div>

        <div class="hero-ctas">
          <a href="${ctx.waLink}" target="_blank" class="btn btn-wa">
            ${ICONS.whatsapp}
            <span>Agendar Avaliação no WhatsApp</span>
          </a>
          <a href="#tratamentos" class="btn btn-outline">
            <span>Conhecer Especialidades</span>
            <span style="margin-left: 6px;">&darr;</span>
          </a>
        </div>
      </div>

      <!-- Hero Visual + Doctor Floating Badge -->
      <div class="hero-right">
        <div class="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80" alt="${ctx.bname} Clínica Odontológica" class="hero-img">
          <div class="doctor-float-card">
            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80" alt="Dr. Roberto" class="doctor-avatar">
            <div>
              <div class="doctor-info-title">Dr. Roberto Silveira</div>
              <div class="doctor-info-sub">Resp. Técnico &bull; CRO-MG 48.912</div>
              <div class="doctor-info-rating">4.9 ★★★★★ (${ctx.revCount} avaliações)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 4 Trust Metrics -->
  <section class="section-metrics">
    <div class="container metrics-grid">
      <div class="metric-card">
        <div class="metric-icon-box">${ICONS.badgeCheck}</div>
        <div>
          <div class="metric-val font-heading">98%</div>
          <div class="metric-label">Pacientes Satisfeitos</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon-box">${ICONS.star}</div>
        <div>
          <div class="metric-val font-heading">12.000+</div>
          <div class="metric-label">Sorrisos Renovados</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon-box">${ICONS.star}</div>
        <div>
          <div class="metric-val font-heading">${ctx.rating} ★</div>
          <div class="metric-label">Avaliação Google (${ctx.revCount})</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon-box">${ICONS.clock}</div>
        <div>
          <div class="metric-val font-heading">Seg a Sáb</div>
          <div class="metric-label">Horários Flexíveis</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Treatments Bento -->
  <section id="tratamentos" class="section-treatments">
    <div class="container">
      <div class="section-head">
        <span class="section-pill">Especialidades</span>
        <h2 class="section-title font-heading">Tratamentos Planejados para o Seu Conforto</h2>
        <p class="section-desc">Tecnologia avançada para resultados estéticos de alto impacto e procedimentos tranquilos.</p>
      </div>

      <div class="treatments-grid">
        ${treatments.map(t => `
          <div class="treatment-card">
            <img src="${t.image}" alt="${t.title}" class="treatment-img" loading="lazy">
            <div class="treatment-body">
              <div>
                <span class="treatment-tag">${t.tag}</span>
                <h3 class="treatment-title font-heading">${t.title}</h3>
                <p class="treatment-desc">${t.desc}</p>
              </div>
              <a href="https://wa.me/${ctx.phoneClean}?text=${encodeURIComponent(`Olá! Gostaria de agendar uma avaliação para ${t.title} na ${ctx.bname} em ${ctx.city}.`)}" target="_blank" class="treatment-link">
                <span>Tirar dúvidas no WhatsApp</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Doctors Section -->
  <section class="section-doctors">
    <div class="container">
      <div class="section-head">
        <span class="section-pill">Corpo Clínico</span>
        <h2 class="section-title font-heading">Especialistas Dedicados à Sua Saúde</h2>
        <p class="section-desc">Profissionais com título de especialista, formação continuada e registro ativo no Conselho Regional.</p>
      </div>

      <div class="doctors-grid">
        ${doctors.map(d => `
          <div class="doctor-profile-card">
            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80" alt="${d.name}" class="doc-avatar-large">
            <div>
              <div class="doc-name font-heading">${d.name}</div>
              <div class="doc-role">${d.role}</div>
              <div class="doc-cro">${d.cro} &bull; ${d.exp}</div>
              <div style="color: var(--yellow); font-size: 13px; font-weight: 700;">${d.rating}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Parcelamento / Facilidade Banner -->
      <div class="banner-facilidades">
        <div>
          <h3 class="font-heading">Tratamentos com Parcelamento em até 24x</h3>
          <p>Condições facilitadas no cartão e boleto para você cuidar da sua saúde sem adiar seus planos.</p>
        </div>
        <a href="${ctx.waLink}" target="_blank" class="btn btn-wa" style="background: #FFFFFF; color: var(--wine);">
          ${ICONS.whatsapp}
          <span>Conversar com a Recepção</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <div>
        <div style="font-weight: 800; color: var(--wine-dark); font-size: 16px; margin-bottom: 4px;">${ctx.bname} &bull; Clínica Odontológica</div>
        <div>${ctx.address} &bull; ${ctx.city}</div>
      </div>
      <div>
        <a href="${ctx.waLink}" target="_blank" style="color: var(--wine); text-decoration: none; font-weight: 700;">
          Agendar Consulta no WhatsApp &rarr;
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

