/**
 * Humanized Commercial Pitch Generator for WhatsApp
 * Follows strict principles:
 * 1. Personalize: mention business type, client audience, reviews, and specific services.
 * 2. Concrete benefit: facilitate service consulting & WhatsApp contact, no inflated sales promises.
 * 3. Zero defect pointing: avoid confrontation ('vocês não têm site' / 'estão perdendo clientes').
 * 4. Simple low-friction closing question: ask to send the preview rather than asking for a meeting.
 * 5. Authentic state: distinguish whether preview is already ready or offering to prepare.
 */

import type { Lead } from './types.js';

export interface NicheContext {
  term: string;           // 'o salão', 'a barbearia', 'a clínica', etc.
  article: string;        // 'o', 'a'
  clientTerm: string;     // 'das clientes', 'dos clientes', 'dos pacientes', 'dos tutores'
  servicesPhrase: string; // 'ver os serviços (como cabelo, unhas e procedimentos)'
  servicesShort: string;  // 'os serviços e procedimentos'
  whoPhrase: string;      // 'quem ainda não conhece o salão'
  actionPhrase: string;   // 'consultar um horário pelo WhatsApp'
}

export interface PitchOptions {
  senderName?: string;             // Defaults to 'Geovane'
  variantIndex?: number;           // 0, 1, 2
  isReady?: boolean;               // default: true (preview prepared)
  mentionReviewSnippet?: boolean;
  customService?: string;
  customSentence?: string;
}

export interface PitchVariation {
  id: number;
  title: string;
  badge: string;
  text: string;
}

export function cleanBusinessName(rawName: string): string {
  if (!rawName) return '';
  let name = rawName.trim();
  // Strip trailing address if appended (e.g. "Name - R. Padre Rolim, 143...")
  name = name.split(/\s*[-–—|]\s*(?:R\.|Av\.|Rua|Avenida|Rodovia|Praça|Bairro|CEP|\d{5})/i)[0].trim();
  // Strip city suffixes if separated by dash or pipe (e.g. "Auto Peças - Contagem")
  name = name.split(/\s*[-–—|]\s*(?:Belo Horizonte|Contagem|Betim|Nova Lima|Sabará|Ibirité|Santa Luzia|Ribeirão das Neves|Vespasiano|Brumadinho|Lagoa Santa)\b/i)[0].trim();
  return name || rawName.trim();
}

export function detectNicheContext(lead: { name: string; category?: string }): NicheContext {
  const combined = `${lead.category || ''} ${lead.name || ''}`.toLowerCase();

  // 1. Salão de Beleza / Estética / Cabelo / Manicure / Unhas / Sobrancelha
  if (/sal[aã]o|est[eé]tica|cabel|manicur|unha|sobrancelh|beleza|beauty|hair|lash|depila|esmalteria/i.test(combined)) {
    const isStudio = /studio|est[uú]dio/i.test(combined);
    return {
      term: isStudio ? 'o estúdio' : 'o salão',
      article: 'o',
      clientTerm: 'das clientes',
      servicesPhrase: 'ver os serviços (como cabelo, unhas e procedimentos)',
      servicesShort: 'os serviços e procedimentos',
      whoPhrase: isStudio ? 'quem ainda não conhece o estúdio' : 'quem ainda não conhece o salão',
      actionPhrase: 'consultar um horário pelo WhatsApp'
    };
  }

  // 2. Barbearia / Barber / Barbeiro
  if (/barbe|barba/i.test(combined)) {
    return {
      term: 'a barbearia',
      article: 'a',
      clientTerm: 'dos clientes',
      servicesPhrase: 'ver os serviços (corte, barba e combos)',
      servicesShort: 'os serviços de corte e barba',
      whoPhrase: 'quem ainda não conhece a barbearia',
      actionPhrase: 'consultar um horário pelo WhatsApp'
    };
  }

  // 3. Odontologia / Dentista / Consultório Dental
  if (/dent|odonto|orto|sorriso|dental/i.test(combined)) {
    const isConsultorio = /consult[oó]rio/i.test(combined);
    return {
      term: isConsultorio ? 'o consultório' : 'a clínica',
      article: isConsultorio ? 'o' : 'a',
      clientTerm: 'dos pacientes',
      servicesPhrase: 'conhecer os tratamentos e especialidades',
      servicesShort: 'os tratamentos',
      whoPhrase: 'quem busca atendimento odontológico na região',
      actionPhrase: 'tirar dúvidas e consultar horários pelo WhatsApp'
    };
  }

  // 4. Saúde / Clínica Médica / Fisioterapia / Psicologia / Oftalmologia
  if (/cl[ií]nica|sa[uú]de|m[eé]dic|fisio|psico|oftalmo|terapia/i.test(combined)) {
    return {
      term: 'a clínica',
      article: 'a',
      clientTerm: 'dos pacientes',
      servicesPhrase: 'conhecer as especialidades e atendimentos',
      servicesShort: 'os atendimentos e consultas',
      whoPhrase: 'quem busca atendimento de saúde na região',
      actionPhrase: 'tirar dúvidas ou agendar pelo WhatsApp'
    };
  }

  // 5. Pet Shop / Veterinária / Banho e Tosa (tested before auto/repair)
  if (/pet|veterin[aá]ri|banho e tosa|ra[cç][aã]o|animal|c[aã]o|gato/i.test(combined)) {
    const isVet = /veterin[aá]ri/i.test(combined);
    return {
      term: isVet ? 'a clínica veterinária' : 'o pet shop',
      article: isVet ? 'a' : 'o',
      clientTerm: 'dos tutores e clientes',
      servicesPhrase: 'ver os serviços (banho, tosa e cuidados)',
      servicesShort: 'os serviços e cuidados para o pet',
      whoPhrase: 'quem procura cuidados para pet na região',
      actionPhrase: 'agendar um horário pelo WhatsApp'
    };
  }

  // 6. Oficina / Mecânica / Auto Center / Funilaria / Auto Elétrica / Pneus
  if (/oficina|mec[aâ]nic|\bauto\b|centro automotivo|funilaria|pintura|\bcar\b|pneu|freio|suspens|martelinho/i.test(combined)) {
    const isCenter = /centro automotivo|auto center/i.test(combined);
    return {
      term: isCenter ? 'o centro automotivo' : 'a oficina',
      article: isCenter ? 'o' : 'a',
      clientTerm: 'dos clientes',
      servicesPhrase: 'ver os serviços atendidos e formas de pagamento',
      servicesShort: 'os serviços mecânicos',
      whoPhrase: 'quem precisa de manutenção ou revisão no veículo',
      actionPhrase: 'pedir um orçamento rápido pelo WhatsApp'
    };
  }

  // 7. Encanador / Marido de Aluguel / Desentupidora / Eletricista / Caça Vazamentos / Hidráulica
  if (/encanad|marido de aluguel|desentup|hidr[aá]ulic|vazamento|faz tudo|eletricist|manuten[cç]/i.test(combined)) {
    return {
      term: 'o trabalho de vocês',
      article: 'o',
      clientTerm: 'dos clientes',
      servicesPhrase: 'ver os tipos de reparos e atendimentos de urgência',
      servicesShort: 'os serviços atendidos',
      whoPhrase: 'quem precisa de reparos e manutenção rápida',
      actionPhrase: 'pedir um orçamento direto pelo WhatsApp'
    };
  }

  // 8. Restaurante / Hamburgueria / Pizzaria / Bar / Café / Açaí / Lanches / Gastronomia
  if (/restaurante|hamburg|pizza|bar|caf[eé]|a[cç]a[ií]|lanche|gourmet|churras|comida|marmita/i.test(combined)) {
    const term = /hamburg/i.test(combined) ? 'a hamburgueria'
      : /pizza/i.test(combined) ? 'a pizzaria'
      : /caf[eé]/i.test(combined) ? 'o café'
      : /a[cç]a[ií]/i.test(combined) ? 'o açaí'
      : 'o restaurante';
    return {
      term,
      article: term.startsWith('o') ? 'o' : 'a',
      clientTerm: 'dos clientes',
      servicesPhrase: 'ver o cardápio e fotos dos pratos',
      servicesShort: 'o cardápio e opções',
      whoPhrase: 'quem procura onde comer na região',
      actionPhrase: 'fazer pedidos ou tirar dúvidas pelo WhatsApp'
    };
  }

  // 9. Academia / CrossFit / Studio Funcional / Pilates
  if (/academia|crossfit|pilates|fitness|treino|funcional|luta|artes marciais/i.test(combined)) {
    const isPilates = /pilates/i.test(combined);
    return {
      term: isPilates ? 'o estúdio de pilates' : 'a academia',
      article: isPilates ? 'o' : 'a',
      clientTerm: 'dos alunos',
      servicesPhrase: 'conhecer as modalidades e horários de aula',
      servicesShort: 'as modalidades e treinos',
      whoPhrase: 'quem busca treinar perto de casa',
      actionPhrase: 'tirar dúvidas e agendar uma aula experimental pelo WhatsApp'
    };
  }

  // Default / Genérico Comercial
  return {
    term: 'o comércio',
    article: 'o',
    clientTerm: 'dos clientes',
    servicesPhrase: 'conhecer os produtos e serviços',
    servicesShort: 'os produtos e serviços',
    whoPhrase: 'quem pesquisa pela empresa no Google',
    actionPhrase: 'tirar dúvidas e falar direto pelo WhatsApp'
  };
}

/**
 * Builds all 3 complementary variations for the given lead.
 */
export function buildAllPitchVariations(
  lead: Lead | { name: string; category?: string; city?: string; pitchType?: string; rating?: string; reviewsCount?: string; userReviews?: string; doopCanvasUrl?: string },
  options: PitchOptions = {}
): PitchVariation[] {
  const sender = (options.senderName && options.senderName.trim().length > 0) ? options.senderName.trim() : 'Geovane';
  const rawCleanName = cleanBusinessName(lead.name);
  const niche = detectNicheContext(lead);
  const regiao = lead.city && lead.city.trim().length > 0 ? lead.city.trim() : 'Belo Horizonte e região';
  
  // Decide whether preview is ready
  const isReady = options.isReady !== undefined 
    ? options.isReady 
    : Boolean(lead.doopCanvasUrl || true); // Default to true since live preview is instant

  // Natural preposition for business name (ex: "para o Espaço Dellas", "para a Oficina Central")
  const displayName = rawCleanName.startsWith('O ') || rawCleanName.startsWith('A ') 
    ? rawCleanName 
    : `${niche.article === 'a' ? 'a' : 'o'} ${rawCleanName}`;

  const prepName = rawCleanName.startsWith('O ') || rawCleanName.startsWith('A ')
    ? `d${rawCleanName.toLowerCase()}`
    : `${niche.article === 'a' ? 'da' : 'do'} ${rawCleanName}`;

  // Variation 0: Clássica & Conversacional (Estilo Geovane - Avaliações & Horário)
  let var0 = `Oi! Tudo bem? Sou Geovane, Desenvolvedor de Software aqui da região.

Encontrei ${niche.term} no Google Maps e vi os comentários ${niche.clientTerm} sobre o atendimento de vocês.

${isReady
  ? `Preparei uma prévia de site para ${displayName}. A ideia é ajudar ${niche.whoPhrase} a ver os serviços e ${niche.actionPhrase}.`
  : `Estou montando algumas prévias para negócios locais aqui de ${regiao}. A proposta é ajudar ${niche.whoPhrase} a ver os serviços e ${niche.actionPhrase}.`}

${isReady
  ? 'Posso mandar por aqui para vocês verem como ficou?'
  : `Posso preparar uma prévia para ${displayName} e te mandar aqui para você dar uma olhada?`}`;

  // Special gentle adaptation if lead.pitchType === 'offline_site'
  if (lead.pitchType === 'offline_site') {
    var0 = `Oi! Tudo bem? Sou Geovane, Desenvolvedor de Software aqui da região.

Encontrei ${niche.term} no Google Maps e tentei acessar o link cadastrado no perfil de vocês, mas ele pareceu estar fora do ar no celular.

${isReady
  ? `Para ajudar quem pesquisa por vocês no Google, preparei uma prévia leve de site para ${displayName} com ${niche.servicesShort} e o contato direto pelo WhatsApp.`
  : `Para ajudar quem pesquisa por vocês no Google, posso preparar uma prévia de site para ${displayName} com ${niche.servicesShort} e botão de WhatsApp.`}

${isReady
  ? 'Posso mandar por aqui para vocês verem como ficou?'
  : 'Posso te mandar aqui para você dar uma olhada?'}`;
  }

  // Variation 1: Agilidade no Celular & Serviços
  const var1 = `Oi! Tudo bem? Sou Geovane, Desenvolvedor de Software aqui da região.

Estava vendo o perfil ${prepName} no Google Maps e achei muito bacana os elogios ${niche.clientTerm} sobre o trabalho de vocês.

${isReady
  ? `Montei uma prévia de página para celular bem leve para ${displayName}, reunindo o endereço, fotos e ${niche.servicesShort} para facilitar o contato no WhatsApp.`
  : `Estou desenvolvendo modelos práticos de página para celular para empresas da região, organizando fotos e ${niche.servicesShort} para ${niche.actionPhrase}.`}

${isReady
  ? 'Posso te mandar o link aqui para você dar uma olhada?'
  : `Se fizer sentido, posso montar uma prévia para ${displayName} e te enviar por aqui?`}`;

  // Variation 2: Direta & Objetiva
  const var2 = `Oi! Tudo bem? Sou Geovane, Desenvolvedor de Software. Desenvolvo páginas para comércios locais aqui de ${regiao}.

Vi ${niche.term} no Google Maps com ótimos comentários sobre o atendimento da equipe.

${isReady
  ? `Fiz uma prévia prática no celular para ${displayName}, pensada para quem pesquisa no Google conseguir ver ${niche.servicesShort} e já chamar no WhatsApp na hora.`
  : `Posso montar uma demonstração rápida no celular para ${displayName}, facilitando para os clientes verem os serviços e chamarem no WhatsApp.`}

${isReady
  ? 'Posso te enviar aqui para vocês verem se faz sentido?'
  : 'Posso preparar essa demonstração para vocês darem uma olhada?'}`;

  return [
    {
      id: 0,
      title: 'Atendimento & Horário (Padrão Geovane)',
      badge: 'Conversacional',
      text: var0
    },
    {
      id: 1,
      title: 'Agilidade no Celular & Serviços',
      badge: 'Celular & Fotos',
      text: var1
    },
    {
      id: 2,
      title: 'Direta & Objetiva',
      badge: 'Curta & Direta',
      text: var2
    }
  ];
}

/**
 * Generates a single humanized pitch string according to options.
 */
export function generateHumanizedPitch(
  lead: Lead | { name: string; category?: string; city?: string; pitchType?: string; rating?: string; reviewsCount?: string; userReviews?: string; doopCanvasUrl?: string },
  options: PitchOptions = {}
): string {
  const variations = buildAllPitchVariations(lead, options);
  const index = (options.variantIndex !== undefined && options.variantIndex >= 0 && options.variantIndex < variations.length)
    ? options.variantIndex
    : 0;
  return variations[index].text;
}
