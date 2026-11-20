import { assets, icons } from './assets.js';
import { procedures } from './components.js';

function procedureOptions(): string {
  return procedures.map(p => `<option value="${p}">${p}</option>`).join('\n              ');
}

// -------------------------------------------------------------
// M01: HEADER & HERO (MOBILE)
// -------------------------------------------------------------
export function getSection01Mobile(): string {
  return `
  <!-- Topbar Mobile -->
  <div class="m-topbar">
    <span>R. AntÃ´nio Bernardino Muniz, 155 â€¢ Centro, Contagem</span>
  </div>

  <!-- Navbar Mobile -->
  <header class="m-navbar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <img src="${assets.logoIcon}" alt="DS Odontologia" style="height: 38px; width: 38px; object-fit: contain;">
      <img src="${assets.logoHorizontal}" alt="Odontologia Betim Contagem" style="height: 24px; object-fit: contain;">
    </div>
    <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20agendar%20uma%20avaliaÃ§Ã£o%20na%20DS%20Odontologia." target="_blank" class="btn btn-whatsapp" style="padding: 8px 14px; font-size: 13px;">
      ${icons.whatsapp}
      <span>Agendar</span>
    </a>
  </header>

  <!-- Hero Mobile -->
  <section class="m-hero">
    <div class="badge-tag badge-dark" style="margin-bottom: 14px; font-size: 11px;">
      <span style="color: #008C95;">â€¢</span> Centro de Contagem
    </div>

    <h1 class="m-hero-title">
      O seu sorriso merece o mais alto padrÃ£o odontolÃ³gico
    </h1>

    <p class="m-hero-subtitle">
      Atendimento humanizado, equipamentos de ponta e tratamentos em todas as especialidades no Centro de Contagem.
    </p>

    <!-- Selector Dropdown Mobile -->
    <div class="m-selector-card">
      <div class="m-selector-title">Qual procedimento vocÃª procura?</div>
      <div class="m-selector-sub">Selecione e veja os horÃ¡rios disponÃ­veis:</div>
      <form onsubmit="event.preventDefault(); window.open('https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20' + encodeURIComponent(document.getElementById('mProc').value), '_blank');">
        <select id="mProc" class="form-select" style="font-size: 14px; padding: 12px; margin-bottom: 10px;" required>
          <option value="" disabled selected>Selecione o procedimento</option>
          ${procedureOptions()}
        </select>
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">
          <span>Ver HorÃ¡rios DisponÃ­veis</span>
          ${icons.arrowRight}
        </button>
      </form>
    </div>

    <!-- Quick Stats Mobile -->
    <div class="m-stats-grid">
      <div class="m-stat-box">
        <div class="m-stat-num">+12 Anos</div>
        <div class="m-stat-lbl">TradiÃ§Ã£o ClÃ­nica</div>
      </div>
      <div class="m-stat-box">
        <div class="m-stat-num">+25 Mil</div>
        <div class="m-stat-lbl">Pacientes Atendidos</div>
      </div>
      <div class="m-stat-box">
        <div class="m-stat-num">17</div>
        <div class="m-stat-lbl">Especialidades</div>
      </div>
      <div class="m-stat-box">
        <div class="m-stat-num" style="display: flex; align-items: center; gap: 4px;">
          <span>4.1</span>
          <span style="color: #F59E0B; display: inline-flex;">${icons.star}</span>
        </div>
        <div class="m-stat-lbl">Google AvaliaÃ§Ãµes</div>
      </div>
    </div>
  </section>

  <!-- Quick Info Bar Mobile -->
  <div class="mobile-container">
    <div class="m-quick-bar">
      <div class="m-quick-item">
        <div class="m-quick-icon">${icons.phone}</div>
        <div>
          <div style="font-size: 11px; color: var(--text-light); font-weight: 600;">TELEFONE DIRETO</div>
          <div style="font-weight: 700; color: var(--text);">(31) 3398-2000</div>
        </div>
      </div>
      <div class="m-quick-item">
        <div class="m-quick-icon">${icons.clock}</div>
        <div>
          <div style="font-size: 11px; color: var(--text-light); font-weight: 600;">HORÃRIO</div>
          <div style="font-weight: 700; color: var(--text);">Seg a Sex: 08hâ€“19h â€¢ SÃ¡b: 08hâ€“13h</div>
        </div>
      </div>
      <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20agendar%20uma%20avaliaÃ§Ã£o." target="_blank" class="btn btn-whatsapp" style="width: 100%; padding: 12px; margin-top: 4px;">
        ${icons.whatsapp}
        <span>Falar no WhatsApp</span>
      </a>
    </div>
  </div>
  `;
}

// -------------------------------------------------------------
// M02: PROCEDIMENTOS & ESPECIALIDADES (MOBILE)
// -------------------------------------------------------------
export function getSection02Mobile(): string {
  return `
  <section class="m-section" style="background: var(--bg-light);">
    <div class="m-section-header">
      <span class="badge-tag badge-primary" style="font-size: 11px;">Especialidades</span>
      <h2>Tratamentos Completos</h2>
      <p>Cuidados integrados com tecnologia e conforto para todas as idades.</p>
    </div>

    <!-- Cards Mobile -->
    <div class="m-proc-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--primary);">${icons.tooth}</span>
        <span class="proc-tag">ReabilitaÃ§Ã£o</span>
      </div>
      <h3 class="m-proc-title">Implantes & PrÃ³tese Protocolo</h3>
      <p class="m-proc-desc">Recupere a mastigaÃ§Ã£o firme e a seguranÃ§a ao sorrir com implantes guiados e prÃ³teses fixas.</p>
      <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Implantes." target="_blank" class="proc-link flex-row">
        <span>Saber mais no WhatsApp</span>
        ${icons.arrowRight}
      </a>
    </div>

    <div class="m-proc-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--accent-dark);">${icons.sparkle}</span>
        <span class="proc-tag" style="background: var(--accent-soft); color: var(--accent-dark);">Ortodontia</span>
      </div>
      <h3 class="m-proc-title">Invisalign & Alinhadores</h3>
      <p class="m-proc-desc">Alinhe seus dentes sem fios metÃ¡licos, com discriÃ§Ã£o e simulaÃ§Ã£o digital do resultado final.</p>
      <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Invisalign." target="_blank" class="proc-link flex-row">
        <span>Saber mais no WhatsApp</span>
        ${icons.arrowRight}
      </a>
    </div>

    <div class="m-proc-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--primary);">${icons.award}</span>
        <span class="proc-tag">EstÃ©tica</span>
      </div>
      <h3 class="m-proc-title">Facetas & Lentes de Contato</h3>
      <p class="m-proc-desc">Harmonia e brilho ideal para corrigir manchas e formatos com cerÃ¢micas ultrafinas resistentes.</p>
      <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Facetas." target="_blank" class="proc-link flex-row">
        <span>Saber mais no WhatsApp</span>
        ${icons.arrowRight}
      </a>
    </div>

    <div class="m-proc-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--primary);">${icons.shield}</span>
        <span class="proc-tag">Endodontia</span>
      </div>
      <h3 class="m-proc-title">Tratamento de Canal sem Dor</h3>
      <p class="m-proc-desc">AlÃ­vio imediato da dor e preservaÃ§Ã£o do dente natural com tecnologia rotatÃ³ria computadorizada.</p>
      <a href="https://wa.me/5531985579266?text=OlÃ¡,%20preciso%20de%20avaliaÃ§Ã£o%20para%20Canal." target="_blank" class="proc-link flex-row">
        <span>Saber mais no WhatsApp</span>
        ${icons.arrowRight}
      </a>
    </div>
  </section>
  `;
}

// -------------------------------------------------------------
// M03: SOBRE A CLÃNICA & INFRAESTRUTURA (MOBILE)
// -------------------------------------------------------------
export function getSection03Mobile(): string {
  return `
  <section class="m-section" style="background: #FFFFFF; border-top: 1px solid var(--border);">
    <div class="m-section-header">
      <span class="badge-tag badge-primary" style="font-size: 11px;">Compromisso</span>
      <h2>A DS Odontologia</h2>
      <p>Estrutura moderna no coraÃ§Ã£o de Contagem</p>
    </div>

    <img src="${assets.dentista2}" alt="ConsultÃ³rio DS Odontologia" class="m-about-img">

    <p style="font-size: 13.5px; line-height: 1.6; color: var(--text-muted); margin-bottom: 16px;">
      A DS Odontologia Ã© uma clÃ­nica odontolÃ³gica dedicada a oferecer atendimento de excelÃªncia em um ambiente acolhedor e moderno. Contamos com uma equipe qualificada para cuidar da saÃºde e da estÃ©tica do seu sorriso, oferecendo tratamentos em todas as especialidades com seguranÃ§a e conforto.
    </p>

    <!-- Indicadores Mobile -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
      <div style="border-left: 3px solid var(--primary); padding-left: 10px;">
        <div style="font-size: 24px; font-weight: 800; color: var(--primary);">98%</div>
        <div style="font-size: 11px; color: var(--text-muted);">AprovaÃ§Ã£o dos pacientes</div>
      </div>
      <div style="border-left: 3px solid var(--accent-dark); padding-left: 10px;">
        <div style="font-size: 24px; font-weight: 800; color: var(--accent-dark);">100%</div>
        <div style="font-size: 11px; color: var(--text-muted);">BiosseguranÃ§a hospitalar</div>
      </div>
    </div>

    <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20agendar%20uma%20visita%20Ã %20clÃ­nica." target="_blank" class="btn btn-primary" style="width: 100%; padding: 12px;">
      <span>Agendar AvaliaÃ§Ã£o sem Julgamento</span>
      ${icons.arrowRight}
    </a>
  </section>
  `;
}

// -------------------------------------------------------------
// M04: RESULTADOS REAIS & AVALIAÃ‡Ã•ES GOOGLE (MOBILE)
// -------------------------------------------------------------
export function getSection04Mobile(): string {
  return `
  <section class="m-section" style="background: var(--bg-light);">
    <div class="m-section-header">
      <span class="badge-tag badge-accent" style="font-size: 11px;">Casos Reais</span>
      <h2>Resultados & Depoimentos</h2>
      <p>TransformaÃ§Ãµes reais e avaliaÃ§Ãµes no Google 4.1â˜…</p>
    </div>

    <!-- Casos Mobile -->
    <div class="m-case-card">
      <img src="${assets.antesDepois}" alt="Caso ClÃ­nico" class="m-case-img">
      <div class="m-case-info">
        <div style="font-weight: 700; font-size: 14.5px; color: var(--text);">ReabilitaÃ§Ã£o & EstÃ©tica</div>
        <div style="font-size: 12px; color: var(--text-muted);">Harmonia do sorriso com facetas e clareamento</div>
      </div>
    </div>

    <div class="m-case-card">
      <img src="${assets.sorrisoTransformacao}" alt="Caso ClÃ­nico" class="m-case-img">
      <div class="m-case-info">
        <div style="font-weight: 700; font-size: 14.5px; color: var(--text);">Sorriso Renovado</div>
        <div style="font-size: 12px; color: var(--text-muted);">Alinhamento dental e autoestima devolvida</div>
      </div>
    </div>

    <p style="font-size: 11px; color: var(--text-light); text-align: center; margin: 12px 0 24px 0; line-height: 1.4;">
      * Imagens ilustrativas de casos autorizados conforme normas do CFO. Resultados dependem de avaliaÃ§Ã£o biolÃ³gica individual.
    </p>

    <!-- Depoimentos Google Mobile -->
    <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 16px;">
      <span style="font-weight: 800; color: #4285F4; font-size: 18px;">G</span>
      <div style="display: flex; gap: 2px;">${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}</div>
      <span style="font-weight: 700; font-size: 14px;">4.1 no Google</span>
    </div>

    <div class="m-review-card">
      <div style="display: flex; gap: 2px; margin-bottom: 8px;">${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}</div>
      <p style="font-size: 12.5px; line-height: 1.55; color: var(--text); margin-bottom: 10px;">
        "Atendimento impecÃ¡vel! Eu tinha muito receio de dentista por traumas antigos, mas fui acolhida com paciÃªncia sem igual. Fiz canal sem dor. Equipe nota 10!"
      </p>
      <div style="font-size: 12px; font-weight: 700; color: var(--text);">Mariana GuimarÃ£es â€¢ Contagem</div>
    </div>

    <div class="m-review-card">
      <div style="display: flex; gap: 2px; margin-bottom: 8px;">${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}</div>
      <p style="font-size: 12.5px; line-height: 1.55; color: var(--text); margin-bottom: 10px;">
        "Fiz meus implantes na clÃ­nica e hoje posso mastigar com total confianÃ§a. Dentistas pontuais, atenciosos e ambiente acolhedor. Recomendo de olhos fechados."
      </p>
      <div style="font-size: 12px; font-weight: 700; color: var(--text);">Carlos E. MendonÃ§a â€¢ Centro</div>
    </div>
  </section>
  `;
}

// -------------------------------------------------------------
// M05: LOCALIZAÃ‡ÃƒO, AGENDAMENTO & FOOTER (MOBILE)
// -------------------------------------------------------------
export function getSection05Mobile(): string {
  return `
  <section class="m-section" style="background: #FFFFFF; border-top: 1px solid var(--border);">
    <div class="m-section-header">
      <span class="badge-tag badge-primary" style="font-size: 11px;">FAQ & Agendamento</span>
      <h2>DÃºvidas & Contato</h2>
      <p>Agende sua consulta com conforto e rapidez.</p>
    </div>

    <!-- FAQ Mobile -->
    <details class="m-faq-item" open>
      <summary class="m-faq-q">
        <span>Aceitam convÃªnios?</span>
        <span>${icons.chevronDown}</span>
      </summary>
      <div class="m-faq-a">
        Atendemos de forma particular com recibo detalhado para vocÃª solicitar reembolso junto ao seu plano, com condiÃ§Ãµes facilitadas de pagamento.
      </div>
    </details>

    <details class="m-faq-item">
      <summary class="m-faq-q">
        <span>O tratamento de canal ou implante dÃ³i?</span>
        <span>${icons.chevronDown}</span>
      </summary>
      <div class="m-faq-a">
        NÃ£o! Utilizamos anestÃ©sicos modernos de aÃ§Ã£o rÃ¡pida e tÃ©cnicas minimamente invasivas para garantir atendimento confortÃ¡vel e sem dor.
      </div>
    </details>

    <details class="m-faq-item">
      <summary class="m-faq-q">
        <span>Quais as formas de pagamento?</span>
        <span>${icons.chevronDown}</span>
      </summary>
      <div class="m-faq-a">
        Parcelamento em atÃ© 12x no cartÃ£o de crÃ©dito, desconto especial no Pix e condiÃ§Ãµes personalizadas para cada plano.
      </div>
    </details>

    <!-- Card de Contato & LocalizaÃ§Ã£o Mobile -->
    <div class="m-contact-box" style="margin-top: 24px;">
      <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text);">Onde Estamos</h3>
      <div style="display: flex; gap: 8px; margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
        <span style="color: var(--primary);">${icons.pin}</span>
        <span>R. AntÃ´nio Bernardino Muniz, 155 - Centro, Contagem - MG</span>
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 18px; font-size: 13px; color: var(--text-muted);">
        <span style="color: var(--primary);">${icons.clock}</span>
        <span>Seg a Sex: 08hâ€“19h â€¢ SÃ¡b: 08hâ€“13h</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <a href="https://www.google.com/search?sca_esv=66da6a07b5b0afbb&biw=1745&bih=835&sxsrf=AKL5yDhToktXEkgu614aXLbwAhrNlN3dnQ:1793892176813&q=ds+odontologia+endere%C3%A7o&ludocid=5076174533163314977&sa=X&ved=2ahUKEwjo8dqPkfGXAxVPr5UCHfzHAm0Q6BN6BAg7EAI" target="_blank" class="btn btn-outline" style="width: 100%; padding: 11px;">
          ${icons.pin}
          <span>Abrir no Google Maps</span>
        </a>
        <a href="tel:3133982000" class="btn btn-primary" style="width: 100%; padding: 11px;">
          ${icons.phone}
          <span>Ligar (31) 3398-2000</span>
        </a>
      </div>
    </div>

    <!-- Footer Mobile -->
    <footer class="m-footer">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <img src="${assets.logoIcon}" alt="DS Odontologia" style="height: 36px; width: 36px; object-fit: contain; background: #FFFFFF; border-radius: 8px; padding: 2px;">
        <img src="${assets.logoHorizontal}" alt="Odontologia Betim Contagem" style="height: 24px; object-fit: contain; filter: brightness(0) invert(1);">
      </div>
      <p style="font-size: 12px; line-height: 1.5; color: #C9B8DD; margin-bottom: 14px;">
        DS Odontologia: excelÃªncia e atendimento humanizado em Contagem - MG.
      </p>
      <div style="font-size: 11.5px; color: #A895BF; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
        Â© 2026 DS Odontologia. Todos os direitos reservados.
      </div>
    </footer>
  </section>
  `;
}

// -------------------------------------------------------------
// MOBILE COMPLETO (COM STICKY ACTION BAR FIXA OBRIGATÃ“RIA)
// -------------------------------------------------------------
export function getMobileFull(): string {
  return `
  <div class="mobile-full-wrapper" style="padding-bottom: 74px;">
    ${getSection01Mobile()}
    ${getSection02Mobile()}
    ${getSection03Mobile()}
    ${getSection04Mobile()}
    ${getSection05Mobile()}
  </div>

  <!-- Sticky Action Bar Inferior Fixa (Regras 3 e 5 do GEMINI.md) -->
  <div class="mobile-sticky-bar">
    <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20agendar%20uma%20avaliaÃ§Ã£o%20na%20DS%20Odontologia." target="_blank" class="sticky-btn-wpp">
      ${icons.whatsapp}
      <span>Agendar no WhatsApp</span>
    </a>
    <a href="tel:3133982000" class="sticky-btn-call">
      ${icons.phone}
      <span>Ligar Agora</span>
    </a>
  </div>
  `;
}

