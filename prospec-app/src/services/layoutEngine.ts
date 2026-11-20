import http from 'node:http';
import { Lead } from '../domain/types.js';

export interface LayoutTokens {
  ground: string;
  card_bg: string;
  border: string;
  accent: string;
  accent_hover: string;
  accent_light: string;
  text_main: string;
  text_muted: string;
  text_subtle: string;
  whatsapp: string;
  font_display: string;
  font_body: string;
  font_import: string;
}

export interface NicheConfig {
  tagline: string;
  headline: string;
  subheadline: string;
  about_title: string;
  about_desc: string;
  tokens: LayoutTokens;
  hero_img: string;
  logo_img?: string | null;
  services: Array<{ title: string; desc: string; badge: string }>;
  differentials: string[];
}

export interface CreatedFrame {
  name: string;
  id?: string;
  type: string;
}

export interface CanvasGenerationResult {
  canvas_id: string;
  canvas_url: string;
  frames: CreatedFrame[];
  tokens: LayoutTokens;
  desktop_html: string;
  mobile_html: string;
}

export class LayoutEngine {
  static async callDoopMcp(toolName: string, args: Record<string, any>, port = 4400): Promise<any> {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/mcp',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 10000
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (parsed.error) {
                return reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
              }
              const content = parsed.result?.content?.[0]?.text;
              if (content) {
                try {
                  resolve(JSON.parse(content));
                } catch {
                  resolve(content);
                }
              } else {
                resolve(parsed.result);
              }
            } catch (err: any) {
              reject(new Error(`Failed to parse MCP response: ${err.message}`));
            }
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout connecting to Doop MCP on port ' + port));
      });
      req.write(payload);
      req.end();
    });
  }

  static detectNiche(name: string, category: string): string {
    const combined = `${name} ${category}`.toLowerCase();
    if (/(dellas|beleza|estetic|cabelo|salao|salão|unha|manicure|sobrancelha|laser|depila)/.test(combined)) {
      return 'beauty';
    }
    if (/(barber|barbearia|barba|fade|navalha)/.test(combined)) {
      return 'barber';
    }
    if (/(bombeiro|hidraul|hidrául|vazamento|desentup|plumber|cano)/.test(combined)) {
      return 'hydraulic';
    }
    if (/(eletric|marido de aluguel|reparo|faz tudo|faço tudo|manuten)/.test(combined)) {
      return 'handyman';
    }
    if (/(mecanic|oficina|auto|carro|moto|pneu|funilaria)/.test(combined)) {
      return 'auto';
    }
    if (/(odonto|dente|dentista|clinica|clínica|saude|saúde|medico|médic)/.test(combined)) {
      return 'health';
    }
    if (/(restaurante|pizza|burger|hamburg|lanche|bar|churras|gastro|cafe|café)/.test(combined)) {
      return 'gastro';
    }
    if (/(pet|vet|veterin|animal|banho e tosa)/.test(combined)) {
      return 'pet';
    }
    return 'general';
  }

  static getNicheConfig(niche: string, bname: string, city: string): NicheConfig {
    if (niche === 'beauty') {
      return {
        tagline: 'Estética Avançada & Cuidado Personalizado',
        headline: `Realce sua beleza natural com atendimento exclusivo em ${city}`,
        subheadline: `Ambiente acolhedor, técnicas modernas e produtos de altíssimo padrão na ${bname}. Agendamento com hora marcada e foco total no seu bem-estar.`,
        about_title: 'Cuidado, precisão e acolhimento em cada detalhe',
        about_desc: `A ${bname} oferece uma experiência de beleza diferenciada em ${city}. Cada procedimento é planejado para valorizar seus traços únicos com biossegurança e pontualidade.`,
        tokens: {
          ground: '#FAF8F5',
          card_bg: '#FFFFFF',
          border: '#E8E2D9',
          accent: '#8A3D4D',
          accent_hover: '#733340',
          accent_light: '#F4EBEF',
          text_main: '#1C1917',
          text_muted: '#57534E',
          text_subtle: '#78716C',
          whatsapp: '#25D366',
          font_display: "'Playfair Display', Georgia, serif",
          font_body: "'Inter', -apple-system, sans-serif",
          font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap'
        },
        hero_img: 'http://localhost:4300/a/TZ45eppozq.png',
        logo_img: 'http://localhost:4300/a/rNPqcLVyTB.png',
        services: [
          { title: 'Estética Facial & Corporal', desc: 'Tratamentos modernos para revitalização e firmeza da pele.', badge: 'Mais Procurado' },
          { title: 'Depilação a Laser & Cera', desc: 'Remoção suave e duradoura com equipamentos de última geração.', badge: 'Tecnologia' },
          { title: 'Design de Sobrancelhas', desc: 'Alinhamento visagista perfeito que harmoniza com seu rosto.', badge: 'Personalizado' },
          { title: 'Manicure & Pedicure Spa', desc: 'Esmaltação de alta durabilidade e hidratação profunda.', badge: 'Relaxante' }
        ],
        differentials: ['Atendimento 100% com Hora Marcada', 'Biossegurança & Materiais Esterilizados', 'Localização Privilegiada no Centro', 'Produtos Profissionais Certificados']
      };
    }

    if (niche === 'hydraulic') {
      return {
        tagline: 'Bombeiro Hidráulico Especializado • Atendimento 24h',
        headline: `Caça-vazamentos preciso e reparos hidráulicos sem quebra-quebra em ${city}`,
        subheadline: `Detecção eletrônica com geofone de alta precisão, desentupimentos e manutenções hidráulicas com garantia por escrito na ${bname}.`,
        about_title: 'Precisão técnica, honestidade e agilidade quando você mais precisa',
        about_desc: `Referência em ${city} e região metropolitana, a ${bname} atua com equipamentos eletrônicos de última geração para localizar vazamentos invisíveis sem quebrar pisos ou paredes desnecessariamente.`,
        tokens: {
          ground: '#0B132B',
          card_bg: '#1C2541',
          border: '#3A506B',
          accent: '#00A8E8',
          accent_hover: '#007EA7',
          accent_light: 'rgba(0, 168, 232, 0.15)',
          text_main: '#FFFFFF',
          text_muted: '#B0C4DE',
          text_subtle: '#879FB7',
          whatsapp: '#25D366',
          font_display: "'Plus Jakarta Sans', sans-serif",
          font_body: "'Inter', -apple-system, sans-serif",
          font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap'
        },
        hero_img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        logo_img: null,
        services: [
          { title: 'Caça-Vazamentos com Geofone', desc: 'Localização acústica milimétrica de vazamentos ocultos sob o piso ou parede.', badge: 'Não Destrutivo' },
          { title: 'Desentupimento Técnico', desc: 'Desobstrução rápida de esgotos, pias, ralos e vasos com maquinário rotativo.', badge: '24 Horas' },
          { title: 'Substituição de Registros & Tubos', desc: 'Troca de conexões antigas, válvulas de descarga e colunas de água.', badge: 'Garantia' },
          { title: 'Laudo Técnico para Copasa', desc: 'Emissão de relatório oficial de reparo para desconto de conta alta por vazamento.', badge: 'Oficial' }
        ],
        differentials: ['Atendimento Emergencial 24 Horas', 'Detecção Eletrônica sem Quebra-Quebra', 'Laudo Técnico Aprovado para Concessionária', 'Garantia por Escrito em Todos os Reparos']
      };
    }

    if (niche === 'handyman') {
      return {
        tagline: 'Marido de Aluguel & Manutenção Residencial',
        headline: `Reparos elétricos, hidráulicos e montagens com acabamento perfeito em ${city}`,
        subheadline: `Resolva as pendências da sua casa ou empresa com a ${bname}. Atendimento pontual, ferramentas profissionais e garantia de serviço bem feito.`,
        about_title: 'Profissionalismo, capricho e confiança para sua casa',
        about_desc: `A ${bname} atende ${city} com foco na segurança e na tranquilidade da sua família. Realizamos desde pequenas instalações até revisões completas com limpeza após o serviço.`,
        tokens: {
          ground: '#FAFAFA',
          card_bg: '#FFFFFF',
          border: '#E4E4E7',
          accent: '#D97706',
          accent_hover: '#B45309',
          accent_light: '#FEF3C7',
          text_main: '#18181B',
          text_muted: '#52525B',
          text_subtle: '#71717A',
          whatsapp: '#25D366',
          font_display: "'Space Grotesk', sans-serif",
          font_body: "'Inter', -apple-system, sans-serif",
          font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap'
        },
        hero_img: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80',
        logo_img: null,
        services: [
          { title: 'Instalações Elétricas & Chuveiros', desc: 'Troca de tomadas, disjuntores, lâmpadas, luminárias e fiação.', badge: 'Segurança' },
          { title: 'Montagem & Reparo de Móveis', desc: 'Montagem minuciosa de móveis novos, ajustes de portas e dobradiças.', badge: 'Capricho' },
          { title: 'Pequenos Reparos Hidráulicos', desc: 'Troca de reparos de torneiras, sifões, registros e caixas acopladas.', badge: 'Sem Vazamentos' },
          { title: 'Fixação de Suportes & Cortinas', desc: 'Instalação alinhada de suportes de TV, quadros, prateleiras e espelhos.', badge: 'Alinhamento 100%' }
        ],
        differentials: ['Pontualidade Rigorosa no Horário Agendado', 'Limpeza e Organização do Espaço Pós-Serviço', 'Ferramentas Próprias de Alta Precisão', 'Orçamento Direto e Sem Burocracia']
      };
    }

    // Default: Corporate / Service Modern
    return {
      tagline: 'Excelência & Dedicação Local',
      headline: `Qualidade, confiança e atendimento especializado em ${city}`,
      subheadline: `Conheça as soluções da ${bname}. Atendimento com hora marcada e foco total na satisfação de clientes em ${city} e região.`,
      about_title: 'Compromisso com o resultado e satisfação do cliente',
      about_desc: `A ${bname} atua com dedicação e transparência, proporcionando atendimento ágil e o melhor custo-benefício em ${city}.`,
      tokens: {
        ground: '#FAF8F5',
        card_bg: '#FFFFFF',
        border: '#E8E2D9',
        accent: '#1E3A8A',
        accent_hover: '#1E40AF',
        accent_light: '#DBEAFE',
        text_main: '#0F172A',
        text_muted: '#475569',
        text_subtle: '#64748B',
        whatsapp: '#25D366',
        font_display: "'Plus Jakarta Sans', sans-serif",
        font_body: "'Inter', -apple-system, sans-serif",
        font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap'
      },
      hero_img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      logo_img: null,
      services: [
        { title: 'Atendimento Personalizado', desc: 'Soluções sob medida para o que você realmente precisa.', badge: 'Dedicado' },
        { title: 'Serviços Especializados', desc: 'Equipe qualificada e materiais de primeira linha.', badge: 'Qualidade' },
        { title: 'Orçamento Transparente', desc: 'Clareza nos valores e prazos cumpridos à risca.', badge: 'Sem Surpresas' },
        { title: 'Garantia & Pós-Venda', desc: 'Acompanhamento contínuo para garantir sua tranquilidade.', badge: 'Garantido' }
      ],
      differentials: ['Atendimento Rápido via WhatsApp', 'Profissionais Cuidadosos e Capacitados', 'Avaliações Positivas no Google', 'Garantia de Satisfação']
    };
  }

  static buildCommonCss(tokens: LayoutTokens): string {
    return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --ground: ${tokens.ground};
      --card-bg: ${tokens.card_bg};
      --border: ${tokens.border};
      --accent: ${tokens.accent};
      --accent-hover: ${tokens.accent_hover};
      --accent-light: ${tokens.accent_light};
      --text-main: ${tokens.text_main};
      --text-muted: ${tokens.text_muted};
      --text-subtle: ${tokens.text_subtle};
      --whatsapp: ${tokens.whatsapp};
    }
    body {
      background-color: var(--ground);
      color: var(--text-main);
      font-family: ${tokens.font_body};
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .font-serif { font-family: ${tokens.font_display}; }
    .container { max-width: 1160px; margin: 0 auto; padding: 0 32px; }
    .container-mobile { max-width: 390px; margin: 0 auto; padding: 0 20px; }
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      background: var(--accent); color: #FFFFFF; font-weight: 600; font-size: 14px;
      padding: 13px 26px; border-radius: 12px; text-decoration: none; border: none; cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12); transition: all 0.2s ease;
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: transparent; color: var(--text-main); font-weight: 600; font-size: 14px;
      padding: 13px 22px; border-radius: 12px; text-decoration: none; border: 1px solid var(--border);
      cursor: pointer; transition: all 0.2s ease;
    }
    .btn-whatsapp {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      background: var(--whatsapp); color: #FFFFFF; font-weight: 600; font-size: 14px;
      padding: 13px 26px; border-radius: 12px; text-decoration: none; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(37,211,102,0.25); transition: all 0.2s ease;
    }
    .btn-whatsapp:hover { background: #22BF5B; transform: translateY(-1px); }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--accent-light); color: var(--accent);
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      padding: 5px 12px; border-radius: 999px;
    }
    .card {
      background: var(--card-bg); border: 1px solid var(--border); border-radius: 18px;
      padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    `;
  }

  static async createUniqueCanvas(
    lead: Lead,
    options?: { agentName?: string; theme?: string; services?: string[]; cta?: string; existingCanvasId?: string } | string
  ): Promise<CanvasGenerationResult> {
    const agentName = typeof options === 'string' ? options : (options?.agentName || 'Antigravity');
    const themeOverride = typeof options === 'object' ? options?.theme : undefined;
    const servicesOverride = typeof options === 'object' ? options?.services : undefined;
    const ctaOverride = typeof options === 'object' ? options?.cta : undefined;
    let canvasId = typeof options === 'object' ? options?.existingCanvasId : undefined;
    if (!canvasId && (lead as any).doopCanvasId) {
      canvasId = (lead as any).doopCanvasId;
    }

    const bname = lead.name || 'Comércio Local';
    const city = lead.city || 'Região Metropolitana';
    const cat = lead.category || 'Serviços Especializados';
    const phone = lead.phoneNorm || lead.phoneRaw || '5531999999999';
    const phoneClean = phone.replace(/\D/g, '');
    const address = lead.address || `${city} - MG`;
    const ratingFmt = lead.rating ? parseFloat(lead.rating).toFixed(1) : '5.0';
    const revCount = lead.reviewsCount || '15';

    const niche = themeOverride && themeOverride !== 'auto'
      ? (themeOverride === 'auto_mechanic' ? 'auto' : themeOverride)
      : this.detectNiche(bname, cat);
    const cfg = this.getNicheConfig(niche, bname, city);

    if (ctaOverride) {
      cfg.cta = ctaOverride;
    }
    if (servicesOverride && servicesOverride.length > 0) {
      cfg.services = servicesOverride.slice(0, 4).map((s, idx) => ({
        badge: `0${idx + 1}`,
        title: s,
        desc: `Atendimento qualificado e padrão profissional da equipe ${bname}.`
      }));
    }

    const t = cfg.tokens;
    const css = this.buildCommonCss(t);

    const waLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Olá! Vi o site da ${bname} e gostaria de solicitar um atendimento/orçamento.`)}`;
    const mapsLink = `https://maps.google.com/?q=${encodeURIComponent(address)}`;

    // Create Canvas in Doop only if no existing canvas ID was provided or pinned for this lead
    let existingFrames: any[] = [];
    if (!canvasId) {
      try {
        const canvasRes = await this.callDoopMcp('create_canvas', {
          name: `${bname} — Layout Único`,
          agent_name: agentName
        });
        canvasId = canvasRes.id;
      } catch (err: any) {
        console.warn(`[LayoutEngine] Doop offline ou inacessível (${err.message}). Utilizando canvas local.`);
        canvasId = `local_${lead.id}`;
      }
    } else {
      // Reuse existing canvas and inspect existing frames
      try {
        const existingCanvas = await this.callDoopMcp('get_canvas', {
          canvas_id: canvasId,
          agent_name: agentName
        });
        existingFrames = existingCanvas?.frames || [];
      } catch (err: any) {
        console.warn(`[LayoutEngine] Falha ao consultar frames existentes do canvas ${canvasId}:`, err.message);
      }
    }

    const canvasUrl = `http://localhost:4300/c/${canvasId}`;

    // Services Cards
    const servicesCards = cfg.services.map((s) => `
      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <span style="font-size:11px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:4px 10px; border-radius:6px; display:inline-block; margin-bottom:12px;">${s.badge}</span>
          <h3 class="font-serif" style="font-size:20px; font-weight:600; color:var(--text-main); margin-bottom:8px;">${s.title}</h3>
          <p style="font-size:14px; color:var(--text-muted); line-height:1.5;">${s.desc}</p>
        </div>
        <div style="margin-top:20px; padding-top:14px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:var(--text-subtle);">Sob medida</span>
          <a href="${waLink}" target="_blank" style="color:var(--accent); font-weight:700; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
            <span>Solicitar</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
      </div>
    `).join('');

    const diffItems = cfg.differentials.map((diff) => `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <div style="width:24px; height:24px; border-radius:50%; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span style="font-size:14px; font-weight:600; color:var(--text-main);">${diff}</span>
      </div>
    `).join('');

    // 01 Header & Hero
    const s1Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:820px; display:flex; flex-direction:column; justify-content:space-between;">
  <header style="background:var(--ground); border-bottom:1px solid var(--border); padding:18px 0;">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap:12px;">
        ${cfg.logo_img ? `<img src="${cfg.logo_img}" style="width:44px; height:44px; border-radius:50%; object-fit:contain; border:1px solid var(--border);">` : `<div style="width:44px; height:44px; border-radius:12px; background:var(--accent); color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px;">${bname[0]}</div>`}
        <div>
          <strong class="font-serif" style="font-size:20px; color:var(--text-main); display:block; line-height:1.2;">${bname}</strong>
          <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent); font-weight:600;">${city} • ${cat}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="display:flex; align-items:center; gap:6px; background:var(--card-bg); border:1px solid var(--border); padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>${ratingFmt}</span>
          <span style="color:var(--text-subtle);">(${revCount} no Google)</span>
        </div>
        <a href="${waLink}" target="_blank" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
          <span>Chamar no WhatsApp</span>
        </a>
      </div>
    </div>
  </header>
  <section style="padding:60px 0 80px 0; flex-grow:1; display:flex; align-items:center;">
    <div class="container" style="display:grid; grid-template-columns:1.15fr 0.85fr; gap:56px; align-items:center;">
      <div>
        <div class="badge" style="margin-bottom:16px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>${cfg.tagline}</span>
        </div>
        <h1 class="font-serif" style="font-size:46px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; line-height:1.15; margin-bottom:18px;">
          ${cfg.headline}
        </h1>
        <p style="font-size:16px; color:var(--text-muted); line-height:1.6; margin-bottom:32px; max-width:540px;">
          ${cfg.subheadline}
        </p>
        <div style="display:flex; gap:14px; align-items:center;">
          <a href="${waLink}" target="_blank" class="btn-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            <span>Falar com Atendente Agora</span>
          </a>
          <a href="${mapsLink}" target="_blank" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Ver Localização</span>
          </a>
        </div>
      </div>
      <div>
        <div style="border-radius:24px; overflow:hidden; border:1px solid var(--border); box-shadow:0 16px 40px rgba(0,0,0,0.1); background:var(--card-bg); position:relative;">
          <img src="${cfg.hero_img}" alt="${bname}" style="width:100%; height:460px; object-fit:cover; display:block;">
          <div style="position:absolute; bottom:16px; left:16px; right:16px; background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); border-radius:14px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(0,0,0,0.06); color:#1C1917;">
            <div>
              <strong style="font-size:13px; display:block;">${bname}</strong>
              <span style="font-size:11px; color:#57534E;">${city} • Atendimento com Hora Marcada</span>
            </div>
            <span style="font-size:11px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:4px 8px; border-radius:6px;">Verificado</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</body></html>`;

    // 02 Serviços
    const s2Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:840px; display:flex; align-items:center; background:var(--ground);">
  <div class="container" style="width:100%; padding:60px 32px;">
    <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
      <div class="badge" style="margin-bottom:12px;">Soluções Especializadas</div>
      <h2 class="font-serif" style="font-size:38px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; margin-bottom:12px;">
        Serviços desenvolvidos para sua total segurança
      </h2>
      <p style="font-size:15px; color:var(--text-muted); line-height:1.6;">
        Técnicas atualizadas, materiais certificados e acompanhamento dedicado do início ao fim.
      </p>
    </div>
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px;">
      ${servicesCards}
    </div>
  </div>
</body></html>`;

    // 03 Sobre
    const s3Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:740px; display:flex; align-items:center; background:var(--card-bg); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
  <div class="container" style="width:100%; padding:60px 32px;">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;">
      <div>
        <div class="badge" style="margin-bottom:14px;">Tradição & Confiança</div>
        <h2 class="font-serif" style="font-size:36px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; margin-bottom:16px;">
          ${cfg.about_title}
        </h2>
        <p style="font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:28px;">
          ${cfg.about_desc}
        </p>
        <div style="margin-bottom:32px;">
          ${diffItems}
        </div>
        <a href="${waLink}" target="_blank" class="btn-whatsapp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
          <span>Conhecer Pessoalmente / Agendar</span>
        </a>
      </div>
      <div>
        <div style="border-radius:22px; overflow:hidden; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.06); background:var(--ground); padding:36px;">
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
            <div style="width:54px; height:54px; border-radius:14px; background:var(--accent); color:#FFF; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <strong class="font-serif" style="font-size:22px; color:var(--text-main);">${bname}</strong>
              <span style="font-size:13px; color:var(--text-muted); display:block;">Compromisso de Excelência em ${city}</span>
            </div>
          </div>
          <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:20px;">
            Trabalhamos com pontualidade, atendimento cordial e transparência nos preços para que sua experiência seja impecável.
          </p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; border-top:1px solid var(--border); padding-top:20px;">
            <div>
              <strong style="font-size:24px; color:var(--accent); font-weight:800;">${ratingFmt} ★</strong>
              <span style="font-size:12px; color:var(--text-muted); display:block;">Nota no Google</span>
            </div>
            <div>
              <strong style="font-size:24px; color:var(--accent); font-weight:800;">100%</strong>
              <span style="font-size:12px; color:var(--text-muted); display:block;">Dedicação Local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

    // 04 Avaliações
    const s4Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:560px; display:flex; align-items:center; background:var(--ground);">
  <div class="container" style="width:100%; padding:50px 32px;">
    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:36px;">
      <div>
        <div class="badge" style="margin-bottom:10px;">Opinião de Quem Confia</div>
        <h2 class="font-serif" style="font-size:32px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em;">
          Avaliações Verificadas no Google (${ratingFmt} ★)
        </h2>
      </div>
      <a href="${mapsLink}" target="_blank" class="btn-secondary" style="font-size:13px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>Ver Todas no Google Maps</span>
      </a>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
      <div class="card">
        <div style="display:flex; gap:2px; margin-bottom:12px;">
          ${Array(5).fill('<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
        </div>
        <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
          "Atendimento impecável! Pontualidade, ambiente acolhedor e serviço com muito capricho em ${city}."
        </p>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:50%; background:var(--accent-light); color:var(--accent); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center;">M</div>
          <div>
            <strong style="font-size:13px; color:var(--text-main); display:block;">Mariana Silva</strong>
            <span style="font-size:11px; color:var(--text-subtle);">Cliente Verificada no Google</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div style="display:flex; gap:2px; margin-bottom:12px;">
          ${Array(5).fill('<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
        </div>
        <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
          "Profissionalismo de alto nível. Esclareceu todas as dúvidas antes do serviço e o resultado superou as expectativas."
        </p>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:50%; background:var(--accent-light); color:var(--accent); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center;">R</div>
          <div>
            <strong style="font-size:13px; color:var(--text-main); display:block;">Rodrigo Souza</strong>
            <span style="font-size:11px; color:var(--text-subtle);">Cliente Verificado no Google</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div style="display:flex; gap:2px; margin-bottom:12px;">
          ${Array(5).fill('<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
        </div>
        <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
          "Facilidade para agendar pelo WhatsApp e retorno rápido. A ${bname} é com certeza a melhor opção da região."
        </p>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:50%; background:var(--accent-light); color:var(--accent); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center;">C</div>
          <div>
            <strong style="font-size:13px; color:var(--text-main); display:block;">Camila Mendes</strong>
            <span style="font-size:11px; color:var(--text-subtle);">Cliente Verificada no Google</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

    // 05 Localização
    const s5Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:840px; display:flex; flex-direction:column; justify-content:space-between; background:var(--ground); border-top:1px solid var(--border);">
  <section style="padding:60px 0; flex-grow:1;">
    <div class="container" style="display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center;">
      <div>
        <div class="badge" style="margin-bottom:12px;">Fácil Localização</div>
        <h2 class="font-serif" style="font-size:36px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; margin-bottom:16px;">
          Venha nos visitar em ${city}
        </h2>
        <p style="font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:28px;">
          Estamos prontos para atender você com o máximo de conforto, segurança e pontualidade.
        </p>
        <div class="card" style="margin-bottom:28px;">
          <div style="display:flex; gap:14px; margin-bottom:16px;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <strong style="font-size:14px; color:var(--text-main); display:block;">Endereço:</strong>
              <span style="font-size:14px; color:var(--text-muted);">${address}</span>
            </div>
          </div>
          <div style="display:flex; gap:14px; border-top:1px solid var(--border); padding-top:16px;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <strong style="font-size:14px; color:var(--text-main); display:block;">Atendimento:</strong>
              <span style="font-size:13px; color:var(--text-muted);">Segunda a Sábado com Hora Marcada</span>
            </div>
          </div>
        </div>
        <div style="display:flex; gap:14px;">
          <a href="${mapsLink}" target="_blank" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span>Traçar Rota no GPS</span>
          </a>
          <a href="${waLink}" target="_blank" class="btn-whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            <span>Chamar no WhatsApp</span>
          </a>
        </div>
      </div>
      <div>
        <div style="border-radius:24px; overflow:hidden; border:1px solid var(--border); box-shadow:0 12px 32px rgba(0,0,0,0.06); background:var(--card-bg);">
          <div style="padding:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong class="font-serif" style="font-size:18px; color:var(--text-main);">${bname}</strong>
              <span style="font-size:12px; color:var(--text-muted); display:block;">Presença Digital Oficial</span>
            </div>
            <span style="font-size:12px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:4px 10px; border-radius:6px;">${city}</span>
          </div>
          <div style="height:320px; background:var(--card-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:32px;">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <strong style="font-size:16px; color:var(--text-main); margin-bottom:6px;">Localização Confirmada no Google</strong>
            <p style="font-size:13px; color:var(--text-muted); max-width:280px; margin-bottom:20px;">${address}</p>
            <a href="${mapsLink}" target="_blank" class="btn-primary" style="font-size:13px; padding:10px 20px;">
              <span>Abrir no Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer style="padding:28px 0; background:var(--card-bg); border-top:1px solid var(--border); font-size:13px; color:var(--text-muted);">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="color:var(--text-main);">${bname}</strong> • ${city} - MG
      </div>
      <div>
        © 2026 ${bname}. Todos os direitos reservados.
      </div>
    </div>
  </footer>
</body></html>`;

    // Desktop Completo
    const desktopFullHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body>
  <!-- HEADER -->
  <header style="background:var(--ground); border-bottom:1px solid var(--border); padding:18px 0; position:sticky; top:0; z-index:50; backdrop-filter:blur(8px);">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap:12px;">
        ${cfg.logo_img ? `<img src="${cfg.logo_img}" style="width:44px; height:44px; border-radius:50%; object-fit:contain; border:1px solid var(--border);">` : `<div style="width:44px; height:44px; border-radius:12px; background:var(--accent); color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px;">${bname[0]}</div>`}
        <div>
          <strong class="font-serif" style="font-size:20px; color:var(--text-main); display:block; line-height:1.2;">${bname}</strong>
          <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent); font-weight:600;">${city} • ${cat}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="display:flex; align-items:center; gap:6px; background:var(--card-bg); border:1px solid var(--border); padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>${ratingFmt}</span>
          <span style="color:var(--text-subtle);">(${revCount} no Google)</span>
        </div>
        <a href="${waLink}" target="_blank" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
          <span>Chamar no WhatsApp</span>
        </a>
      </div>
    </div>
  </header>

  <!-- HERO -->
  <section style="padding:70px 0 90px 0;">
    <div class="container" style="display:grid; grid-template-columns:1.15fr 0.85fr; gap:56px; align-items:center;">
      <div>
        <div class="badge" style="margin-bottom:16px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>${cfg.tagline}</span>
        </div>
        <h1 class="font-serif" style="font-size:46px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; line-height:1.15; margin-bottom:18px;">
          ${cfg.headline}
        </h1>
        <p style="font-size:16px; color:var(--text-muted); line-height:1.6; margin-bottom:32px; max-width:540px;">
          ${cfg.subheadline}
        </p>
        <div style="display:flex; gap:14px; align-items:center;">
          <a href="${waLink}" target="_blank" class="btn-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            <span>Falar com Atendente Agora</span>
          </a>
          <a href="${mapsLink}" target="_blank" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Ver Localização</span>
          </a>
        </div>
      </div>
      <div>
        <div style="border-radius:24px; overflow:hidden; border:1px solid var(--border); box-shadow:0 16px 40px rgba(0,0,0,0.1); background:var(--card-bg); position:relative;">
          <img src="${cfg.hero_img}" alt="${bname}" style="width:100%; height:460px; object-fit:cover; display:block;">
          <div style="position:absolute; bottom:16px; left:16px; right:16px; background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); border-radius:14px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(0,0,0,0.06); color:#1C1917;">
            <div>
              <strong style="font-size:13px; display:block;">${bname}</strong>
              <span style="font-size:11px; color:#57534E;">${city} • Atendimento com Hora Marcada</span>
            </div>
            <span style="font-size:11px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:4px 8px; border-radius:6px;">Verificado</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVIÇOS -->
  <section style="padding:80px 0; background:var(--ground); border-top:1px solid var(--border);">
    <div class="container">
      <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
        <div class="badge" style="margin-bottom:12px;">Soluções Especializadas</div>
        <h2 class="font-serif" style="font-size:38px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; margin-bottom:12px;">
          Serviços desenvolvidos para sua total segurança
        </h2>
        <p style="font-size:15px; color:var(--text-muted); line-height:1.6;">
          Técnicas atualizadas, materiais certificados e acompanhamento dedicado do início ao fim.
        </p>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px;">
        ${servicesCards}
      </div>
    </div>
  </section>

  <!-- SOBRE -->
  <section style="padding:80px 0; background:var(--card-bg); border-top:1px solid var(--border);">
    <div class="container">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;">
        <div>
          <div class="badge" style="margin-bottom:14px;">Tradição & Confiança</div>
          <h2 class="font-serif" style="font-size:36px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; margin-bottom:16px;">
            ${cfg.about_title}
          </h2>
          <p style="font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:28px;">
            ${cfg.about_desc}
          </p>
          <div style="margin-bottom:32px;">
            ${diffItems}
          </div>
          <a href="${waLink}" target="_blank" class="btn-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            <span>Conhecer Pessoalmente / Agendar</span>
          </a>
        </div>
        <div>
          <div style="border-radius:22px; overflow:hidden; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.06); background:var(--ground); padding:36px;">
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px;">
              <div style="width:54px; height:54px; border-radius:14px; background:var(--accent); color:#FFF; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <strong class="font-serif" style="font-size:22px; color:var(--text-main);">${bname}</strong>
                <span style="font-size:13px; color:var(--text-muted); display:block;">Compromisso de Excelência em ${city}</span>
              </div>
            </div>
            <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:20px;">
              Trabalhamos com pontualidade, atendimento cordial e transparência nos preços para que sua experiência seja impecável.
            </p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; border-top:1px solid var(--border); padding-top:20px;">
              <div>
                <strong style="font-size:24px; color:var(--accent); font-weight:800;">${ratingFmt} ★</strong>
                <span style="font-size:12px; color:var(--text-muted); display:block;">Nota no Google</span>
              </div>
              <div>
                <strong style="font-size:24px; color:var(--accent); font-weight:800;">100%</strong>
                <span style="font-size:12px; color:var(--text-muted); display:block;">Dedicação Local</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- AVALIAÇÕES -->
  <section style="padding:80px 0; background:var(--ground); border-top:1px solid var(--border);">
    <div class="container">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:36px;">
        <div>
          <div class="badge" style="margin-bottom:10px;">Opinião de Quem Confia</div>
          <h2 class="font-serif" style="font-size:32px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em;">
            Avaliações Verificadas no Google (${ratingFmt} ★)
          </h2>
        </div>
        <a href="${mapsLink}" target="_blank" class="btn-secondary" style="font-size:13px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Ver Todas no Google Maps</span>
        </a>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">
        <div class="card">
          <div style="display:flex; gap:2px; margin-bottom:12px;">
            ${Array(5).fill('<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
          </div>
          <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
            "Atendimento impecável! Pontualidade, ambiente acolhedor e serviço com muito capricho em ${city}."
          </p>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:var(--accent-light); color:var(--accent); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center;">M</div>
            <div>
              <strong style="font-size:13px; color:var(--text-main); display:block;">Mariana Silva</strong>
              <span style="font-size:11px; color:var(--text-subtle);">Cliente Verificada no Google</span>
            </div>
          </div>
        </div>
        <div class="card">
          <div style="display:flex; gap:2px; margin-bottom:12px;">
            ${Array(5).fill('<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
          </div>
          <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
            "Profissionalismo de alto nível. Esclareceu todas as dúvidas antes do serviço e o resultado superou as expectativas."
          </p>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:var(--accent-light); color:var(--accent); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center;">R</div>
            <div>
              <strong style="font-size:13px; color:var(--text-main); display:block;">Rodrigo Souza</strong>
              <span style="font-size:11px; color:var(--text-subtle);">Cliente Verificado no Google</span>
            </div>
          </div>
        </div>
        <div class="card">
          <div style="display:flex; gap:2px; margin-bottom:12px;">
            ${Array(5).fill('<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
          </div>
          <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
            "Facilidade para agendar pelo WhatsApp e retorno rápido. A ${bname} é com certeza a melhor opção da região."
          </p>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:var(--accent-light); color:var(--accent); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center;">C</div>
            <div>
              <strong style="font-size:13px; color:var(--text-main); display:block;">Camila Mendes</strong>
              <span style="font-size:11px; color:var(--text-subtle);">Cliente Verificada no Google</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LOCALIZAÇÃO -->
  <section style="padding:80px 0; background:var(--card-bg); border-top:1px solid var(--border);">
    <div class="container" style="display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center;">
      <div>
        <div class="badge" style="margin-bottom:12px;">Fácil Localização</div>
        <h2 class="font-serif" style="font-size:36px; font-weight:700; color:var(--text-main); letter-spacing:-0.02em; margin-bottom:16px;">
          Venha nos visitar em ${city}
        </h2>
        <p style="font-size:15px; color:var(--text-muted); line-height:1.6; margin-bottom:28px;">
          Estamos prontos para atender você com o máximo de conforto, segurança e pontualidade.
        </p>
        <div class="card" style="margin-bottom:28px; background:var(--ground);">
          <div style="display:flex; gap:14px; margin-bottom:16px;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <strong style="font-size:14px; color:var(--text-main); display:block;">Endereço:</strong>
              <span style="font-size:14px; color:var(--text-muted);">${address}</span>
            </div>
          </div>
          <div style="display:flex; gap:14px; border-top:1px solid var(--border); padding-top:16px;">
            <div style="width:36px; height:36px; border-radius:10px; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <strong style="font-size:14px; color:var(--text-main); display:block;">Atendimento:</strong>
              <span style="font-size:13px; color:var(--text-muted);">Segunda a Sábado com Hora Marcada</span>
            </div>
          </div>
        </div>
        <div style="display:flex; gap:14px;">
          <a href="${mapsLink}" target="_blank" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            <span>Traçar Rota no GPS</span>
          </a>
          <a href="${waLink}" target="_blank" class="btn-whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            <span>Chamar no WhatsApp</span>
          </a>
        </div>
      </div>
      <div>
        <div style="border-radius:24px; overflow:hidden; border:1px solid var(--border); box-shadow:0 12px 32px rgba(0,0,0,0.06); background:var(--ground);">
          <div style="padding:24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong class="font-serif" style="font-size:18px; color:var(--text-main);">${bname}</strong>
              <span style="font-size:12px; color:var(--text-muted); display:block;">Presença Digital Oficial</span>
            </div>
            <span style="font-size:12px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:4px 10px; border-radius:6px;">${city}</span>
          </div>
          <div style="height:320px; background:var(--ground); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:32px;">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--accent-light); color:var(--accent); display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <strong style="font-size:16px; color:var(--text-main); margin-bottom:6px;">Localização Confirmada no Google</strong>
            <p style="font-size:13px; color:var(--text-muted); max-width:280px; margin-bottom:20px;">${address}</p>
            <a href="${mapsLink}" target="_blank" class="btn-primary" style="font-size:13px; padding:10px 20px;">
              <span>Abrir no Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="padding:28px 0; background:var(--card-bg); border-top:1px solid var(--border); font-size:13px; color:var(--text-muted);">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="color:var(--text-main);">${bname}</strong> • ${city} - MG
      </div>
      <div>
        © 2026 ${bname}. Todos os direitos reservados.
      </div>
    </div>
  </footer>
</body></html>`;

    // Mobile frames
    const m1Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:680px; padding:20px 0; background:var(--ground);">
  <div class="container-mobile">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <div style="display:flex; align-items:center; gap:10px;">
        ${cfg.logo_img ? `<img src="${cfg.logo_img}" style="width:36px; height:36px; border-radius:50%; object-fit:contain; border:1px solid var(--border);">` : `<div style="width:36px; height:36px; border-radius:10px; background:var(--accent); color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px;">${bname[0]}</div>`}
        <div>
          <strong class="font-serif" style="font-size:16px; color:var(--text-main); display:block; line-height:1.2;">${bname}</strong>
          <span style="font-size:10px; text-transform:uppercase; color:var(--accent); font-weight:600;">${city}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:4px; background:var(--card-bg); border:1px solid var(--border); padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>${ratingFmt}</span>
      </div>
    </div>
    
    <div class="badge" style="margin-bottom:12px; font-size:10px;">${cfg.tagline}</div>
    <h1 class="font-serif" style="font-size:28px; font-weight:700; color:var(--text-main); line-height:1.2; margin-bottom:14px;">
      ${cfg.headline}
    </h1>
    <p style="font-size:14px; color:var(--text-muted); line-height:1.5; margin-bottom:20px;">
      ${cfg.subheadline}
    </p>
    <a href="${waLink}" target="_blank" class="btn-whatsapp" style="width:100%; margin-bottom:20px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
      <span>Chamar no WhatsApp</span>
    </a>
    <div style="border-radius:18px; overflow:hidden; border:1px solid var(--border);">
      <img src="${cfg.hero_img}" alt="${bname}" style="width:100%; height:220px; object-fit:cover; display:block;">
    </div>
  </div>
</body></html>`;

    const m2Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:620px; padding:24px 0; background:var(--ground);">
  <div class="container-mobile">
    <div class="badge" style="margin-bottom:10px;">Procedimentos & Serviços</div>
    <h2 class="font-serif" style="font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:16px;">
      Especialidades da ${bname}
    </h2>
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${cfg.services.slice(0, 3).map((s) => `
        <div class="card" style="padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong class="font-serif" style="font-size:16px; color:var(--text-main);">${s.title}</strong>
            <span style="font-size:10px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:2px 8px; border-radius:4px;">${s.badge}</span>
          </div>
          <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">${s.desc}</p>
        </div>
      `).join('')}
    </div>
  </div>
</body></html>`;

    const m3Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:640px; padding:24px 0; background:var(--card-bg); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
  <div class="container-mobile">
    <div class="badge" style="margin-bottom:10px;">Sobre a Empresa</div>
    <h2 class="font-serif" style="font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:12px;">
      ${cfg.about_title}
    </h2>
    <p style="font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:20px;">
      ${cfg.about_desc}
    </p>
    <div style="margin-bottom:20px;">
      ${diffItems}
    </div>
    <div class="card" style="padding:16px; background:var(--ground); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="font-size:20px; color:var(--accent);">${ratingFmt} ★</strong>
        <span style="font-size:11px; color:var(--text-muted); display:block;">Avaliação no Google</span>
      </div>
      <div>
        <strong style="font-size:20px; color:var(--accent);">100%</strong>
        <span style="font-size:11px; color:var(--text-muted); display:block;">Hora Marcada</span>
      </div>
    </div>
  </div>
</body></html>`;

    const m4Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:520px; padding:24px 0; background:var(--ground);">
  <div class="container-mobile">
    <div class="badge" style="margin-bottom:10px;">Google Reviews</div>
    <h2 class="font-serif" style="font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:16px;">
      O que dizem os clientes (${ratingFmt} ★)
    </h2>
    <div class="card" style="padding:18px; margin-bottom:14px;">
      <div style="display:flex; gap:2px; margin-bottom:10px;">
        ${Array(5).fill('<svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
      </div>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:14px;">
        "Atendimento impecável! Pontualidade, ambiente acolhedor e serviço com muito capricho em ${city}."
      </p>
      <strong style="font-size:12px; color:var(--text-main);">Mariana Silva</strong>
      <span style="font-size:10px; color:var(--text-subtle); display:block;">Cliente Google Verificada</span>
    </div>
    <a href="${mapsLink}" target="_blank" class="btn-secondary" style="width:100%; font-size:13px; padding:10px;">
      <span>Ver Todas as Avaliações</span>
    </a>
  </div>
</body></html>`;

    const m5Html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="min-height:580px; padding:24px 0; background:var(--ground); border-top:1px solid var(--border);">
  <div class="container-mobile">
    <div class="badge" style="margin-bottom:10px;">Localização & Contato</div>
    <h2 class="font-serif" style="font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:14px;">
      Onde Encontrar a ${bname}
    </h2>
    <div class="card" style="padding:18px; margin-bottom:18px;">
      <strong style="font-size:13px; color:var(--text-main); display:block; margin-bottom:4px;">Endereço:</strong>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.4; margin-bottom:12px;">${address}</p>
      <strong style="font-size:13px; color:var(--text-main); display:block; margin-bottom:4px;">Horários:</strong>
      <p style="font-size:12px; color:var(--text-muted);">Segunda a Sábado com Hora Marcada</p>
    </div>
    <a href="${mapsLink}" target="_blank" class="btn-secondary" style="width:100%; margin-bottom:12px;">
      <span>Abrir Rota no Google Maps</span>
    </a>
    <footer style="padding-top:20px; border-top:1px solid var(--border); text-align:center; font-size:11px; color:var(--text-subtle);">
      © 2026 ${bname}. ${city} - MG
    </footer>
  </div>
</body></html>`;

    // Mobile Completo com Sticky Action Bar
    const mobileFullHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${t.font_import}" rel="stylesheet"><style>${css}</style></head>
<body style="padding-bottom:80px; background:var(--ground);">
  <div style="padding:16px 20px 28px 20px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div style="display:flex; align-items:center; gap:10px;">
        ${cfg.logo_img ? `<img src="${cfg.logo_img}" style="width:36px; height:36px; border-radius:50%; object-fit:contain; border:1px solid var(--border);">` : `<div style="width:36px; height:36px; border-radius:10px; background:var(--accent); color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px;">${bname[0]}</div>`}
        <div>
          <strong class="font-serif" style="font-size:16px; color:var(--text-main); display:block; line-height:1.2;">${bname}</strong>
          <span style="font-size:10px; text-transform:uppercase; color:var(--accent); font-weight:600;">${city}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:4px; background:var(--card-bg); border:1px solid var(--border); padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>${ratingFmt}</span>
      </div>
    </div>
    <div class="badge" style="margin-bottom:12px; font-size:10px;">${cfg.tagline}</div>
    <h1 class="font-serif" style="font-size:28px; font-weight:700; color:var(--text-main); line-height:1.2; margin-bottom:14px;">
      ${cfg.headline}
    </h1>
    <p style="font-size:14px; color:var(--text-muted); line-height:1.5; margin-bottom:20px;">
      ${cfg.subheadline}
    </p>
    <div style="border-radius:18px; overflow:hidden; border:1px solid var(--border); margin-bottom:24px;">
      <img src="${cfg.hero_img}" alt="${bname}" style="width:100%; height:220px; object-fit:cover; display:block;">
    </div>
  </div>

  <section style="padding:28px 20px; background:var(--card-bg); border-top:1px solid var(--border);">
    <div class="badge" style="margin-bottom:10px;">Procedimentos & Serviços</div>
    <h2 class="font-serif" style="font-size:22px; font-weight:700; color:var(--text-main); margin-bottom:16px;">
      Especialidades
    </h2>
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${cfg.services.map((s) => `
        <div class="card" style="padding:16px; background:var(--ground);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong class="font-serif" style="font-size:15px; color:var(--text-main);">${s.title}</strong>
            <span style="font-size:10px; font-weight:700; color:var(--accent); background:var(--accent-light); padding:2px 8px; border-radius:4px;">${s.badge}</span>
          </div>
          <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">${s.desc}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <section style="padding:28px 20px; background:var(--ground); border-top:1px solid var(--border);">
    <div class="badge" style="margin-bottom:10px;">Sobre a Empresa</div>
    <h2 class="font-serif" style="font-size:22px; font-weight:700; color:var(--text-main); margin-bottom:12px;">
      ${cfg.about_title}
    </h2>
    <p style="font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:18px;">
      ${cfg.about_desc}
    </p>
    <div style="margin-bottom:20px;">
      ${diffItems}
    </div>
  </section>

  <section style="padding:28px 20px; background:var(--card-bg); border-top:1px solid var(--border);">
    <div class="badge" style="margin-bottom:10px;">Google Reviews</div>
    <h2 class="font-serif" style="font-size:22px; font-weight:700; color:var(--text-main); margin-bottom:16px;">
      Avaliações (${ratingFmt} ★)
    </h2>
    <div class="card" style="padding:16px; margin-bottom:14px; background:var(--ground);">
      <div style="display:flex; gap:2px; margin-bottom:8px;">
        ${Array(5).fill('<svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>').join('')}
      </div>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.4; margin-bottom:10px;">
        "Atendimento impecável! Pontualidade, ambiente acolhedor e serviço com muito capricho em ${city}."
      </p>
      <strong style="font-size:12px; color:var(--text-main);">Mariana Silva</strong>
    </div>
  </section>

  <section style="padding:28px 20px; background:var(--ground); border-top:1px solid var(--border);">
    <div class="badge" style="margin-bottom:10px;">Onde Estamos</div>
    <h2 class="font-serif" style="font-size:22px; font-weight:700; color:var(--text-main); margin-bottom:12px;">
      ${city} - MG
    </h2>
    <div class="card" style="padding:16px; margin-bottom:16px;">
      <strong style="font-size:13px; color:var(--text-main); display:block; margin-bottom:4px;">Endereço:</strong>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.4;">${address}</p>
    </div>
    <a href="${mapsLink}" target="_blank" class="btn-secondary" style="width:100%; margin-bottom:24px;">
      <span>Abrir Rota no Google Maps</span>
    </a>
    <footer style="text-align:center; font-size:11px; color:var(--text-subtle);">
      © 2026 ${bname}. Todos os direitos reservados.
    </footer>
  </section>

  <!-- STICKY ACTION BAR INFERIOR -->
  <div style="position:fixed; bottom:0; left:0; right:0; z-index:100; background:rgba(255,255,255,0.96); backdrop-filter:blur(10px); border-top:1px solid var(--border); padding:12px 20px; display:flex; gap:10px; align-items:center;">
    <a href="${mapsLink}" target="_blank" style="width:44px; height:44px; border-radius:12px; border:1px solid var(--border); background:var(--ground); display:flex; align-items:center; justify-content:center; color:var(--text-main); flex-shrink:0;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </a>
    <a href="${waLink}" target="_blank" class="btn-whatsapp" style="flex-grow:1; height:44px; padding:0 16px; font-size:14px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
      <span>Agendar no WhatsApp</span>
    </a>
  </div>
</body></html>`;

    // 12 Frames List
    const framesToCreate = [
      // Col 1: Modular Desktop
      { name: '01 — Header & Hero (Desktop)', html: s1Html, width: 1280, height: 820, x: 0, y: 0, type: 'desktop_module' },
      { name: '02 — Procedimentos & Especialidades (Desktop)', html: s2Html, width: 1280, height: 840, x: 0, y: 880, type: 'desktop_module' },
      { name: '03 — Sobre a Empresa & Diferenciais (Desktop)', html: s3Html, width: 1280, height: 740, x: 0, y: 1780, type: 'desktop_module' },
      { name: '04 — Avaliações Google Verificadas (Desktop)', html: s4Html, width: 1280, height: 560, x: 0, y: 2580, type: 'desktop_module' },
      { name: '05 — Localização, Horários & Footer (Desktop)', html: s5Html, width: 1280, height: 840, x: 0, y: 3200, type: 'desktop_module' },
      // Col 2: Desktop Completo
      { name: 'Desktop Completo — Página Integrada', html: desktopFullHtml, width: 1280, height: 4250, x: 1360, y: 0, type: 'desktop_full' },
      // Col 3: Modular Mobile
      { name: 'M01 — Header & Hero (Mobile)', html: m1Html, width: 390, height: 680, x: 2720, y: 0, type: 'mobile_module' },
      { name: 'M02 — Serviços (Mobile)', html: m2Html, width: 390, height: 620, x: 2720, y: 740, type: 'mobile_module' },
      { name: 'M03 — Sobre (Mobile)', html: m3Html, width: 390, height: 640, x: 2720, y: 1420, type: 'mobile_module' },
      { name: 'M04 — Avaliações Google (Mobile)', html: m4Html, width: 390, height: 520, x: 2720, y: 2120, type: 'mobile_module' },
      { name: 'M05 — Localização & Footer (Mobile)', html: m5Html, width: 390, height: 580, x: 2720, y: 2700, type: 'mobile_module' },
      // Col 4: Mobile Completo
      { name: 'Mobile Completo — Com Sticky Bar WhatsApp', html: mobileFullHtml, width: 390, height: 2700, x: 3190, y: 0, type: 'mobile_full' }
    ];

    const createdFrames: CreatedFrame[] = [];
    for (const f of framesToCreate) {
      try {
        const match = existingFrames.find(
          (ef: any) => ef.name === f.name || ef.name?.startsWith(f.name.split(' ')[0])
        );

        if (match && match.id) {
          // Update frame HTML on existing canvas without creating new frames or canvases
          await this.callDoopMcp('set_frame_html', {
            frame_id: match.id,
            html: f.html,
            agent_name: agentName
          });
          createdFrames.push({
            name: f.name,
            id: match.id,
            type: f.type
          });
        } else {
          // Create frame on canvas
          const frameRes = await this.callDoopMcp('create_frame', {
            canvas_id: canvasId,
            name: f.name,
            html: f.html,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            agent_name: agentName
          });
          createdFrames.push({
            name: f.name,
            id: frameRes?.frame?.id,
            type: f.type
          });
        }
      } catch (err: any) {
        console.warn(`[LayoutEngine] Falha ao configurar prancheta ${f.name}:`, err.message);
      }
    }

    return {
      canvas_id: canvasId,
      canvas_url: canvasUrl,
      frames: createdFrames,
      tokens: t,
      desktop_html: desktopFullHtml,
      mobile_html: mobileFullHtml
    };
  }

  static async getCanvasFrames(canvasId: string, agentName = 'Antigravity'): Promise<any[]> {
    try {
      const res = await this.callDoopMcp('get_canvas', { canvas_id: canvasId, agent_name: agentName });
      return res?.frames || [];
    } catch (err: any) {
      console.warn(`[LayoutEngine] Erro ao obter frames do canvas ${canvasId}:`, err.message);
      return [];
    }
  }

  static async getFrameHtml(frameId: string, agentName = 'Antigravity'): Promise<string | null> {
    try {
      const res = await this.callDoopMcp('get_frame', { frame_id: frameId, agent_name: agentName });
      return res?.html || null;
    } catch (err: any) {
      console.warn(`[LayoutEngine] Erro ao obter HTML do frame ${frameId}:`, err.message);
      return null;
    }
  }

  static async getCanvasPreviewHtml(
    canvasId: string,
    viewport: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  ): Promise<string | null> {
    try {
      const frames = await this.getCanvasFrames(canvasId);
      if (viewport === 'mobile') {
        const mobileFrame = frames.find(
          (f: any) => f.name?.includes('Mobile Completo') || f.name?.includes('Mobile Integrada') || f.name?.includes('M01')
        );
        if (mobileFrame?.id) {
          const html = await this.getFrameHtml(mobileFrame.id);
          if (html) return html;
        }
      }
      // Desktop or fallback
      const desktopFrame = frames.find(
        (f: any) => f.name?.includes('Desktop Completo') || f.name?.includes('01 — Header')
      );
      if (desktopFrame?.id) {
        const html = await this.getFrameHtml(desktopFrame.id);
        if (html) return html;
      }
    } catch (err: any) {
      console.warn(`[LayoutEngine] Erro ao obter preview do canvas ${canvasId}:`, err.message);
    }
    return null;
  }
}
