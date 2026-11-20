export interface NicheInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  accentColor: string;
}

export const NICHE_INFO_MAP: Record<string, NicheInfo> = {
  health: {
    id: 'health',
    name: 'Saúde & Odontologia',
    badge: 'Odontologia & Clínica',
    description: 'Foco em autoridade clínica (CRO), tratamentos de precisão, scanner 3D e agendamento humanizado.',
    accentColor: '#5B2329'
  },
  auto: {
    id: 'auto',
    name: 'Oficina & Centro Automotivo',
    badge: 'Mecânica & Auto Center',
    description: 'Triagem interativa de sintomas, transparência com fotos no WhatsApp e garantia de 1 ano.',
    accentColor: '#EAB308'
  },
  beauty: {
    id: 'beauty',
    name: 'Beleza & Estética Avançada',
    badge: 'Salão & Estética',
    description: 'Layout editorial sofisticado, tempo exato de procedimentos e agendamento vip.',
    accentColor: '#8A3D4D'
  },
  gastro: {
    id: 'gastro',
    name: 'Gastronomia & Restaurante',
    badge: 'Restaurante & Bar',
    description: 'Prato do chef em evidência, cardápio digital com preços em R$ e pedido direto no WhatsApp.',
    accentColor: '#C2410C'
  },
  pet: {
    id: 'pet',
    name: 'Pet Shop & Veterinária',
    badge: 'Clínica & Banho e Tosa',
    description: 'Divisão clara de clínica vs estética animal, selos de cuidado e câmera ao vivo.',
    accentColor: '#0D9488'
  },
  fitness: {
    id: 'fitness',
    name: 'Academia & Fitness',
    badge: 'CrossFit & Musculação',
    description: 'Dark mode de alta energia, bento de modalidades e tabela comparativa de planos em R$.',
    accentColor: '#FACC15'
  },
  services: {
    id: 'services',
    name: 'Serviços & Reparos 24 Horas',
    badge: 'Eletricista & Encanador 24h',
    description: 'Faixa de alerta de emergência, seletor de urgências, antecedentes verificados e chegada rápida.',
    accentColor: '#EA580C'
  },
  retail: {
    id: 'retail',
    name: 'Varejo & Hortifrúti',
    badge: 'Feira Fresca & Empório',
    description: 'Delivery via áudio/lista no WhatsApp em 45 min e vitrine de ofertas do dia com preços.',
    accentColor: '#059669'
  }
};

export function detectNicheFromCategory(category?: string, name?: string): string {
  const str = `${category || ''} ${name || ''}`.toLowerCase();

  // 1. Saúde / Odonto / Medicina
  if (/odonto|dent|sorris|saude|saúde|médic|clinic|hospital|fisioterapi|psico|oftalmo|pediat/.test(str)) {
    return 'health';
  }

  // 2. Automotivo / Oficina / Mecânica
  if (/auto|mecanic|mecânic|oficina|carro|veicul|veícul|pneu|freio|funilar|troca de oleo|motor|suspens/.test(str)) {
    return 'auto';
  }

  // 3. Beleza / Estética / Salão
  if (/beleza|estetic|estétic|salao|salão|cabel|sobrancelh|manicur|unha|spa|massag|lash|depila/.test(str)) {
    return 'beauty';
  }

  // 4. Gastronomia / Restaurante / Bar
  if (/restaur|pizz|burger|hamburg|bar|lanche|gastro|cafe|café|comida|massa|sushi|churras|pastel|padari|bistr/.test(str)) {
    return 'gastro';
  }

  // 5. Pet / Veterinária
  if (/pet|vet|veterinar|veterinár|cao|cão|gato|banho e tosa|animal|bicho|canil/.test(str)) {
    return 'pet';
  }

  // 6. Fitness / Academia
  if (/fit|academi|crossfit|muscul|treino|pilates|luta|boxe|artes marciais|natacao|natação|funcional/.test(str)) {
    return 'fitness';
  }

  // 7. Serviços 24h / Manutenção Residencial
  if (/eletric|encanad|desentup|reparo|manuten|ar-condic|climatiz|chaveir|pintor|marcen|vidra|serralh/.test(str)) {
    return 'services';
  }

  // 8. Varejo / Hortifrúti / Empório
  if (/horti|fruti|fruta|verdura|merc|empori|empório|acougue|açougue|loja|varejo|distribuidora|mercearia/.test(str)) {
    return 'retail';
  }

  return 'health'; // Padrão
}

