import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import {
  PrototypeAdapter,
  PrototypeCapabilities,
  ConfirmedBriefInput,
  GenerationHandle,
  GenerationResult,
  Briefing,
  Lead
} from '../domain/types.js';
import { DOOP_DIR } from '../config.js';
import { optimizeGoogleCdnUrl } from './discoveryAdapter.js';
import { MediaEnricher } from './mediaEnricher.js';

export class DoopAdapter implements PrototypeAdapter {
  private port: number;
  private host: string;
  private baseDir: string;

  constructor(customPort = 4400, customHost = '127.0.0.1') {
    this.port = customPort;
    this.host = customHost;
    this.baseDir = DOOP_DIR;
  }

  async capabilities(): Promise<PrototypeCapabilities> {
    const isServerActive = await this.checkServer();
    return {
      canGenerateHtml: true, // Always supported via built-in high-fidelity engine
      canRenderScreenshot: true,
      canExportZip: true,
      hasMcpBridge: isServerActive,
      isMock: !isServerActive
    };
  }

  async checkServer(): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: '/health',
          method: 'GET',
          timeout: 1000
        },
        (res) => {
          resolve(res.statusCode !== undefined && res.statusCode < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  async generate(input: ConfirmedBriefInput): Promise<GenerationHandle> {
    const handleId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      id: handleId,
      leadId: input.leadId,
      status: 'completed'
    };
  }

  async status(handle: GenerationHandle): Promise<GenerationResult> {
    return {
      handleId: handle.id,
      status: 'completed',
      artifactType: 'html_prototype',
      url: `/api/prototypes/${handle.id}/preview`
    };
  }

  /**
   * Parses customer reviews from raw JSON string, array or delimiter-separated format
   */
  static parseLeadReviews(raw?: string | null): Array<{ author: string; rating: number; text: string; time?: string; avatar?: string }> {
    if (!raw || !raw.trim()) return [];
    try {
      const data = JSON.parse(raw);
      const arr = Array.isArray(data) ? data : (data.reviews || data.user_reviews || [data]);
      return arr.map((item: any) => {
        if (typeof item === 'string') {
          return { author: 'Cliente do Google', rating: 5, text: item };
        }
        let cleanText = item.text_original || item.Description || item.description || item.text || item.comment || item.snippet || '';
        if (cleanText.includes('(Original)')) {
          const parts = cleanText.split('(Original)');
          cleanText = parts[parts.length - 1].trim();
        }
        cleanText = cleanText.replace(/\(Translated by Google\)/gi, '').trim();

        return {
          author: item.Name || item.name || item.author || item.author_name || item.reviewer || 'Cliente do Google',
          rating: Math.min(5, Math.max(1, parseInt(item.Rating || item.rating || item.stars || '5', 10) || 5)),
          text: cleanText,
          time: item.When || item.when || item.time || item.date || item.publishedAt || item.published_at || undefined,
          avatar: item.ProfilePicture || item.profile_picture || item.avatar || item.photo || item.author_url || undefined
        };
      }).filter((r: any) => r.text && r.text.trim().length > 0);
    } catch {
      if (raw.includes(';') || raw.includes('||')) {
        return raw.split(/;|\|\|/).map(s => s.trim()).filter(Boolean).map(text => ({
          author: 'Cliente do Google',
          rating: 5,
          text
        }));
      }
      if (raw.trim().length > 5) {
        return [{ author: 'Cliente do Google', rating: 5, text: raw.trim() }];
      }
    }
    return [];
  }

  /**
   * Parses and structures real lead images (Google Maps thumbnail, photo gallery, logo, Street View facade)
   */
  static parseLeadImages(lead?: {
    thumbnailUrl?: string;
    logoUrl?: string;
    photos?: string | string[];
    latitude?: number | string;
    longitude?: number | string;
    streetViewUrl?: string;
  } | null): {
    heroImage?: string;
    logoUrl?: string;
    serviceImages: string[];
    locationImage?: string;
    hasRealPhotos: boolean;
  } {
    if (!lead) {
      return {
        serviceImages: [],
        hasRealPhotos: false
      };
    }

    let parsedPhotos: string[] = [];
    if (Array.isArray(lead.photos)) {
      parsedPhotos = lead.photos.filter(p => typeof p === 'string' && p.startsWith('http'));
    } else if (typeof lead.photos === 'string' && lead.photos.trim()) {
      try {
        const data = JSON.parse(lead.photos);
        if (Array.isArray(data)) {
          parsedPhotos = data.filter(p => typeof p === 'string' && p.startsWith('http'));
        }
      } catch {
        parsedPhotos = lead.photos
          .split(/[\n,;|]+/)
          .map(s => s.trim())
          .filter(s => s.startsWith('http'));
      }
    }

    let heroImage: string | undefined;
    let servicePhotoCandidates = [...parsedPhotos];

    if (lead.thumbnailUrl && lead.thumbnailUrl.startsWith('http')) {
      heroImage = optimizeGoogleCdnUrl(lead.thumbnailUrl, 'w1600-h900-p-k-no');
    } else if (servicePhotoCandidates.length > 0) {
      heroImage = optimizeGoogleCdnUrl(servicePhotoCandidates[0], 'w1600-h900-p-k-no');
      if (servicePhotoCandidates.length > 1) {
        servicePhotoCandidates = servicePhotoCandidates.slice(1);
      }
    }

    const logoUrl = lead.logoUrl && lead.logoUrl.startsWith('http')
      ? optimizeGoogleCdnUrl(lead.logoUrl, 's240-c-k-no')
      : undefined;

    const serviceImages = servicePhotoCandidates
      .map(url => optimizeGoogleCdnUrl(url, 'w800-h600-p-k-no'))
      .filter(Boolean);

    let locationImage = lead.streetViewUrl;
    if (!locationImage && lead.latitude !== undefined && lead.longitude !== undefined) {
      locationImage = MediaEnricher.getStreetViewUrl(lead.latitude, lead.longitude) || undefined;
    }

    const hasRealPhotos = Boolean(heroImage || logoUrl || serviceImages.length > 0);

    return {
      heroImage,
      logoUrl,
      serviceImages,
      locationImage,
      hasRealPhotos
    };
  }

  /**
   * Generates a modern, high-fidelity, responsive single-page prototype for the merchant
   * with segment-specific styling, high-resolution illustrative photos, Google Maps integration,
   * customer reviews, and floating WhatsApp conversion widget.
   */
  static renderPrototypeHtml(opts: Partial<Briefing> & {
    businessName: string;
    segment?: string;
    services?: string[];
    cta?: string;
    identityNotes?: string;
    address?: string;
    city?: string;
    rating?: string;
    reviewsCount?: string;
    userReviews?: string;
    phone?: string;
    mapsUrl?: string;
    theme?: string;
    thumbnailUrl?: string;
    logoUrl?: string;
    photos?: string | string[];
    latitude?: number | string;
    longitude?: number | string;
    streetViewUrl?: string;
  }): string {
    const title = opts.businessName || 'Empresa Local';
    const segment = opts.segment || 'Serviços Especializados';
    const cta = opts.cta || 'Fale Conosco pelo WhatsApp';
    const address = opts.address || '';
    const city = opts.city || 'Região';
    const ratingNum = opts.rating ? parseFloat(opts.rating).toFixed(1) : '5.0';
    const reviewsNum = opts.reviewsCount ? `${opts.reviewsCount} avaliações` : 'Avaliações no Google';
    const phoneRaw = opts.phone || '';
    const phoneClean = phoneRaw.replace(/\D/g, '');
    const waLink = phoneClean
      ? `https://wa.me/55${phoneClean}?text=${encodeURIComponent(`Olá! Conheci a ${title} pelo site e gostaria de um atendimento/agendamento.`)}`
      : '#contato';

    // Parse Real Images (Google Maps, Photos, WhatsApp/Social Logo, Street View Facade)
    const realImages = DoopAdapter.parseLeadImages({
      thumbnailUrl: opts.thumbnailUrl,
      logoUrl: opts.logoUrl,
      photos: opts.photos,
      latitude: opts.latitude,
      longitude: opts.longitude,
      streetViewUrl: opts.streetViewUrl
    });

    // Google Maps Links & Embed
    const queryAddress = address || `${title}, ${city}`;
    const mapsQuery = encodeURIComponent(queryAddress);
    const mapsSearchUrl = opts.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
    const mapsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
    const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    // Segment & Theme Selection (Pilar 1: Temas Visuais por Segmento)
    const forcedTheme = opts.theme || (opts.identityNotes && ['barber', 'health', 'gastro', 'auto_mechanic', 'corporate'].includes(opts.identityNotes) ? opts.identityNotes : null);
    const isBarber = forcedTheme === 'barber' || (!forcedTheme && /barber|barbearia|cabelo|barba|fade|navalha/i.test(`${segment} ${title}`));
    const isHealth = forcedTheme === 'health' || (!forcedTheme && /odonto|dente|dentista|clinica|médic|estetic|saude|fisioter|psico/i.test(`${segment} ${title}`));
    const isFood = forcedTheme === 'gastro' || (!forcedTheme && /restaurante|pizza|burg|hamburg|lanche|comida|gastro|bar|churras/i.test(`${segment} ${title}`));
    const isAuto = forcedTheme === 'auto_mechanic' || (!forcedTheme && /mecanic|auto|oficina|carro|moto|funilaria|pneu|guincho/i.test(`${segment} ${title}`));

    // Default: Corporate Modern
    let theme = {
      isDark: false,
      bodyBg: 'bg-slate-50',
      bodyText: 'text-slate-900',
      cardBg: 'bg-white',
      cardBorder: 'border-slate-200',
      accentColor: 'blue-600',
      accentHover: 'hover:bg-blue-700',
      accentText: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeDot: 'bg-blue-600',
      heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Referência em ' + segment,
      headline: 'Qualidade e agilidade para o seu atendimento em ' + city,
      subheadline: `Conheça os serviços especializados da ${title}. Atendimento com hora marcada e foco total na sua satisfação.`,
      serviceImages: [
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80'
      ],
      defaultServices: [
        { title: 'Atendimento Personalizado', desc: 'Atendimento com horário agendado, pontualidade e dedicação total.', time: 'Horário flexível' },
        { title: 'Serviços Especializados', desc: 'Técnicas atualizadas e materiais de alto padrão para o melhor resultado.', time: 'Sob medida' },
        { title: 'Orçamento Transparente', desc: 'Sem surpresas: clareza nos preços e compromisso com o melhor custo-benefício.', time: 'Rápido' },
        { title: 'Garantia de Satisfação', desc: 'Profissionais dedicados e focados na excelência e fidelização dos clientes.', time: '100% Confiável' }
      ]
    };

    if (isBarber) {
      theme = {
        isDark: true,
        bodyBg: 'bg-[#0c0c0e]',
        bodyText: 'text-zinc-100',
        cardBg: 'bg-[#141418]',
        cardBorder: 'border-zinc-800',
        accentColor: 'amber-500',
        accentHover: 'hover:bg-amber-400',
        accentText: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        badgeDot: 'bg-amber-400',
        heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
        tagline: 'Barbearia Premium • Tradição & Estilo',
        headline: 'Estilo impecável, barba de respeito e ambiente exclusivo',
        subheadline: `Eleve sua autoestima na ${title}. Técnicas clássicas com navalha, toalha quente e os melhores cortes modernos para você se destacar em ${city}.`,
        serviceImages: [
          'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&w=600&q=80'
        ],
        defaultServices: [
          { title: 'Corte Degradê & Social', desc: 'Fade, militar, scumbag boogie ou clássico com acabamento milimétrico na navalha.', time: '40 min' },
          { title: 'Barba Terapia Tradicional', desc: 'Alinhamento preciso com toalha quente aromatizada, óleos hidratantes e pós-barba.', time: '30 min' },
          { title: 'Combo Cabelo + Barba', desc: 'O pacote completo para sair renovado. Inclui lavagem com shampoo mentolado e finalização.', time: '1h 10 min' },
          { title: 'Acabamento & Sobrancelha', desc: 'Desenho de pezinho, sobrancelha na navalha e limpeza de contorno facial.', time: '20 min' }
        ]
      };
    } else if (isHealth) {
      theme = {
        isDark: false,
        bodyBg: 'bg-slate-50',
        bodyText: 'text-slate-900',
        cardBg: 'bg-white',
        cardBorder: 'border-emerald-100',
        accentColor: 'emerald-600',
        accentHover: 'hover:bg-emerald-700',
        accentText: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeDot: 'bg-emerald-500',
        heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
        tagline: 'Saúde, Cuidado e Bem-Estar',
        headline: 'Seu sorriso e saúde em primeiro lugar com atendimento humanizado',
        subheadline: `Consultas e tratamentos com os melhores profissionais na ${title}. Agendamento rápido e seguro em ${city}.`,
        serviceImages: [
          'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
        ],
        defaultServices: [
          { title: 'Avaliação Completa', desc: 'Diagnóstico detalhado com equipamentos modernos e plano individual.', time: '30 min' },
          { title: 'Procedimentos Preventivos', desc: 'Limpeza, profilaxia e cuidados essenciais para manter sua saúde em dia.', time: '45 min' },
          { title: 'Tratamentos Especiais', desc: 'Soluções avançadas com tecnologia e total conforto durante a sessão.', time: 'Sob consulta' },
          { title: 'Acompanhamento Contínuo', desc: 'Suporte pós-atendimento para você ter total segurança e tranquilidade.', time: 'Dedicado' }
        ]
      };
    } else if (isFood) {
      theme = {
        isDark: true,
        bodyBg: 'bg-[#140f0f]',
        bodyText: 'text-zinc-100',
        cardBg: 'bg-[#1c1516]',
        cardBorder: 'border-rose-950/60',
        accentColor: 'rose-600',
        accentHover: 'hover:bg-rose-500',
        accentText: 'text-rose-400',
        badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        badgeDot: 'bg-rose-500',
        heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        tagline: 'Gastronomia & Sabor Autêntico',
        headline: 'Experiência gastronômica marcante do primeiro ao último pedaço',
        subheadline: `Pratos preparados com ingredientes nobres e carinho na ${title}. Peça pelo WhatsApp ou visite nosso ambiente climatizado em ${city}.`,
        serviceImages: [
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
        ],
        defaultServices: [
          { title: 'Pratos Especiais do Chef', desc: 'Combinações exclusivas e guarnições frescas feitas para surpreender.', time: 'Preparo 25 min' },
          { title: 'Pizzas & Hambúrgueres Artesanais', desc: 'Massas de fermentação natural e carnes nobres grelhadas no fogo.', time: 'Sob medida' },
          { title: 'Porções & Entradas Crocantes', desc: 'Petiscos saborosos e molhos caseiros perfeitos para acompanhar.', time: '15 min' },
          { title: 'Delivery Térmico & Retirada', desc: 'Receba quentinho e rápido na sua casa com pedido direto no WhatsApp.', time: 'Entrega ágil' }
        ]
      };
    } else if (isAuto) {
      theme = {
        isDark: true,
        bodyBg: 'bg-[#0b0f19]',
        bodyText: 'text-slate-100',
        cardBg: 'bg-[#111827]',
        cardBorder: 'border-slate-800',
        accentColor: 'yellow-500',
        accentHover: 'hover:bg-yellow-400',
        accentText: 'text-yellow-400',
        badgeBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
        badgeDot: 'bg-yellow-400',
        heroImage: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80',
        tagline: 'Oficina Mecânica & Centro Automotivo',
        headline: 'Segurança, precisão e confiança total para seu veículo',
        subheadline: `Mecânica especializada, peças de procedência e diagnóstico eletrônico computadorizado na ${title}. Orçamento transparente em ${city}.`,
        serviceImages: [
          'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80'
        ],
        defaultServices: [
          { title: 'Revisão Preventiva & Freios', desc: 'Inspeção completa de segurança com troca de pastilhas e discos.', time: 'Mesmo dia' },
          { title: 'Suspensão, Alinhamento & Pneus', desc: 'Alinhamento 3D computadorizado e balanceamento para rodar macio.', time: '1h' },
          { title: 'Troca de Óleo & Filtros Genuínos', desc: 'Lubrificantes de alta performance com recomendação de fábrica.', time: '30 min' },
          { title: 'Diagnóstico & Injeção Eletrônica', desc: 'Leitura com scanner automotivo para apagar luzes e falhas de painel.', time: 'Rápido' }
        ]
      };
    }

    // Build services array with real lead images or fallback images (Pilar 3: Vitrine & Imagens Ilustrativas)
    const rawServices = opts.services && opts.services.length > 0 ? opts.services : [];
    const servicesList = theme.defaultServices.map((def, idx) => {
      const customName = rawServices[idx];
      const hasRealImg = realImages.serviceImages.length > idx;
      const img = hasRealImg ? realImages.serviceImages[idx] : theme.serviceImages[idx % theme.serviceImages.length];
      return {
        title: customName || def.title,
        desc: def.desc,
        time: def.time,
        img,
        isRealPhoto: hasRealImg
      };
    });

    // Parse Real Reviews or prepare contextual defaults
    const parsedReviews = DoopAdapter.parseLeadReviews(opts.userReviews);
    const defaultTestimonials = [
      {
        author: 'Matheus Oliveira',
        rating: 5,
        text: isBarber 
          ? 'Atendimento de primeira qualidade! Pontualidade impecável, ambiente top e o corte ficou exatamente como pedi. Recomendo de olhos fechados!'
          : isHealth
          ? 'Profissionais extremamente dedicados e ambiente acolhedor. Tratamento sem dor e resultado impecável!'
          : isFood
          ? 'Comida maravilhosa, tempero caseiro no ponto e entrega super rápida. Já virei cliente fiel!'
          : 'Excelente atendimento, transparência no orçamento e entrega no prazo combinado. Recomendo muito!',
        time: 'Cliente Verificado no Google'
      },
      {
        author: 'Rodrigo Santos',
        rating: 5,
        text: isBarber
          ? `Barba feita na toalha quente é uma experiência sem igual. A ${title} é com certeza a melhor referência em ${city}.`
          : isHealth
          ? `Clínica de altíssimo nível em ${city}. Todo o suporte pré e pós-atendimento foi exemplar.`
          : isFood
          ? `Melhor experiência gastronômica de ${city}. Sabor inigualável e atendimento nota 10!`
          : `Equipe muito competente e honesta em ${city}. Resolveram o problema com agilidade e preço justo.`,
        time: 'Cliente Verificado no Google'
      },
      {
        author: 'Camila Ferreira',
        rating: 5,
        text: 'Facilidade para agendar pelo WhatsApp e sem espera ao chegar. Profissionalismo e respeito com o tempo do cliente.',
        time: 'Cliente Verificado no Google'
      }
    ];

    const finalReviews = parsedReviews.length >= 3
      ? parsedReviews.slice(0, 3)
      : [...parsedReviews, ...defaultTestimonials.slice(parsedReviews.length)].slice(0, 3);

    return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${segment}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .heading-font { font-family: ${isBarber ? "'Oswald', sans-serif" : "'Plus Jakarta Sans', sans-serif"}; }
    .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .card-hover:hover { transform: translateY(-5px); }
  </style>
</head>
<body class="${theme.bodyBg} ${theme.bodyText} antialiased selection:bg-amber-500 selection:text-black">

  <!-- Top Announcement Bar -->
  <div class="${theme.isDark ? 'bg-amber-500 text-black' : 'bg-slate-900 text-white'} text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-2 tracking-wide uppercase">
    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    <span>Demonstração visual personalizada desenvolvida para <strong>${title}</strong> • Horários disponíveis hoje</span>
  </div>

  <!-- Header / Navigation -->
  <header class="sticky top-0 z-40 ${theme.isDark ? 'bg-[#0c0c0e]/95 border-zinc-800/80' : 'bg-white/95 border-slate-200'} backdrop-blur-md border-b">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl overflow-hidden ${theme.isDark ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border border-zinc-700' : 'bg-blue-600 text-white border border-slate-200'} flex items-center justify-center font-extrabold text-2xl shadow-lg shrink-0">
          ${realImages.logoUrl ? `
            <img src="${realImages.logoUrl}" alt="${title}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='${isBarber ? `<svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><circle cx=\"6\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><line x1=\"20\" y1=\"4\" x2=\"8.12\" y2=\"15.88\"/><line x1=\"14.47\" y1=\"14.48\" x2=\"20\" y2=\"20\"/><line x1=\"8.12\" y1=\"8.12\" x2=\"12\" y2=\"12\"/></svg>` : title.charAt(0).toUpperCase()}';" />
          ` : (isBarber ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>` : title.charAt(0).toUpperCase())}
        </div>
        <div>
          <span class="font-extrabold text-lg tracking-tight block ${theme.isDark ? 'text-white' : 'text-slate-900'}">${title}</span>
          <span class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-500'} block">${segment} • ${city}</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-7 text-sm font-semibold ${theme.isDark ? 'text-zinc-300' : 'text-slate-600'}">
        <a href="#inicio" class="hover:text-amber-400 transition-colors">Início</a>
        <a href="#servicos" class="hover:text-amber-400 transition-colors">Serviços</a>
        <a href="#onde-estamos" class="hover:text-amber-400 transition-colors">Onde Estamos</a>
        <a href="#avaliacoes" class="hover:text-amber-400 transition-colors">Avaliações</a>
        <a href="#duvidas" class="hover:text-amber-400 transition-colors">Dúvidas</a>
      </nav>

      <div>
        <button onclick="openBookingModal('Atendimento')" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ${theme.isDark ? 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold' : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'} text-sm shadow-md transition-all cursor-pointer">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
          ${cta}
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="inicio" class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Left Content -->
        <div class="lg:col-span-7 text-left">
          
          <!-- Badges: Segment + Google Rating -->
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme.badgeBg} text-xs font-bold tracking-wide">
              <span class="w-2 h-2 rounded-full ${theme.badgeDot} animate-ping"></span>
              ${theme.tagline}
            </span>

            <a href="${mapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${theme.isDark ? 'bg-zinc-800/80 text-amber-300 border border-zinc-700' : 'bg-amber-50 text-amber-800 border border-amber-200'} text-xs font-bold hover:scale-105 transition-transform">
              <svg class="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>${ratingNum}</span>
              <span class="${theme.isDark ? 'text-zinc-400' : 'text-amber-600'} font-normal">(${reviewsNum})</span>
              <span class="text-[10px] uppercase tracking-wider ml-1 bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">Google</span>
            </a>

            ${realImages.heroImage ? `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${theme.isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} text-xs font-bold">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>Fotos Reais Verificadas</span>
            </span>
            ` : ''}
          </div>

          <h1 class="heading-font text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${theme.isDark ? 'text-white' : 'text-slate-900'} leading-[1.1] mb-6 uppercase">
            ${theme.headline}
          </h1>

          <p class="text-base sm:text-lg ${theme.isDark ? 'text-zinc-300' : 'text-slate-600'} mb-8 leading-relaxed max-w-xl">
            ${theme.subheadline}
          </p>

          <!-- Dual CTAs -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
            <button onclick="openBookingModal('Atendimento Geral')" class="px-8 py-4 rounded-xl ${theme.isDark ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-extrabold text-base shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              ${cta}
            </button>

            <a href="#onde-estamos" class="px-6 py-4 rounded-xl ${theme.isDark ? 'bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'} font-bold text-sm text-center transition-all flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Como Chegar & Localização
            </a>
          </div>

          <!-- Highlight Badges -->
          <div class="grid grid-cols-3 gap-4 pt-6 border-t ${theme.isDark ? 'border-zinc-800' : 'border-slate-200'}">
            <div>
              <div class="flex items-center gap-1.5 text-2xl font-black ${theme.accentText}">
                <svg class="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>${ratingNum}</span>
              </div>
              <div class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-500'}">Nota Máxima Google</div>
            </div>
            <div>
              <div class="text-2xl font-black ${theme.accentText}">100%</div>
              <div class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-500'}">Hora Marcada</div>
            </div>
            <div>
              <div class="text-2xl font-black ${theme.accentText}">${city}</div>
              <div class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-500'}">Região Central</div>
            </div>
          </div>
        </div>

        <!-- Right Visual Showcase -->
        <div class="lg:col-span-5 relative">
          <div class="relative rounded-3xl overflow-hidden border ${theme.isDark ? 'border-amber-500/30' : 'border-slate-300'} shadow-2xl">
            <img src="${realImages.heroImage || theme.heroImage}" alt="${title}" class="w-full h-[460px] object-cover object-center transform hover:scale-105 transition-transform duration-700" />
            
            <div class="absolute inset-0 bg-gradient-to-t ${theme.isDark ? 'from-black/90 via-black/30 to-transparent' : 'from-slate-950/70 to-transparent'}"></div>
            
            <!-- Floating Overlay Card -->
            <div class="absolute bottom-6 left-6 right-6 p-5 rounded-2xl ${theme.isDark ? 'bg-zinc-900/90 border border-zinc-700' : 'bg-white/95 border border-slate-200'} backdrop-blur-md">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider ${theme.accentText}">
                  ${realImages.heroImage ? 'Foto Oficial do Espaço' : 'Experiência Exclusiva'}
                </span>
                <span class="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Aberto Hoje
                </span>
              </div>
              <div class="text-sm font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}">${title}</div>
              <div class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-500'} truncate">${address || city}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- Services Showcase with Real Imagery -->
  <section id="servicos" class="py-20 ${theme.isDark ? 'bg-[#101014] border-y border-zinc-800' : 'bg-white border-y border-slate-200'}">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs font-bold uppercase tracking-widest ${theme.accentText}">Serviços & Especialidades</span>
        <h2 class="heading-font text-3xl sm:text-4xl font-extrabold ${theme.isDark ? 'text-white' : 'text-slate-900'} mt-2 uppercase">
          Tudo o que você precisa em um só lugar
        </h2>
        <p class="text-sm ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} mt-3">
          Procedimentos executados com os melhores equipamentos, produtos de primeira linha e técnicas de ponta.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${servicesList.map((srv, idx) => `
          <div class="rounded-2xl overflow-hidden ${theme.cardBg} border ${theme.cardBorder} card-hover flex flex-col h-full shadow-lg">
            <div class="relative h-44 overflow-hidden">
              <img src="${srv.img}" alt="${srv.title}" class="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-500" />
              <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full ${theme.isDark ? 'bg-black/70 text-amber-300' : 'bg-white/90 text-slate-800'} text-[11px] font-bold backdrop-blur-sm flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>${srv.time}</span>
              </div>
              ${srv.isRealPhoto ? `
              <div class="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/75 text-emerald-400 text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                <svg class="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                <span>Foto Real</span>
              </div>
              ` : ''}
            </div>
            
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="font-bold text-base ${theme.isDark ? 'text-white' : 'text-slate-900'} mb-2">${srv.title}</h3>
                <p class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} leading-relaxed mb-4">${srv.desc}</p>
              </div>

              <div class="pt-4 border-t ${theme.isDark ? 'border-zinc-800' : 'border-slate-100'} flex items-center justify-between">
                <span class="text-xs font-semibold ${theme.accentText}">Agendamento Rápido</span>
                <button onclick="openBookingModal('${srv.title}')" class="text-xs font-bold px-3 py-1.5 rounded-lg ${theme.isDark ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'} transition-all cursor-pointer">
                  Reservar →
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  </section>

  <!-- Google Maps & Onde Estamos Section -->
  <section id="onde-estamos" class="py-20 ${theme.isDark ? 'bg-[#0c0c0e]' : 'bg-slate-50'}">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        <!-- Left Details Card -->
        <div class="lg:col-span-5 p-8 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} shadow-xl flex flex-col justify-between">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme.badgeBg} text-xs font-bold mb-4">
              <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Localização & Contato
            </div>

            ${realImages.locationImage ? `
            <div class="mb-5 rounded-2xl overflow-hidden border ${theme.cardBorder} relative h-40">
              <img src="${realImages.locationImage}" alt="Fachada de ${title}" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/75 text-white text-[11px] font-bold backdrop-blur-sm flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>Fachada / Street View</span>
              </div>
            </div>
            ` : ''}

            <h3 class="heading-font text-3xl font-extrabold ${theme.isDark ? 'text-white' : 'text-slate-900'} uppercase mb-4">
              Fácil Acesso em ${city}
            </h3>

            <p class="text-sm ${theme.isDark ? 'text-zinc-300' : 'text-slate-600'} leading-relaxed mb-6">
              Visite nosso espaço climatizado e confortável. Estacionamento facilitado e localização privilegiada.
            </p>

            <!-- Address Block -->
            <div class="space-y-4 mb-6 text-sm">
              <div class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg ${theme.isDark ? 'bg-zinc-800 text-amber-400' : 'bg-slate-100 text-blue-600'} flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <div class="font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}">Endereço:</div>
                  <div class="${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} text-xs leading-relaxed">
                    ${address || `${title} - Baldim / Região Metropolitana de Belo Horizonte`}
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg ${theme.isDark ? 'bg-zinc-800 text-amber-400' : 'bg-slate-100 text-blue-600'} flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <div>
                  <div class="font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}">Horário de Funcionamento:</div>
                  <div class="${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} text-xs">
                    Segunda a Sábado: 08:30 às 19:30
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <span class="w-7 h-7 rounded-lg ${theme.isDark ? 'bg-zinc-800 text-amber-400' : 'bg-slate-100 text-blue-600'} flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                </span>
                <div>
                  <div class="font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}">WhatsApp Oficial:</div>
                  <div class="${theme.accentText} font-bold text-xs">
                    ${phoneRaw || 'Atendimento Direto'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Maps Action Buttons -->
          <div class="pt-4 border-t ${theme.isDark ? 'border-zinc-800' : 'border-slate-200'} flex flex-col sm:flex-row gap-3">
            <a href="${mapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl ${theme.isDark ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-bold text-xs text-center flex items-center justify-center gap-2 transition-all">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Abrir no Google Maps
            </a>
            
            <a href="${mapsRouteUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 px-4 rounded-xl ${theme.isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'} font-bold text-xs text-center flex items-center justify-center gap-2 transition-all">
              <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Traçar Rota (GPS)
            </a>
          </div>

        </div>

        <!-- Right Interactive Map Embed -->
        <div class="lg:col-span-7 rounded-3xl overflow-hidden border ${theme.cardBorder} shadow-2xl relative min-h-[380px] bg-zinc-900">
          <iframe 
            class="w-full h-full min-h-[380px] border-0" 
            src="${mapsEmbedUrl}" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            title="Localização ${title} no Google Maps">
          </iframe>
          
          <div class="absolute top-4 right-4 bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Pin Verificado
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- Google Reviews & Social Proof -->
  <section id="avaliacoes" class="py-20 ${theme.isDark ? 'bg-[#101014] border-t border-zinc-800' : 'bg-white border-t border-slate-200'}">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-14">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest ${theme.accentText}">Avaliações Reais</span>
          <h2 class="heading-font text-3xl font-extrabold ${theme.isDark ? 'text-white' : 'text-slate-900'} mt-1 uppercase">
            O que nossos clientes dizem
          </h2>
        </div>
        <div class="mt-4 md:mt-0 flex items-center gap-2">
          <div class="flex items-center gap-1 text-amber-400">
            <svg class="w-5 h-5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg class="w-5 h-5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg class="w-5 h-5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg class="w-5 h-5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg class="w-5 h-5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <span class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} font-semibold">Nota ${ratingNum} de 5.0 no Google Maps</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${finalReviews.map(rev => `
        <div class="p-6 rounded-2xl ${theme.cardBg} border ${theme.cardBorder} shadow-md flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-0.5 text-amber-400 mb-3">
              ${Array.from({ length: rev.rating || 5 }).map(() => `
                <svg class="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              `).join('')}
            </div>
            <p class="text-xs ${theme.isDark ? 'text-zinc-300' : 'text-slate-600'} leading-relaxed mb-4">
              "${rev.text.replace(/"/g, '&quot;')}"
            </p>
          </div>
          <div class="flex items-center gap-3 pt-3 border-t ${theme.isDark ? 'border-zinc-800' : 'border-slate-100'}">
            <div class="w-9 h-9 rounded-full overflow-hidden ${theme.isDark ? 'bg-amber-500/20 text-amber-400 border border-zinc-700' : 'bg-slate-100 text-blue-600 border border-slate-200'} flex items-center justify-center font-bold text-xs shrink-0">
              ${rev.avatar ? `
                <img src="${rev.avatar}" alt="${rev.author}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerText='${(rev.author || 'C').charAt(0).toUpperCase()}';" />
              ` : (rev.author || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}">${rev.author}</div>
              <div class="text-[10px] text-emerald-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${rev.time || 'Cliente Verificado no Google'}</span>
              </div>
            </div>
          </div>
        </div>
        `).join('')}
      </div>

    </div>
  </section>

  <!-- Interactive FAQ Accordion -->
  <section id="duvidas" class="py-16 ${theme.isDark ? 'bg-[#0c0c0e]' : 'bg-slate-50'}">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      
      <div class="text-center mb-10">
        <h3 class="heading-font text-2xl sm:text-3xl font-extrabold ${theme.isDark ? 'text-white' : 'text-slate-900'} uppercase">
          Dúvidas Frequentes
        </h3>
        <p class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} mt-1">
          Respostas rápidas para você agendar com total tranquilidade
        </p>
      </div>

      <div class="space-y-3">
        <div class="rounded-xl ${theme.cardBg} border ${theme.cardBorder} overflow-hidden">
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full p-4 text-left font-bold text-sm flex items-center justify-between ${theme.isDark ? 'text-white' : 'text-slate-900'}">
            <span>Preciso agendar com antecedência?</span>
            <span class="${theme.accentText}">+</span>
          </button>
          <div class="p-4 pt-0 text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} border-t ${theme.cardBorder} hidden">
            Sim! Para garantir que você não perca tempo esperando, trabalhamos prioritariamente com hora marcada direto pelo WhatsApp.
          </div>
        </div>

        <div class="rounded-xl ${theme.cardBg} border ${theme.cardBorder} overflow-hidden">
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full p-4 text-left font-bold text-sm flex items-center justify-between ${theme.isDark ? 'text-white' : 'text-slate-900'}">
            <span>Quais as formas de pagamento aceitas?</span>
            <span class="${theme.accentText}">+</span>
          </button>
          <div class="p-4 pt-0 text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} border-t ${theme.cardBorder} hidden">
            Aceitamos Pix com confirmação imediata, cartões de crédito e débito de todas as bandeiras e dinheiro em espécie.
          </div>
        </div>

        <div class="rounded-xl ${theme.cardBg} border ${theme.cardBorder} overflow-hidden">
          <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full p-4 text-left font-bold text-sm flex items-center justify-between ${theme.isDark ? 'text-white' : 'text-slate-900'}">
            <span>Como chegar até o local?</span>
            <span class="${theme.accentText}">+</span>
          </button>
          <div class="p-4 pt-0 text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-600'} border-t ${theme.cardBorder} hidden">
            Estamos situados em ${address || city}. Você pode clicar no botão "Traçar Rota no GPS" acima para abrir o Waze ou Google Maps direto no seu celular.
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Final CTA Banner -->
  <section class="py-16 ${theme.isDark ? 'bg-gradient-to-b from-[#141418] to-[#0c0c0e]' : 'bg-slate-900 text-white'} text-center border-t ${theme.cardBorder}">
    <div class="max-w-3xl mx-auto px-4">
      <h2 class="heading-font text-3xl sm:text-4xl font-extrabold ${theme.isDark ? 'text-white' : 'text-white'} uppercase mb-4">
        Pronto para renovar seu estilo?
      </h2>
      <p class="text-sm ${theme.isDark ? 'text-zinc-300' : 'text-slate-300'} mb-8 max-w-xl mx-auto">
        Agende seu horário com a ${title} em poucos segundos pelo WhatsApp sem burocracia.
      </p>
      <button onclick="openBookingModal('Atendimento Exclusivo')" class="inline-flex items-center gap-3 px-8 py-4 rounded-xl ${theme.isDark ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} font-black text-base shadow-2xl transition-transform hover:scale-105 cursor-pointer">
        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
        ${cta}
      </button>
    </div>
  </section>

  <!-- Floating WhatsApp Widget -->
  <aside class="fixed bottom-6 right-6 z-50 flex items-center gap-3">
    <div class="hidden sm:flex items-center gap-1.5 ${theme.isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'} px-3.5 py-2 rounded-2xl shadow-xl border text-xs font-semibold animate-bounce">
      <svg class="w-3.5 h-3.5 fill-emerald-500 shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
      <span>Fale conosco agora!</span>
    </div>
    <a href="${waLink}" target="_blank" rel="noopener noreferrer" title="Chamar no WhatsApp" class="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 hover:scale-110 transition-transform relative">
      <span class="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-300 ring-2 ring-white animate-ping"></span>
      <span class="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white"></span>
      <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
    </a>
  </aside>

  <!-- Interactive Booking Modal (Pilar 4: Conversão) -->
  <div id="bookingModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="w-full max-w-md rounded-2xl ${theme.isDark ? 'bg-zinc-900 border border-zinc-700 text-white' : 'bg-white border border-slate-200 text-slate-900'} p-6 shadow-2xl relative">
      <button onclick="closeBookingModal()" class="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors" aria-label="Fechar">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      
      <div class="flex items-center gap-2 mb-4">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-bold uppercase tracking-wider ${theme.accentText}">Agendamento Inteligente</span>
      </div>
      
      <h3 class="text-xl font-black uppercase mb-1">Agendar Horário na ${title}</h3>
      <p class="text-xs ${theme.isDark ? 'text-zinc-400' : 'text-slate-500'} mb-5">Escolha seu serviço e período preferido. Confirmaremos direto no seu WhatsApp.</p>
      
      <div class="space-y-3.5 mb-6">
        <div>
          <label class="block text-xs font-bold mb-1">Serviço Desejado</label>
          <select id="modalServiceSelect" class="w-full px-3.5 py-2.5 rounded-xl ${theme.isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'} text-xs font-semibold focus:outline-none">
            ${servicesList.map(s => `<option value="${s.title}">${s.title} (${s.time})</option>`).join('')}
          </select>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold mb-1">Dia de Preferência</label>
            <select id="modalDaySelect" class="w-full px-3.5 py-2.5 rounded-xl ${theme.isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'} text-xs font-semibold focus:outline-none">
              <option value="Hoje">Hoje</option>
              <option value="Amanhã">Amanhã</option>
              <option value="Próxima Sexta">Sexta-feira</option>
              <option value="Próximo Sábado">Sábado</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1">Período</label>
            <select id="modalPeriodSelect" class="w-full px-3.5 py-2.5 rounded-xl ${theme.isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'} text-xs font-semibold focus:outline-none">
              <option value="Manhã (09h - 12h)">Manhã (09h - 12h)</option>
              <option value="Tarde (13h - 17h)">Tarde (13h - 17h)</option>
              <option value="Noite (18h - 20h)">Noite (18h - 20h)</option>
            </select>
          </div>
        </div>
      </div>
      
      <button onclick="confirmBooking()" class="w-full py-3.5 rounded-xl ${theme.isDark ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black' : 'bg-emerald-600 text-white'} font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
        Confirmar e Abrir no WhatsApp
      </button>
    </div>
  </div>

  <!-- Footer -->
  <footer class="py-8 ${theme.isDark ? 'bg-black border-t border-zinc-900 text-zinc-500' : 'bg-white border-t border-slate-200 text-slate-500'} text-center text-xs">
    <div class="max-w-6xl mx-auto px-4">
      <p>© ${new Date().getFullYear()} ${title}. Todos os direitos reservados.</p>
      <p class="mt-1 text-[11px] opacity-75">Demonstração e protótipo de alta fidelidade integrado via Prospec.</p>
    </div>
  </footer>

  <script>
    function openBookingModal(serviceName) {
      var modal = document.getElementById('bookingModal');
      if (modal) {
        if (serviceName) {
          var select = document.getElementById('modalServiceSelect');
          if (select) {
            for (var i = 0; i < select.options.length; i++) {
              if (select.options[i].value === serviceName) {
                select.selectedIndex = i;
                break;
              }
            }
          }
        }
        modal.classList.remove('hidden');
      }
    }
    function closeBookingModal() {
      var modal = document.getElementById('bookingModal');
      if (modal) modal.classList.add('hidden');
    }
    function confirmBooking() {
      var service = document.getElementById('modalServiceSelect').value;
      var day = document.getElementById('modalDaySelect').value;
      var period = document.getElementById('modalPeriodSelect').value;
      var msg = "Olá! Gostaria de agendar: " + service + " para " + day + " no período da " + period + " na ${title}.";
      var phone = "${phoneClean}";
      var url = phone 
        ? "https://wa.me/55" + phone + "?text=" + encodeURIComponent(msg)
        : "#contato";
      window.open(url, '_blank');
      closeBookingModal();
    }
  </script>

</body>
</html>`;
  }
}

