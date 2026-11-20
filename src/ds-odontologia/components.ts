import { assets, icons } from './assets.js';
import { sharedCss, commonHead } from './styles.js';

export const procedures: string[] = [
  "Implante DentÃ¡rio",
  "Invisalign / Alinhadores",
  "Aparelho OrtodÃ´ntico",
  "Clareamento Dental",
  "Facetas / Lentes de Contato",
  "Consulta Geral",
  "Tratamento de Canal",
  "PrÃ³tese DentÃ¡ria",
  "HarmonizaÃ§Ã£o Orofacial",
  "Tratamento Periodontal",
  "Odontopediatria (Infantil)",
  "EmergÃªncia DentÃ¡ria 24h",
  "ExtraÃ§Ã£o de Siso",
  "Limpeza Dental",
  "PrÃ³tese Protocolo",
  "Bruxismo e DTM",
  "Radiografia OdontolÃ³gica"
];

function procedureOptions(): string {
  return procedures.map(p => `<option value="${p}">${p}</option>`).join('\n              ');
}

export function renderFullHtml(bodyContent: string, customCss: string = '', isMobile: boolean = false): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${commonHead}
  <title>DS Odontologia | ClÃ­nica OdontolÃ³gica em Contagem - MG</title>
  <style>
    ${sharedCss}
    ${customCss}
  </style>
</head>
<body class="${isMobile ? 'mobile-viewport' : 'desktop-viewport'}">
  ${bodyContent}
</body>
</html>`;
}

// -------------------------------------------------------------
// SECTION 01: HEADER & HERO (DESKTOP)
// -------------------------------------------------------------
export function getSection01Desktop(): string {
  return `
  <!-- Topbar -->
  <div class="topbar">
    <div class="section-container flex-row" style="justify-content: space-between; font-size: 13px; color: #EDE5F5;">
      <div class="flex-row" style="gap: 8px;">
        <span style="color: #008C95;">${icons.pin}</span>
        <span>R. AntÃ´nio Bernardino Muniz, 155 - Centro, Contagem - MG</span>
      </div>
      <div class="flex-row" style="gap: 20px;">
        <div class="flex-row" style="gap: 6px;">
          <span style="color: #008C95;">${icons.clock}</span>
          <span>Seg a Sex: 08h Ã s 19h â€¢ SÃ¡b: 08h Ã s 13h</span>
        </div>
        <div class="flex-row" style="gap: 6px;">
          <span style="color: #25D366;">${icons.whatsapp}</span>
          <span style="font-weight: 600;">(31) 98557-9266</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Navbar -->
  <header class="navbar">
    <div class="section-container flex-row" style="justify-content: space-between; height: 80px;">
      <a href="#hero" class="nav-brand flex-row" style="gap: 12px; align-items: center; text-decoration: none;">
        <img src="${assets.logoIcon}" alt="DS Odontologia" style="height: 52px; width: 52px; object-fit: contain;">
        <img src="${assets.logoHorizontal}" alt="Odontologia Betim Contagem" style="height: 38px; object-fit: contain;">
      </a>
      <nav class="nav-links flex-row" style="gap: 28px; font-size: 15px; font-weight: 500; color: var(--text);">
        <a href="#procedimentos" class="nav-link">Especialidades</a>
        <a href="#sobre" class="nav-link">A ClÃ­nica</a>
        <a href="#resultados" class="nav-link">Antes & Depois</a>
        <a href="#avaliacoes" class="nav-link">Depoimentos</a>
        <a href="#duvidas" class="nav-link">DÃºvidas</a>
        <a href="#contato" class="nav-link">Onde Estamos</a>
      </nav>
      <div class="nav-cta">
        <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20agendar%20uma%20avaliaÃ§Ã£o%20na%20DS%20Odontologia." target="_blank" class="btn btn-whatsapp">
          ${icons.whatsapp}
          <span>Agendar Consulta</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="hero-section">
    <div class="section-container hero-grid">
      <!-- Coluna da Esquerda (Copy & Dropdown interativo) -->
      <div class="hero-content">
        <div class="badge-tag badge-dark" style="margin-bottom: 20px;">
          <span style="color: #008C95; font-size: 16px;">â€¢</span>
          <span>ClÃ­nica OdontolÃ³gica no Centro de Contagem</span>
        </div>

        <h1 class="hero-title">
          O seu sorriso merece o mais alto padrÃ£o em saÃºde e estÃ©tica
        </h1>

        <p class="hero-subtitle">
          Atendimento humanizado, equipamentos de ponta e tratamentos em todas as especialidades odontolÃ³gicas com foco em conforto, Ã©tica e seguranÃ§a para toda a sua famÃ­lia.
        </p>

        <!-- Widget Interativo Dropdown (Fiel Ã  imagem 1) -->
        <div class="procedure-selector-card">
          <div class="selector-header">
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
              Qual procedimento vocÃª procura?
            </h3>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 0;">
              Selecione e veja os dentistas e horÃ¡rios disponÃ­veis na unidade:
            </p>
          </div>
          <form class="selector-form" onsubmit="event.preventDefault(); window.open('https://wa.me/5531985579266?text=OlÃ¡,%20tenho%20interesse%20no%20procedimento%20de%20' + encodeURIComponent(document.getElementById('heroSelectProc').value) + '%20na%20DS%20Odontologia.', '_blank');">
            <div class="select-wrapper">
              <select id="heroSelectProc" class="form-select" required>
                <option value="" disabled selected>Selecione o procedimento</option>
                ${procedureOptions()}
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-selector">
              <span>Ver HorÃ¡rios DisponÃ­veis</span>
              ${icons.arrowRight}
            </button>
          </form>
        </div>

        <!-- MÃ©tricas de ConfianÃ§a -->
        <div class="hero-stats flex-row" style="gap: 32px; margin-top: 32px;">
          <div class="stat-item">
            <div class="stat-number">+12 Anos</div>
            <div class="stat-label">TradiÃ§Ã£o ClÃ­nica</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">+25 Mil</div>
            <div class="stat-label">Sorrisos Atendidos</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">17</div>
            <div class="stat-label">Especialidades</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number flex-row" style="gap: 4px;">
              <span>4.1</span>
              <span style="color: #F59E0B; display: inline-flex;">${icons.star}</span>
            </div>
            <div class="stat-label">Nota no Google</div>
          </div>
        </div>
      </div>

      <!-- Coluna da Direita (Imagem e Cards Flutuantes) -->
      <div class="hero-visual">
        <div class="hero-image-wrapper">
          <img src="${assets.feedClinica}" alt="ConsultÃ³rio moderno DS Odontologia" class="hero-main-img">
          
          <!-- Floating Badge Topo -->
          <div class="hero-badge badge-top flex-row">
            <div class="badge-icon-box" style="background: rgba(0, 140, 149, 0.15); color: #008C95;">
              ${icons.shield}
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 700; color: #FFFFFF;">BiosseguranÃ§a 100%</div>
              <div style="font-size: 12px; color: #E0D4EC;">EsterilizaÃ§Ã£o em autoclave</div>
            </div>
          </div>

          <!-- Floating Badge Base -->
          <div class="hero-badge badge-bottom flex-row">
            <div class="badge-icon-box" style="background: rgba(245, 158, 11, 0.18); color: #F59E0B;">
              ${icons.award}
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 700; color: #FFFFFF;">Atendimento Humanizado</div>
              <div style="font-size: 12px; color: #E0D4EC;">Tratamentos sem dor e acolhedores</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Bar de Contatos (TransiÃ§Ã£o do Hero) -->
    <div class="section-container" style="margin-top: 48px;">
      <div class="quick-contact-bar flex-row">
        <div class="quick-bar-item flex-row">
          <div class="quick-icon-box">${icons.phone}</div>
          <div>
            <div class="quick-title">Ligue Direto</div>
            <div class="quick-value">(31) 3398-2000</div>
          </div>
        </div>
        <div class="quick-bar-divider"></div>
        <div class="quick-bar-item flex-row">
          <div class="quick-icon-box">${icons.clock}</div>
          <div>
            <div class="quick-title">HorÃ¡rio de Funcionamento</div>
            <div class="quick-value">Segâ€“Sex: 08:00â€“19:00 â€¢ SÃ¡b: 08:00â€“13:00</div>
          </div>
        </div>
        <div class="quick-bar-divider"></div>
        <div class="quick-bar-item flex-row">
          <div class="quick-icon-box">${icons.pin}</div>
          <div>
            <div class="quick-title">Centro de Contagem</div>
            <div class="quick-value">Rua AntÃ´nio Bernardino Muniz, 155</div>
          </div>
        </div>
        <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20tirar%20uma%20dÃºvida%20sobre%20atendimento%20na%20DS%20Odontologia." target="_blank" class="quick-wpp-btn" title="Chamar no WhatsApp" aria-label="Chamar no WhatsApp">
          ${icons.whatsapp}
        </a>
      </div>
    </div>
  </section>
  `;
}

// -------------------------------------------------------------
// SECTION 02: ESPECIALIDADES & PROCEDIMENTOS (DESKTOP)
// -------------------------------------------------------------
export function getSection02Desktop(): string {
  return `
  <section id="procedimentos" class="procedures-section">
    <div class="section-container">
      <div class="section-header">
        <div class="badge-tag badge-primary">Especialidades OdontolÃ³gicas</div>
        <h2>Tratamentos completos e personalizados para vocÃª</h2>
        <p>Da prevenÃ§Ã£o e alÃ­vio de dor Ã  reabilitaÃ§Ã£o estÃ©tica completa, oferecemos assistÃªncia multidisciplinar com tecnologia moderna e mÃ¡ximo conforto.</p>
      </div>

      <div class="procedures-grid">
        <!-- Card 1: Implantes & Protocolo -->
        <div class="proc-card">
          <div class="proc-card-header flex-row">
            <div class="proc-icon-box" style="color: var(--primary); background: var(--surface-soft);">
              ${icons.tooth}
            </div>
            <span class="proc-tag">ReabilitaÃ§Ã£o Oral</span>
          </div>
          <h3 class="proc-title">Implantes & PrÃ³tese Protocolo</h3>
          <p class="proc-desc">
            Recupere a mastigaÃ§Ã£o firme e a seguranÃ§a para sorrir. Implantes de alta precisÃ£o e prÃ³teses fixas tipo protocolo com conforto e estÃ©tica idÃªntica aos dentes naturais.
          </p>
          <ul class="proc-features">
            <li>${icons.check} <span>Cirurgias guiadas e sem dor</span></li>
            <li>${icons.check} <span>OpÃ§Ã£o de carga imediata sob avaliaÃ§Ã£o</span></li>
          </ul>
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Implantes%20e%20PrÃ³tese%20Protocolo." target="_blank" class="proc-link flex-row">
            <span>Saber mais no WhatsApp</span>
            ${icons.arrowRight}
          </a>
        </div>

        <!-- Card 2: Invisalign & Alinhadores -->
        <div class="proc-card">
          <div class="proc-card-header flex-row">
            <div class="proc-icon-box" style="color: var(--accent-dark); background: var(--accent-soft);">
              ${icons.sparkle}
            </div>
            <span class="proc-tag" style="background: var(--accent-soft); color: var(--accent-dark); border-color: rgba(0,140,149,0.2);">Ortodontia Moderna</span>
          </div>
          <h3 class="proc-title">Invisalign & Alinhadores InvisÃ­veis</h3>
          <p class="proc-desc">
            Alinhe seus dentes com placas transparentes e confortÃ¡veis, sem braquetes ou fios metÃ¡licos. Veja a simulaÃ§Ã£o 3D do seu sorriso final antes de iniciar.
          </p>
          <ul class="proc-features">
            <li>${icons.check} <span>RemovÃ­vel para refeiÃ§Ãµes e escovaÃ§Ã£o</span></li>
            <li>${icons.check} <span>Tratamento mais discreto e higiÃªnico</span></li>
          </ul>
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Invisalign%20e%20Alinhadores." target="_blank" class="proc-link flex-row">
            <span>Saber mais no WhatsApp</span>
            ${icons.arrowRight}
          </a>
        </div>

        <!-- Card 3: Facetas & Lentes -->
        <div class="proc-card">
          <div class="proc-card-header flex-row">
            <div class="proc-icon-box" style="color: var(--primary); background: var(--surface-soft);">
              ${icons.award}
            </div>
            <span class="proc-tag">EstÃ©tica do Sorriso</span>
          </div>
          <h3 class="proc-title">Facetas & Lentes em Porcelana</h3>
          <p class="proc-desc">
            Harmonia, brilho e proporÃ§Ã£o perfeita. CorreÃ§Ã£o de diastemas, manchas resistentes e desgastes dentais com cerÃ¢micas ultrafinas de altÃ­ssima durabilidade.
          </p>
          <ul class="proc-features">
            <li>${icons.check} <span>Planejamento estÃ©tico personalizado</span></li>
            <li>${icons.check} <span>PreservaÃ§Ã£o do esmalte dentÃ¡rio</span></li>
          </ul>
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Facetas%20e%20Lentes%20de%20Contato." target="_blank" class="proc-link flex-row">
            <span>Saber mais no WhatsApp</span>
            ${icons.arrowRight}
          </a>
        </div>

        <!-- Card 4: Clareamento Dental -->
        <div class="proc-card">
          <div class="proc-card-header flex-row">
            <div class="proc-icon-box" style="color: var(--accent-dark); background: var(--accent-soft);">
              ${icons.sparkle}
            </div>
            <span class="proc-tag" style="background: var(--accent-soft); color: var(--accent-dark); border-color: rgba(0,140,149,0.2);">Clareamento Seguro</span>
          </div>
          <h3 class="proc-title">Clareamento a Laser & Caseiro</h3>
          <p class="proc-desc">
            Dentes visivelmente mais brancos com protocolos combinados de consultÃ³rio e moldeiras, formulados com agentes dessensibilizantes de Ãºltima geraÃ§Ã£o.
          </p>
          <ul class="proc-features">
            <li>${icons.check} <span>Resultados rÃ¡pidos desde a 1Âª sessÃ£o</span></li>
            <li>${icons.check} <span>Zero sensibilidade com fÃ³rmula moderna</span></li>
          </ul>
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20Clareamento%20Dental." target="_blank" class="proc-link flex-row">
            <span>Saber mais no WhatsApp</span>
            ${icons.arrowRight}
          </a>
        </div>

        <!-- Card 5: Tratamento de Canal -->
        <div class="proc-card">
          <div class="proc-card-header flex-row">
            <div class="proc-icon-box" style="color: var(--primary); background: var(--surface-soft);">
              ${icons.shield}
            </div>
            <span class="proc-tag">Endodontia sem Dor</span>
          </div>
          <h3 class="proc-title">Tratamento de Canal em SessÃ£o Ãšnica</h3>
          <p class="proc-desc">
            AlÃ­vio rÃ¡pido da dor e preservaÃ§Ã£o do seu dente natural. Sistema rotatÃ³rio computadorizado que reduz consultas e assegura um procedimento totalmente indolor.
          </p>
          <ul class="proc-features">
            <li>${icons.check} <span>Anestesia computadorizada precisa</span></li>
            <li>${icons.check} <span>Preserva o elemento dental com seguranÃ§a</span></li>
          </ul>
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20preciso%20de%20avaliaÃ§Ã£o%20para%20Tratamento%20de%20Canal." target="_blank" class="proc-link flex-row">
            <span>Saber mais no WhatsApp</span>
            ${icons.arrowRight}
          </a>
        </div>

        <!-- Card 6: HarmonizaÃ§Ã£o & DTM -->
        <div class="proc-card">
          <div class="proc-card-header flex-row">
            <div class="proc-icon-box" style="color: var(--accent-dark); background: var(--accent-soft);">
              ${icons.heartHandshake}
            </div>
            <span class="proc-tag" style="background: var(--accent-soft); color: var(--accent-dark); border-color: rgba(0,140,149,0.2);">EquilÃ­brio & Conforto</span>
          </div>
          <h3 class="proc-title">HarmonizaÃ§Ã£o Orofacial & Bruxismo</h3>
          <p class="proc-desc">
            AplicaÃ§Ã£o terapÃªutica e estÃ©tica de toxina botulÃ­nica para alÃ­vio do bruxismo, dores na mandÃ­bula e cefaleias tensionais, alÃ©m do contorno labial harmÃ´nico.
          </p>
          <ul class="proc-features">
            <li>${icons.check} <span>AlÃ­vio imediato da tensÃ£o mandibular</span></li>
            <li>${icons.check} <span>Realce sutil e natural das linhas do rosto</span></li>
          </ul>
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20informaÃ§Ãµes%20sobre%20HarmonizaÃ§Ã£o%20e%20Tratamento%20de%20Bruxismo." target="_blank" class="proc-link flex-row">
            <span>Saber mais no WhatsApp</span>
            ${icons.arrowRight}
          </a>
        </div>
      </div>
    </div>
  </section>
  `;
}

// -------------------------------------------------------------
// SECTION 03: SOBRE A CLÃNICA & INFRAESTRUTURA (DESKTOP)
// -------------------------------------------------------------
export function getSection03Desktop(): string {
  return `
  <section id="sobre" class="about-section">
    <div class="section-container about-grid">
      <!-- Imagem & Grid Visual -->
      <div class="about-visual">
        <div class="about-img-box">
          <img src="${assets.dentista2}" alt="Atendimento odontolÃ³gico humanizado" class="about-main-img">
          <div class="about-badge-card flex-row">
            <div class="about-badge-icon">${icons.microscope}</div>
            <div>
              <div style="font-weight: 700; font-size: 14px; color: var(--text);">Tecnologia DiagnÃ³stica</div>
              <div style="font-size: 12px; color: var(--text-muted);">Radiografia digital e precisÃ£o clÃ­nica</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ConteÃºdo Descritivo -->
      <div class="about-content">
        <div class="badge-tag badge-primary" style="margin-bottom: 16px;">Compromisso com VocÃª</div>
        <h2 style="font-size: 32px; margin-bottom: 18px; color: var(--text);">
          Odontologia moderna com atendimento humanizado em Contagem
        </h2>
        <p style="font-size: 15.5px; line-height: 1.65; color: var(--text-muted); margin-bottom: 24px;">
          A DS Odontologia Ã© uma clÃ­nica odontolÃ³gica dedicada a oferecer atendimento de excelÃªncia em um ambiente acolhedor e moderno. Contamos com uma equipe qualificada para cuidar da saÃºde e da estÃ©tica do seu sorriso, oferecendo tratamentos em todas as especialidades odontolÃ³gicas, com foco na qualidade, seguranÃ§a e bem-estar dos pacientes.
        </p>
        <p style="font-size: 15.5px; line-height: 1.65; color: var(--text-muted); margin-bottom: 32px;">
          Nosso compromisso Ã© proporcionar um atendimento humanizado, utilizando tecnologia e tÃ©cnicas atualizadas para garantir resultados eficientes e personalizados. Atendemos pacientes de todas as idades, sempre com Ã©tica, transparÃªncia e dedicaÃ§Ã£o em cada etapa do tratamento.
        </p>

        <!-- Indicadores de Qualidade -->
        <div class="about-metrics flex-row" style="gap: 28px; margin-bottom: 32px;">
          <div class="metric-box">
            <div class="metric-val" style="color: var(--primary);">98%</div>
            <div class="metric-label">Ãndice de aprovaÃ§Ã£o de pacientes</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color: var(--accent-dark);">100%</div>
            <div class="metric-label">BiosseguranÃ§a e esterilizaÃ§Ã£o certificada</div>
          </div>
        </div>

        <div class="about-cta">
          <a href="https://wa.me/5531985579266?text=OlÃ¡,%20gostaria%20de%20conhecer%20a%20clÃ­nica%20DS%20Odontologia%20e%20agendar%20uma%20visita." target="_blank" class="btn btn-primary">
            <span>Conhecer a ClÃ­nica e Agendar</span>
            ${icons.arrowRight}
          </a>
        </div>
      </div>
    </div>
  </section>
  `;
}

// -------------------------------------------------------------
// SECTION 04: RESULTADOS REAIS & AVALIAÃ‡Ã•ES GOOGLE (DESKTOP)
// -------------------------------------------------------------
export function getSection04Desktop(): string {
  return `
  <section id="resultados" class="results-section">
    <div class="section-container">
      <!-- Bloco de Resultados Reais -->
      <div class="section-header">
        <div class="badge-tag badge-accent">TransformaÃ§Ãµes Reais</div>
        <h2>Resultados que devolvem a confianÃ§a ao sorrir</h2>
        <p>Acompanhe casos reais de reabilitaÃ§Ã£o e estÃ©tica odontolÃ³gica conduzidos pelo corpo clÃ­nico da DS Odontologia.</p>
      </div>

      <div class="cases-grid">
        <div class="case-card">
          <div class="case-img-box">
            <img src="${assets.antesDepois}" alt="Caso ClÃ­nico - TransformaÃ§Ã£o do Sorriso" class="case-img">
            <span class="case-badge">Caso ClÃ­nico Real</span>
          </div>
          <div class="case-body">
            <h4 style="font-size: 16px; margin-bottom: 6px; color: var(--text);">ReabilitaÃ§Ã£o EstÃ©tica & Alinhamento</h4>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 0;">CorreÃ§Ã£o de proporÃ§Ã£o e clareamento para harmonia facial completa.</p>
          </div>
        </div>

        <div class="case-card">
          <div class="case-img-box">
            <img src="${assets.sorrisoTransformacao}" alt="Caso ClÃ­nico - Facetas em Porcelana" class="case-img">
            <span class="case-badge">EstÃ©tica Dental</span>
          </div>
          <div class="case-body">
            <h4 style="font-size: 16px; margin-bottom: 6px; color: var(--text);">Facetas Ultrafinas & Sorriso Iluminado</h4>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 0;">PreservaÃ§Ã£o mÃ¡xima da estrutura com acabamento natural e duradouro.</p>
          </div>
        </div>

        <div class="case-card">
          <div class="case-img-box">
            <img src="${assets.implanteCarrossel}" alt="Caso ClÃ­nico - Implantes e PrÃ³tese" class="case-img">
            <span class="case-badge">ReabilitaÃ§Ã£o Oral</span>
          </div>
          <div class="case-body">
            <h4 style="font-size: 16px; margin-bottom: 6px; color: var(--text);">Implantes DentÃ¡rios & SeguranÃ§a MastigatÃ³ria</h4>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 0;">RecuperaÃ§Ã£o da funÃ§Ã£o com prÃ³teses fixas biocompatÃ­veis.</p>
          </div>
        </div>
      </div>

      <p class="cfo-disclaimer">
        * Nota Ã©tica: Imagens autorizadas com finalidade ilustrativa e informativa, em estrito cumprimento Ã s resoluÃ§Ãµes do Conselho Federal de Odontologia (CFO). Os resultados variam de acordo com as caracterÃ­sticas biolÃ³gicas e o diagnÃ³stico clÃ­nico individual de cada paciente.
      </p>

      <!-- Bloco de AvaliaÃ§Ãµes Google 4.1â˜… -->
      <div id="avaliacoes" class="reviews-wrapper" style="margin-top: 64px;">
        <div class="google-badge-header flex-row" style="justify-content: center; gap: 12px; margin-bottom: 36px;">
          <div class="google-icon" style="font-weight: 800; font-size: 22px; color: #4285F4;">G</div>
          <div>
            <div class="flex-row" style="gap: 4px;">
              ${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}
              <span style="font-weight: 700; font-size: 16px; color: var(--text); margin-left: 6px;">4.1 / 5.0</span>
            </div>
            <div style="font-size: 13px; color: var(--text-muted);">Mais de 20 avaliaÃ§Ãµes verificadas de pacientes no Google</div>
          </div>
        </div>

        <div class="reviews-grid">
          <div class="review-card">
            <div class="flex-row" style="gap: 4px; margin-bottom: 12px;">
              ${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}
            </div>
            <p class="review-text">
              "Atendimento impecÃ¡vel! Eu tinha muito receio de dentista por traumas de infÃ¢ncia, mas na DS Odontologia fui acolhida com uma paciÃªncia sem igual. Fiz canal e clareamento sem dor. ConsultÃ³rio limpo, cheiroso e equipe nota 10!"
            </p>
            <div class="review-author flex-row" style="gap: 12px; margin-top: 16px;">
              <div class="author-avatar" style="background: var(--surface-soft); color: var(--primary);">MG</div>
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text);">Mariana GuimarÃ£es</div>
                <div style="font-size: 12px; color: var(--text-light);">Paciente verificada no Google â€¢ Contagem</div>
              </div>
            </div>
          </div>

          <div class="review-card">
            <div class="flex-row" style="gap: 4px; margin-bottom: 12px;">
              ${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}
            </div>
            <p class="review-text">
              "Fiz meus implantes na clÃ­nica e hoje posso mastigar com total confianÃ§a e sem incÃ´modo. Dentistas extremamente pontuais, explicam cada detalhe do plano com honestidade e os valores sÃ£o justos. Recomendo de olhos fechados."
            </p>
            <div class="review-author flex-row" style="gap: 12px; margin-top: 16px;">
              <div class="author-avatar" style="background: var(--accent-soft); color: var(--accent-dark);">CM</div>
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text);">Carlos E. MendonÃ§a</div>
                <div style="font-size: 12px; color: var(--text-light);">Paciente verificado no Google â€¢ Centro</div>
              </div>
            </div>
          </div>

          <div class="review-card">
            <div class="flex-row" style="gap: 4px; margin-bottom: 12px;">
              ${icons.star}${icons.star}${icons.star}${icons.star}${icons.star}
            </div>
            <p class="review-text">
              "Levei meus dois filhos para consulta com a odontopediatra e foi fantÃ¡stico! As crianÃ§as saÃ­ram sorrindo e sem medo nenhum. A localizaÃ§Ã£o no Centro Ã© Ã³tima e tem estacionamento perto. JÃ¡ viramos pacientes fiÃ©is da clÃ­nica."
            </p>
            <div class="review-author flex-row" style="gap: 12px; margin-top: 16px;">
              <div class="author-avatar" style="background: var(--surface-soft); color: var(--primary);">PS</div>
              <div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text);">PatrÃ­cia Silveira</div>
                <div style="font-size: 12px; color: var(--text-light);">Paciente verificada no Google â€¢ Eldorado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `;
}

// -------------------------------------------------------------
// SECTION 05: FAQ, AGENDAMENTO, LOCALIZAÃ‡ÃƒO & FOOTER (DESKTOP)
// -------------------------------------------------------------
export function getSection05Desktop(): string {
  return `
  <section id="duvidas" class="faq-section">
    <div class="section-container">
      <div class="section-header">
        <div class="badge-tag badge-primary">Perguntas Frequentes</div>
        <h2>Tudo o que vocÃª precisa saber</h2>
        <p>Respostas claras para as dÃºvidas mais comuns sobre consultas, formas de pagamento e procedimentos.</p>
      </div>

      <div class="faq-list">
        <details class="faq-item" open>
          <summary class="faq-question flex-row">
            <span>A clÃ­nica aceita convÃªnios odontolÃ³gicos?</span>
            <span class="faq-icon">${icons.chevronDown}</span>
          </summary>
          <div class="faq-answer">
            Atendemos de forma particular com recibo detalhado e documentaÃ§Ã£o completa para vocÃª solicitar reembolso junto ao seu plano de saÃºde ou odontolÃ³gico. TambÃ©m disponibilizamos facilidades de parcelamento para que o seu tratamento seja acessÃ­vel.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-question flex-row">
            <span>Como funciona a primeira consulta de avaliaÃ§Ã£o?</span>
            <span class="faq-icon">${icons.chevronDown}</span>
          </summary>
          <div class="faq-answer">
            Na primeira consulta, o dentista realiza um exame clÃ­nico detalhado de toda a cavidade bucal, compreende seus objetivos e desconfortos, solicita exames caso necessÃ¡rio e elabora um plano de tratamento personalizado, com explicaÃ§Ã£o clara de cada etapa e valores.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-question flex-row">
            <span>Os tratamentos como canal ou implantes causam dor?</span>
            <span class="faq-icon">${icons.chevronDown}</span>
          </summary>
          <div class="faq-answer">
            NÃ£o! Utilizamos tÃ©cnicas anestÃ©sicas modernas de alta eficiÃªncia e instrumentos tecnolÃ³gicos que tornam o procedimento suave e seguro. Nosso corpo clÃ­nico Ã© treinado para oferecer atendimento humanizado com foco total no seu bem-estar.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-question flex-row">
            <span>Quais sÃ£o as opÃ§Ãµes de pagamento disponÃ­veis?</span>
            <span class="faq-icon">${icons.chevronDown}</span>
          </summary>
          <div class="faq-answer">
            Oferecemos parcelamento facilitado no cartÃ£o de crÃ©dito em atÃ© 12x, condiÃ§Ãµes especiais para pagamento Ã  vista via Pix, alÃ©m de planos flexÃ­veis alinhados Ã  duraÃ§Ã£o do seu tratamento.
          </div>
        </details>

        <details class="faq-item">
          <summary class="faq-question flex-row">
            <span>Onde a clÃ­nica fica e hÃ¡ facilidade para estacionar?</span>
            <span class="faq-icon">${icons.chevronDown}</span>
          </summary>
          <div class="faq-answer">
            Estamos situados na Rua AntÃ´nio Bernardino Muniz, 155, no Centro de Contagem - MG (prÃ³ximo Ã  Igreja Matriz de SÃ£o GonÃ§alo e a poucos metros dos principais pontos de referÃªncia), com estacionamentos parceiros nas proximidades.
          </div>
        </details>
      </div>

      <!-- Card Integrado de Agendamento & LocalizaÃ§Ã£o -->
      <div id="contato" class="contact-booking-box">
        <div class="contact-grid">
          <!-- FormulÃ¡rio de Agendamento RÃ¡pido -->
          <div class="booking-form-col">
            <h3 style="font-size: 22px; margin-bottom: 8px; color: var(--text);">Agende sua Consulta</h3>
            <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">
              Preencha o formulÃ¡rio e nossa equipe entrarÃ¡ em contato via WhatsApp para confirmar seu horÃ¡rio:
            </p>
            <form onsubmit="event.preventDefault(); const p = document.getElementById('formProc').value; const n = document.getElementById('formName').value; window.open('https://wa.me/5531985579266?text=OlÃ¡,%20meu%20nome%20Ã©%20' + encodeURIComponent(n) + '%20e%20gostaria%20de%20agendar%20' + encodeURIComponent(p) + '%20na%20DS%20Odontologia.', '_blank');">
              <div class="form-group">
                <label>Seu Nome Completo</label>
                <input type="text" id="formName" class="form-input" placeholder="Ex: Ana Paula Pereira" required>
              </div>
              <div class="form-group">
                <label>WhatsApp / Celular com DDD</label>
                <input type="tel" class="form-input" placeholder="(31) 90000-0000" required>
              </div>
              <div class="form-group">
                <label>Procedimento Desejado</label>
                <select id="formProc" class="form-select" required>
                  <option value="" disabled selected>Selecione uma especialidade</option>
                  ${procedureOptions()}
                </select>
              </div>
              <button type="submit" class="btn btn-whatsapp" style="width: 100%; margin-top: 8px;">
                ${icons.whatsapp}
                <span>Confirmar Agendamento pelo WhatsApp</span>
              </button>
            </form>
          </div>

          <!-- InformaÃ§Ãµes de EndereÃ§o & HorÃ¡rios -->
          <div class="contact-info-col">
            <div class="badge-tag badge-dark" style="margin-bottom: 16px;">Centro de Contagem</div>
            <h3 style="font-size: 22px; margin-bottom: 12px; color: #FFFFFF;">Visite a Nossa ClÃ­nica</h3>
            <p style="font-size: 14px; color: #E0D4EC; margin-bottom: 24px; line-height: 1.6;">
              LocalizaÃ§Ã£o privilegiada no Centro de Contagem, com consultÃ³rios climatizados e recepÃ§Ã£o acolhedora preparada para cuidar de vocÃª.
            </p>

            <div class="info-list">
              <div class="info-item flex-row" style="gap: 12px; margin-bottom: 18px;">
                <div class="info-icon-box">${icons.pin}</div>
                <div>
                  <div style="font-size: 12px; color: #C9B8DD; text-transform: uppercase;">EndereÃ§o</div>
                  <div style="font-size: 14.5px; font-weight: 600; color: #FFFFFF;">R. AntÃ´nio Bernardino Muniz, 155 - Centro, Contagem - MG, 32040-630</div>
                </div>
              </div>

              <div class="info-item flex-row" style="gap: 12px; margin-bottom: 24px;">
                <div class="info-icon-box">${icons.clock}</div>
                <div>
                  <div style="font-size: 12px; color: #C9B8DD; text-transform: uppercase;">HorÃ¡rios de Atendimento</div>
                  <div style="font-size: 14.5px; font-weight: 600; color: #FFFFFF;">Segunda a Sexta: 08:00 Ã s 19:00 â€¢ SÃ¡bado: 08:00 Ã s 13:00</div>
                </div>
              </div>
            </div>

            <div class="flex-row" style="gap: 12px; flex-wrap: wrap;">
              <a href="https://www.google.com/search?sca_esv=66da6a07b5b0afbb&biw=1745&bih=835&sxsrf=AKL5yDhToktXEkgu614aXLbwAhrNlN3dnQ:1793892176813&q=ds+odontologia+endere%C3%A7o&ludocid=5076174533163314977&sa=X&ved=2ahUKEwjo8dqPkfGXAxVPr5UCHfzHAm0Q6BN6BAg7EAI" target="_blank" class="btn btn-white">
                ${icons.pin}
                <span>Abrir no Google Maps</span>
              </a>
              <a href="tel:3133982000" class="btn btn-outline" style="border-color: rgba(255,255,255,0.4); color: #FFFFFF;">
                ${icons.phone}
                <span>(31) 3398-2000</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer Institucional -->
  <footer class="footer">
    <div class="section-container">
      <div class="footer-grid flex-row" style="justify-content: space-between; align-items: flex-start; padding: 48px 0 32px 0;">
        <div class="footer-brand" style="max-width: 420px;">
          <div class="flex-row" style="gap: 12px; margin-bottom: 16px; align-items: center;">
            <img src="${assets.logoIcon}" alt="DS Odontologia" style="height: 48px; width: 48px; object-fit: contain; background: #FFFFFF; border-radius: 10px; padding: 4px;">
            <img src="${assets.logoHorizontal}" alt="Odontologia Betim Contagem" style="height: 34px; object-fit: contain; filter: brightness(0) invert(1);">
          </div>
          <p style="font-size: 13.5px; color: #C9B8DD; line-height: 1.6;">
            ClÃ­nica odontolÃ³gica de alta qualidade dedicada ao atendimento humanizado, seguranÃ§a clÃ­nica e bem-estar do paciente no Centro de Contagem - MG.
          </p>
        </div>

        <div class="footer-col">
          <div style="font-weight: 700; font-size: 15px; color: #FFFFFF; margin-bottom: 12px;">Especialidades</div>
          <div style="font-size: 13px; color: #C9B8DD; display: flex; flex-direction: column; gap: 8px;">
            <span>Implantes & PrÃ³teses</span>
            <span>Invisalign & Ortodontia</span>
            <span>Facetas em Porcelana</span>
            <span>Tratamento de Canal</span>
            <span>Clareamento a Laser</span>
          </div>
        </div>

        <div class="footer-col">
          <div style="font-weight: 700; font-size: 15px; color: #FFFFFF; margin-bottom: 12px;">Atendimento</div>
          <div style="font-size: 13px; color: #C9B8DD; display: flex; flex-direction: column; gap: 8px;">
            <span>(31) 3398-2000</span>
            <span>(31) 98557-9266 (WhatsApp)</span>
            <span>R. AntÃ´nio Bernardino Muniz, 155</span>
            <span>Centro, Contagem - MG</span>
          </div>
        </div>

        <div class="footer-col">
          <div style="font-weight: 700; font-size: 15px; color: #FFFFFF; margin-bottom: 12px;">ResponsÃ¡vel TÃ©cnico</div>
          <div style="font-size: 13px; color: #C9B8DD; line-height: 1.6;">
            Equipe DS Odontologia<br>
            InscriÃ§Ã£o CRO-MG Regular<br>
            AlvarÃ¡ SanitÃ¡rio de Contagem
          </div>
        </div>
      </div>

      <div class="footer-bottom flex-row" style="justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.12); padding: 24px 0; font-size: 12.5px; color: #A895BF;">
        <div>Â© 2026 DS Odontologia. Todos os direitos reservados.</div>
        <div>Desenvolvido com excelÃªncia tÃ©cnica e foco em conversÃ£o.</div>
      </div>
    </div>
  </footer>
  `;
}

