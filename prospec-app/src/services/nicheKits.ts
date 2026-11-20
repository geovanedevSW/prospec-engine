import { LayoutTokens } from './layoutEngine.js';

export interface NicheKitService {
  title: string;
  desc: string;
  badge: string;
  img: string;
}

export interface NicheKitReview {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface NicheKitStat {
  num: string;
  label: string;
  icon: 'award' | 'users' | 'star' | 'shield' | 'clock' | 'truck' | 'heart' | 'thumbs_up';
}

export interface NicheKit {
  id: string;
  name: string;
  categoryLabel: string;
  keywords: string[];
  tokens: LayoutTokens;
  sampleLead: {
    name: string;
    city: string;
    category: string;
    rating: string;
    reviewsCount: string;
    phone: string;
    address: string;
  };
  hero: {
    pill: string;
    headline: string;
    subheadline: string;
    hero_img: string;
    floating_card: {
      name: string;
      role: string;
      rating: string;
      reviews: string;
      avatar: string;
    };
  };
  services: {
    tag: string;
    title: string;
    subtitle: string;
    items: NicheKitService[];
  };
  about: {
    tag: string;
    title: string;
    desc1: string;
    desc2: string;
    about_img: string;
    floating_badge: {
      title: string;
      subtitle: string;
    };
    differentials: string[];
  };
  stats: NicheKitStat[];
  reviews: {
    tag: string;
    title: string;
    items: NicheKitReview[];
  };
  cta_banner: {
    tag: string;
    title: string;
    desc: string;
    buttonText: string;
    bg_img: string;
  };
  info: {
    hours_weekdays: string;
    hours_saturday: string;
    hours_note: string;
    parking_note: string;
  };
}

export const NICHE_KITS: Record<string, NicheKit> = {
  // 1. BELEZA & ESTÉTICA
  beauty: {
    id: 'beauty',
    name: 'Beleza & Estética',
    categoryLabel: 'Salões, Clínicas de Estética & Spas',
    keywords: ['salao', 'salão', 'estetica', 'estética', 'cabelo', 'unha', 'manicure', 'sobrancelha', 'spa', 'beleza', 'dellas'],
    tokens: {
      ground: '#FAF8F5',
      card_bg: '#FFFFFF',
      border: '#E8E2D9',
      accent: '#8A3D4D',
      accent_hover: '#702E3C',
      accent_light: '#F4EBEF',
      text_main: '#1C1917',
      text_muted: '#57534E',
      text_subtle: '#78716C',
      whatsapp: '#25D366',
      font_display: "'Playfair Display', Georgia, serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap'
    },
    sampleLead: {
      name: 'Espaço Dellas • Beleza & Estética',
      city: 'Contagem',
      category: 'Salão de Beleza & Estética',
      rating: '4.9',
      reviewsCount: '84',
      phone: '5531998765432',
      address: 'Rua das Palmeiras, 142 — Centro, Contagem - MG'
    },
    hero: {
      pill: 'Atendimento Exclusivo com Hora Marcada',
      headline: 'REALCE SUA BELEZA COM CUIDADO E TÉCNICAS MODERNAS',
      subheadline: 'Um momento só seu em ambiente privativo e acolhedor. Procedimentos capilares, estética facial e cuidados para unhas com produtos profissionais certificados.',
      hero_img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Ana Paula Pereira',
        role: 'Especialista em Mechas & Visagismo',
        rating: '4.9',
        reviews: '+240 clientes',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Nossos Procedimentos',
      title: 'CUIDADOS COMPLETOS PARA SEU BEM-ESTAR E AUTOESTIMA',
      subtitle: 'Técnicas atualizadas e materiais estéreis para uma experiência relaxante e resultados que duram.',
      items: [
        {
          title: 'Cortes & Mechas Personalizadas',
          desc: 'Visagismo capilar, iluminação sutil e tratamentos reconstrutores que respeitam a integridade dos fios.',
          badge: 'Mais Procurado',
          img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Manicure & Pedicure Spa',
          desc: 'Esmaltação de longa duração, blindagem em gel e hidratação profunda com instrumentos em autoclave.',
          badge: 'Biossegurança',
          img: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Design de Sobrancelhas & Henna',
          desc: 'Mapeamento geométrico que valoriza seu olhar natural, com alinhamento preciso e pigmentação duradoura.',
          badge: 'Personalizado',
          img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Limpeza de Pele Profunda',
          desc: 'Desintoxicação celular, remoção delicada de cravos e hidratação com dermocosméticos de alta performance.',
          badge: 'Revitalização',
          img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'O Espaço',
      title: 'ATENDIMENTO DEDICADO, AMBIENTE PRIVATIVO E PONTUALIDADE',
      desc1: 'Acreditamos que cuidar de si não deve ser uma corrida contra o tempo. Por isso, trabalhamos exclusivamente com hora marcada, garantindo que você seja atendida com calma e atenção total.',
      desc2: 'Estrutura aconchegante com higienização rigorosa entre cada atendimento, toalhas descartáveis e os melhores produtos das marcas profissionais mais conceituadas.',
      about_img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Biossegurança Total',
        subtitle: 'Instrumentos esterilizados em autoclave hospitalar'
      },
      differentials: [
        'Atendimento Individualizado sem Espera',
        'Produtos Certificados Anvisa e Profissionais',
        'Ambiente Climatizado e Café Acolhedor',
        'Facilidade de Agendamento pelo WhatsApp'
      ]
    },
    stats: [
      { num: '99%', label: 'satisfação de clientes no Google', icon: 'thumbs_up' },
      { num: '3.500+', label: 'atendimentos realizados com carinho', icon: 'heart' },
      { num: '4.9★', label: 'avaliação média oficial verificada', icon: 'star' },
      { num: '8+ anos', label: 'de dedicação e aperfeiçoamento', icon: 'award' }
    ],
    reviews: {
      tag: 'Depoimentos',
      title: 'O QUE NOSSAS CLIENTES DIZEM SOBRE A EXPERIÊNCIA',
      items: [
        {
          name: 'Mariana Duarte',
          role: 'Cliente há 3 anos',
          text: 'Melhor salão da região. A Ana tem uma paciência e um capricho fora de série com as mechas. Nunca mais troco!',
          rating: 5
        },
        {
          name: 'Camila Guimarães',
          role: 'Manicure & Design',
          text: 'Espaço super limpo e aconchegante. A esterilização dos instrumentos me dá total segurança. Super pontual.',
          rating: 5
        },
        {
          name: 'Fernanda Albuquerque',
          role: 'Estética Facial',
          text: 'Fiz a limpeza de pele e o resultado foi incrível, sem dor e sem deixar o rosto vermelho. Atendimento nota 10.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Reserve seu horário',
      title: 'PRONTA PARA UM MOMENTO EXCLUSIVO DE AUTOESTIMA?',
      desc: 'Atendimentos de terça a sábado com hora marcada. Garanta seu horário com nossa equipe de especialistas.',
      buttonText: 'Agendar pelo WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Terça a Sexta: 08:30 às 18:30',
      hours_saturday: 'Sábado: 08:00 às 17:00',
      hours_note: 'Atendimento exclusivo com hora marcada',
      parking_note: 'Fácil estacionamento em frente ao espaço'
    }
  },

  // 2. AUTOMOTIVO & MECÂNICA
  auto: {
    id: 'auto',
    name: 'Automotivo & Mecânica',
    categoryLabel: 'Oficinas Mecânicas, Auto Centers & Detailing',
    keywords: ['oficina', 'mecanica', 'mecânica', 'auto', 'carro', 'pneu', 'freio', 'suspensao', 'suspensão', 'injecao', 'injeção', 'troca de oleo', 'oleo', 'motor', 'funilaria', 'revisão'],
    tokens: {
      ground: '#0F172A',
      card_bg: '#1E293B',
      border: '#334155',
      accent: '#EA580C',
      accent_hover: '#C2410C',
      accent_light: 'rgba(234, 88, 12, 0.16)',
      text_main: '#F8FAFC',
      text_muted: '#94A3B8',
      text_subtle: '#64748B',
      whatsapp: '#25D366',
      font_display: "'Plus Jakarta Sans', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'
    },
    sampleLead: {
      name: 'Auto Center Precisão • Oficina & Injeção',
      city: 'Contagem',
      category: 'Oficina Mecânica & Auto Center',
      rating: '4.9',
      reviewsCount: '112',
      phone: '5531998765432',
      address: 'Av. João César de Oliveira, 2850 — Eldorado, Contagem - MG'
    },
    hero: {
      pill: 'Garantia de 90 Dias por Escrito em Todas as Peças',
      headline: 'DIAGNÓSTICO ELETRÔNICO PRECISO E MECÂNICA HONESTA',
      subheadline: 'Seu carro em boas mãos sem surpresas na conta. Scanner automotivo de última geração, orçamento detalhado prévio e peças com procedência comprovada.',
      hero_img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Carlos Eduardo Ramos',
        role: 'Chefe de Oficina • ASE Certificado',
        rating: '4.9',
        reviews: '+1.800 veículos',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Serviços Especializados',
      title: 'SOLUÇÕES COMPLETAS PARA VOCÊ RODAR COM TRANQUILIDADE',
      subtitle: 'Estrutura com elevadores hidráulicos modernos e técnicos treinados para nacionais e importados.',
      items: [
        {
          title: 'Injeção Eletrônica & Scanner 3D',
          desc: 'Leitura de falhas, limpeza ultrassônica de bicos, sonda lambda e calibração de consumo de combustível.',
          badge: 'Diagnóstico Rápido',
          img: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Revisão de Freios & Suspensão',
          desc: 'Troca de pastilhas, discos, amortecedores, buchas e teste dinâmico de frenagem com total segurança.',
          badge: 'Segurança Máxima',
          img: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Troca de Óleo & Filtros',
          desc: 'Lubrificantes originais homologados pelas montadoras, com troca de filtros de óleo, ar, cabine e combustível.',
          badge: 'Em 20 Minutos',
          img: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Alinhamento 3D & Balanceamento',
          desc: 'Ajuste computadorizado de convergência e cambagem para evitar desgaste irregular de pneus e instabilidade.',
          badge: 'Precisão Laser',
          img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'A Oficina',
      title: 'TRANSPARÊNCIA TOTAL: VOCÊ ACOMPANHA CADA ETAPA DO REPARO',
      desc1: 'Sabemos que confiança é o fator número 1 na hora de escolher um mecânico. Por isso, fotografamos e filmamos as peças danificadas e explicamos o motivo de cada intervenção antes de realizar o serviço.',
      desc2: 'Aqui você não paga por peça desnecessária. Entregamos as peças antigas substituídas na entrega do veículo e emitimos nota fiscal com garantia documentada de 90 dias.',
      about_img: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Peças com Garantia',
        subtitle: 'Trabalhamos apenas com marcas originais e lacradas'
      },
      differentials: [
        'Orçamento Rápido via Foto ou Vídeo no WhatsApp',
        'Peças Antigas Devolvidas na Caixa Original',
        'Sala de Espera Climatizada com Wi-Fi e Café',
        'Pagamento Parcelado em até 10x no Cartão'
      ]
    },
    stats: [
      { num: '98%', label: 'orçamentos aprovados na primeira visita', icon: 'thumbs_up' },
      { num: '12.000+', label: 'veículos revisados com segurança', icon: 'award' },
      { num: '4.9★', label: 'nota média no Google Maps', icon: 'star' },
      { num: '90 dias', label: 'de garantia por escrito em serviços', icon: 'shield' }
    ],
    reviews: {
      tag: 'Opinião de Clientes',
      title: 'QUEM FEZ REVISÃO NA PRECISÃO RECOMENDA',
      items: [
        {
          name: 'Rogério Medeiros',
          role: 'Revisão Freios • Honda Civic',
          text: 'Oficina extremamente honesta. Levei achando que era disco e era apenas pastilha. Economizei mais de 500 reais. Ganharam um cliente fiel.',
          rating: 5
        },
        {
          name: 'Felipe Santos',
          role: 'Injeção Eletrônica • VW Gol',
          text: 'Meu carro falhava na subida e outras duas oficinas não acharam o problema. O Carlos passou o scanner e resolveu em 2 horas.',
          rating: 5
        },
        {
          name: 'Luciana Brandão',
          role: 'Troca de Óleo e Suspensão • Jeep Renegade',
          text: 'Atendimento nota mil. Mandaram vídeo pelo WhatsApp mostrando as buchas gastas antes de trocar. Super transparente e pontual.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Diagnóstico Sem Compromisso',
      title: 'OUVIU ALGUM BARULHO OU A LUZ DA INJEÇÃO ACENDEU?',
      desc: 'Mande um áudio, foto ou vídeo no WhatsApp da oficina. Nossa equipe técnica responde em poucos minutos.',
      buttonText: 'Mandar Mensagem no WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Segunda a Sexta: 08:00 às 18:00',
      hours_saturday: 'Sábado: 08:00 às 12:30 (Trocas rápidas & alinhamento)',
      hours_note: 'Orçamentos rápidos com hora marcada',
      parking_note: 'Pátio interno amplo e seguro para veículos'
    }
  },

  // 3. SAÚDE & ODONTO
  health: {
    id: 'health',
    name: 'Saúde & Odonto',
    categoryLabel: 'Clínicas Odontológicas, Médicas & Fisioterapia',
    keywords: ['odonto', 'dentista', 'clinica', 'clínica', 'dente', 'implante', 'ortodontia', 'aparelho', 'clareamento', 'sorria', 'saude', 'saúde', 'fisioterapia', 'médico'],
    tokens: {
      ground: '#FAF8F5',
      card_bg: '#FFFFFF',
      border: '#E8E2D9',
      accent: '#5B2329',
      accent_hover: '#461A1F',
      accent_light: '#F8F1F2',
      text_main: '#1C1917',
      text_muted: '#57534E',
      text_subtle: '#78716C',
      whatsapp: '#25D366',
      font_display: "'Plus Jakarta Sans', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'
    },
    sampleLead: {
      name: 'Sorria! Clínica Odontológica',
      city: 'Contagem',
      category: 'Clínica Odontológica Integrada',
      rating: '4.9',
      reviewsCount: '380',
      phone: '5531998765432',
      address: 'Rua Central, 450 — Centro, Contagem - MG'
    },
    hero: {
      pill: 'Atendimentos de Segunda a Sábado com Hora Marcada',
      headline: 'ODONTOLOGIA MODERNA COM CUIDADO E DEDICAÇÃO A VOCÊ',
      subheadline: 'A clínica odontológica ideal pra você e sua família. Tecnologia digital de alta precisão, ambiente acolhedor e tratamentos sem dor para devolver a confiança do seu sorriso.',
      hero_img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Dr. Marcelo Ramos',
        role: 'Cirurgião-Dentista • CRO-MG 54.821',
        rating: '4.9',
        reviews: '+380 avaliações',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Especialidades Odontológicas',
      title: 'SOLUÇÕES COMPLETAS PARA A SAÚDE E ESTÉTICA DO SEU SORRISO',
      subtitle: 'Diagnóstico precoce e técnicas modernas que priorizam seu conforto e tranquilidade.',
      items: [
        {
          title: 'Limpeza & Profilaxia Ultrassônica',
          desc: 'Remoção de cálculo dental e jato de bicarbonato para dentes limpos e gengivas totalmente protegidas.',
          badge: 'Prevenção',
          img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Check-up Digital & Câmera Intraoral',
          desc: 'Imagens em alta definição ampliadas na tela para você visualizar a real condição de cada dente.',
          badge: 'Diagnóstico Claro',
          img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Restaurações Estéticas & Facetas',
          desc: 'Resinas compostas de alta estratificação que devolvem a anatomia e a cor natural sem desgaste desnecessário.',
          badge: 'Estética',
          img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Ortodontia & Alinhadores Invisíveis',
          desc: 'Correção de mordida e alinhamento do sorriso para adultos e crianças com conforto e discrição.',
          badge: 'Alinhamento',
          img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'A Clínica',
      title: 'ALTOS PADRÕES TÉCNICOS E ATENDIMENTO VERDADEIRAMENTE HUMANIZADO',
      desc1: 'Sabemos que muitas pessoas adiam a ida ao dentista por medo de dor ou experiências traumáticas do passado. Nossa equipe foi treinada para acolher cada paciente com calma e respeito ao seu tempo.',
      desc2: 'Consultórios climatizados, anestesia computadorizada suave e biossegurança hospitalar rigorosa para que sua família sinta total tranquilidade desde a recepção.',
      about_img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Biossegurança Hospitalar',
        subtitle: 'Autoclave com rastreabilidade química e biológica'
      },
      differentials: [
        'Atendimentos aos Sábados para sua Comodidade',
        'Planejamento Digital e Preços Claros sem Surpresas',
        'Espaço Infantil Aconchegante para Odontopediatria',
        'Estacionamento Próprio com Acessibilidade'
      ]
    },
    stats: [
      { num: '98%', label: 'pacientes acolhidos sem trauma ou dor', icon: 'thumbs_up' },
      { num: '12.000+', label: 'sorrisos restaurados com precisão', icon: 'award' },
      { num: '4.9★', label: 'nota máxima verificada no Google', icon: 'star' },
      { num: '15+ anos', label: 'de tradição e excelência clínica', icon: 'shield' }
    ],
    reviews: {
      tag: 'Depoimentos Verificados',
      title: 'O QUE NOSSOS PACIENTES DIZEM',
      items: [
        {
          name: 'Mariana Albuquerque',
          role: 'Restauração & Profilaxia',
          text: 'Sempre tive pânico de dentista por traumas antigos. O Dr. Marcelo me atendeu com uma paciência incrível. Não senti nada na anestesia!',
          rating: 5
        },
        {
          name: 'Carlos Eduardo Guimarães',
          role: 'Atendimento Familiar',
          text: 'Levo minha mãe e meus dois filhos. Ter horário aos sábados facilita demais nossa rotina. Consultórios impecáveis e atendimento pontual.',
          rating: 5
        },
        {
          name: 'Fernanda Toledo',
          role: 'Alinhador Invisível',
          text: 'Resultado incrível em menos de um ano com alinhadores. A clínica é linda e a equipe sempre cordial. Recomendo de olhos fechados.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Agende sua Consulta',
      title: 'PRONTO PARA CUIDAR DO SEU SORRISO COM CONFORTO?',
      desc: 'Atendimentos de segunda a sábado. Nossa equipe de recepção responde rapidamente no WhatsApp.',
      buttonText: 'Agendar Consulta no WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Segunda a Sexta: 08:00 às 19:00',
      hours_saturday: 'Sábado: 08:00 às 13:00',
      hours_note: 'Consultas com hora marcada e confirmação prévia',
      parking_note: 'Vagas exclusivas na porta para pacientes'
    }
  },

  // 4. ALIMENTAÇÃO & GASTRONOMIA
  gastro: {
    id: 'gastro',
    name: 'Alimentação & Gastronomia',
    categoryLabel: 'Restaurantes, Hamburguerias, Pizzarias & Bistrôs',
    keywords: ['restaurante', 'pizza', 'pizzaria', 'burger', 'hamburgueria', 'lanche', 'bar', 'churrasco', 'parrilla', 'churrascaria', 'gastro', 'cafe', 'café', 'delivery'],
    tokens: {
      ground: '#14110F',
      card_bg: '#1F1B18',
      border: '#362F2B',
      accent: '#D97706',
      accent_hover: '#B45309',
      accent_light: 'rgba(217, 119, 6, 0.16)',
      text_main: '#FFFDF8',
      text_muted: '#A89F91',
      text_subtle: '#786F62',
      whatsapp: '#25D366',
      font_display: "'Playfair Display', Georgia, serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap'
    },
    sampleLead: {
      name: 'Bistrô & Parrilla 31 • Gastronomia Artesanal',
      city: 'Contagem',
      category: 'Restaurante & Parrilla',
      rating: '4.8',
      reviewsCount: '230',
      phone: '5531998765432',
      address: 'Rua do Comércio, 180 — Centro Histórico, Contagem - MG'
    },
    hero: {
      pill: 'Delivery Rápido no WhatsApp & Reservas para Jantar',
      headline: 'SABORES MARCANTES, CARNES NOBRES E INGREDIENTES SELECIONADOS',
      subheadline: 'Cozinha artesanal feita com paixão na brasa. Cortes especiais de parrilla, hambúrgueres artesanais e porções gourmet para momentos inesquecíveis.',
      hero_img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Parrilla Especial 31',
        role: 'Corte Assinatura na Brasa',
        rating: '4.9',
        reviews: '+5.000 pedidos',
        avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Cardápio em Destaque',
      title: 'EXPERIÊNCIAS GASTRONÔMICAS PARA TODOS OS PALADARES',
      subtitle: 'Preparo na hora com ingredientes frescos de produtores locais e carnes com certificação de origem.',
      items: [
        {
          title: 'Cortes Especiais na Parrilla',
          desc: 'Ancho, Picanha e Bife de Tira preparados na brasa com chimichurri artesanal e farofa crocante.',
          badge: 'Mais Pedido',
          img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Hambúrgueres Artesanais Defumados',
          desc: 'Blend bovino de 180g grelhado ao ponto, queijo canastra derretido e pão brioche amanteigado.',
          badge: 'Gourmet',
          img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Pizzas de Fermentação Natural',
          desc: 'Massa com maturação de 48 horas, molho de tomate pelado italiano e mozzarella de búfala fresca.',
          badge: 'Artesanal',
          img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Sobremesas da Casa & Drinks',
          desc: 'Pudim com fava de baunilha, taças de chocolate belga e carta de drinks clássicos e autorais.',
          badge: 'Doce Final',
          img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'Nossa Cozinha',
      title: 'TEMPERO DE VERDADE, AMBIENTE ACOLHEDOR E ATENDIMENTO CORDIAL',
      desc1: 'Criamos um ambiente onde você pode relaxar com a família ou amigos, saboreando boa comida sem pressa. Cada prato é finalizado com dedicação pela nossa equipe de cozinha.',
      desc2: 'Para quem prefere saborear em casa, nosso delivery conta com embalagens térmicas reforçadas que preservam a temperatura, textura e apresentação do pedido como se você estivesse no salão.',
      about_img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Cozinha Aberta',
        subtitle: 'Padrão rigoroso de higiene e ingredientes nobres'
      },
      differentials: [
        'Pedido Rápido e Direto pelo WhatsApp sem Taxas Abusivas',
        'Embalagens Térmicas que Mantêm a Comida Quente e Crocante',
        'Opções Vegetarianas e Kids no Cardápio',
        'Espaço Pet Friendly e Música Ambiente Agradável'
      ]
    },
    stats: [
      { num: '4.8★', label: 'avaliação média oficial de clientes', icon: 'star' },
      { num: '30 min', label: 'tempo médio de entrega no delivery', icon: 'clock' },
      { num: '100%', label: 'carnes nobres com certificação', icon: 'award' },
      { num: '25.000+', label: 'pedidos entregues com sucesso', icon: 'thumbs_up' }
    ],
    reviews: {
      tag: 'Clientes Satisfeitos',
      title: 'O QUE DIZEM SOBRE NOSSOS PRATOS',
      items: [
        {
          name: 'Gustavo Paiva',
          role: 'Cliente do Salão',
          text: 'A carne na parrilla é espetacular, ponto perfeito e sabor defumado autêntico. O atendimento dos garçons é impecável.',
          rating: 5
        },
        {
          name: 'Patrícia Mendes',
          role: 'Pedido no Delivery',
          text: 'Pedi pelo WhatsApp e chegou em 25 minutos super quente! O hambúrguer de costela é sem dúvida o melhor da cidade.',
          rating: 5
        },
        {
          name: 'Lucas Nogueira',
          role: 'Jantar de Família',
          text: 'Lugar super agradável, carta de cervejas artesanais geladas e porções muito bem servidas. Voltaremos sempre!',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Peça Agora ou Reserve',
      title: 'BATEU A FOME? RECEBA SEU PRATO FAVORITO EM CASA',
      desc: 'Faça seu pedido diretamente pelo nosso WhatsApp. Cardápio completo com promoções exclusivas da semana.',
      buttonText: 'Pedir pelo WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Terça a Quinta: 18:00 às 23:00 | Sexta: 18:00 às 00:00',
      hours_saturday: 'Sábado: 12:00 às 00:00 | Domingo: 12:00 às 22:00',
      hours_note: 'Salão com reservas e delivery com taxa fixa regional',
      parking_note: 'Estacionamento conveniado ao lado'
    }
  },

  // 5. PET SHOP & VETERINÁRIA
  pet: {
    id: 'pet',
    name: 'Pet Shop & Veterinária',
    categoryLabel: 'Clínicas Veterinárias, Banho & Tosa e Pet Centers',
    keywords: ['pet', 'vet', 'veterinario', 'veterinária', 'animal', 'cachorro', 'gato', 'banho e tosa', 'vacina', 'castracao', 'ração'],
    tokens: {
      ground: '#FAF6F0',
      card_bg: '#FFFFFF',
      border: '#E7DFD5',
      accent: '#0D9488',
      accent_hover: '#0F766E',
      accent_light: '#E6FFFA',
      text_main: '#1C1917',
      text_muted: '#57534E',
      text_subtle: '#78716C',
      whatsapp: '#25D366',
      font_display: "'Plus Jakarta Sans', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'
    },
    sampleLead: {
      name: 'PetCare & Vet • Clínica & Estética Animal',
      city: 'Contagem',
      category: 'Clínica Veterinária & Pet Shop',
      rating: '4.9',
      reviewsCount: '160',
      phone: '5531998765432',
      address: 'Rua Rio Comprido, 320 — Riacho, Contagem - MG'
    },
    hero: {
      pill: 'Plantão Veterinário & Banho com Toalhas Individuais',
      headline: 'AMOR, DEDICAÇÃO E CUIDADO DE SAÚDE PARA SEU PET',
      subheadline: 'Seu melhor amigo tratado como parte da família. Consultas veterinárias, vacinas importadas, exames laboratoriais e estética pet com carinho e sem estresse.',
      hero_img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Dra. Beatriz Lemos',
        role: 'Médica Veterinária • CRMV-MG 18.940',
        rating: '4.9',
        reviews: '+2.200 pets cuidados',
        avatar: 'https://images.unsplash.com/photo-1594824813580-ff6735a4d334?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Nossos Cuidados',
      title: 'SAÚDE PREVENTIVA E HIGIENE COMPLETA PARA CÃES E GATOS',
      subtitle: 'Estrutura separada para cães e felinos para garantir uma visita calma e sem agitação.',
      items: [
        {
          title: 'Consulta Clínica & Check-up Pet',
          desc: 'Avaliação clínica minuciosa, controle de peso, ausculta e orientação nutricional personalizada.',
          badge: 'Saúde Animal',
          img: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Vacinação Importada V10 & Raiva',
          desc: 'Imunização segura com vacinas de laboratórios internacionais mantidas em câmara fria monitorada.',
          badge: 'Proteção Total',
          img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Banho Terapêutico & Tosa na Tesoura',
          desc: 'Toalhas higienizadas e lacradas individualmente, produtos hipoalergênicos e secagem com proteção térmica.',
          badge: 'Estética Pet',
          img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Táxi-Pet / Leva e Traz Confortável',
          desc: 'Transporte seguro com caixas higienizadas e ar-condicionado para buscar seu pet com pontualidade.',
          badge: 'Comodidade',
          img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'Quem Somos',
      title: 'PROFISSIONAIS APAIXONADOS POR ANIMAIS E COMPROMETIDOS COM A VIDA',
      desc1: 'Nosso objetivo é proporcionar aos animais de estimação a mesma qualidade de atenção médica que gostaríamos para nós mesmos. Não usamos sedativos em procedimentos de banho e tosa.',
      desc2: 'Contamos com consultórios modernos, farmácia veterinária completa e profissionais em constante atualização para atender com empatia e acolhimento.',
      about_img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Bem-Estar em 1º Lugar',
        subtitle: 'Sem contenção agressiva e com toalhas 100% esterilizadas'
      },
      differentials: [
        'Toalhas Higienizadas Embaladas Individualmente',
        'Atendimento com Hora Marcada para Evitar Espera e Estresse',
        'Equipe Formada e Treinada em Comportamento Animal',
        'Agendamento Ágil e Acompanhamento pós-consulta pelo WhatsApp'
      ]
    },
    stats: [
      { num: '4.9★', label: 'nota média no Google Maps', icon: 'star' },
      { num: '8.000+', label: 'banhos e tosas realizados com carinho', icon: 'heart' },
      { num: '100%', label: 'toalhas esterilizadas e individuais', icon: 'shield' },
      { num: '10+ anos', label: 'cuidando dos pets de Contagem e BH', icon: 'award' }
    ],
    reviews: {
      tag: 'Tutores Satisfeitos',
      title: 'O QUE OS DONOS DE PETS FALAM DA PETCARE',
      items: [
        {
          name: 'Juliana Vasconcelos',
          role: 'Tutora do Thor (Golden)',
          text: 'Meu cachorro morria de medo de banho. Na PetCare ele entra abanando o rabo! O carinho e o cuidado das meninas são únicos.',
          rating: 5
        },
        {
          name: 'Marcos Vinícius',
          role: 'Tutor da Luna (Gatinha)',
          text: 'A Dra. Beatriz atendeu minha gata com tanta calma que ela nem se assustou com a vacina. Atendimento de primeira qualidade.',
          rating: 5
        },
        {
          name: 'Renata Coimbra',
          role: 'Uso do Táxi-Pet',
          text: 'O serviço de busca e entrega funciona como um relógio. O motorista é super atencioso e o cão volta cheiroso e feliz.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Agende para seu Pet',
      title: 'HORA DE DAR AQUELE BANHO CHEIROSO OU ATUALIZAR AS VACINAS?',
      desc: 'Reserve o melhor horário para o seu pet pelo WhatsApp. Atendimentos de segunda a sábado com hora marcada.',
      buttonText: 'Falar com a Recepção no WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Segunda a Sexta: 08:00 às 18:30',
      hours_saturday: 'Sábado: 08:00 às 16:00',
      hours_note: 'Banho e tosa com hora marcada e confirmação prévia',
      parking_note: 'Fácil embarque e desembarque na porta'
    }
  },

  // 6. FITNESS & ACADEMIAS
  fitness: {
    id: 'fitness',
    name: 'Fitness & Academias',
    categoryLabel: 'Studios, Personal Trainers & Academias de Bairro',
    keywords: ['academia', 'fitness', 'treino', 'musculacao', 'musculação', 'personal', 'crossfit', 'funcional', 'pilates', 'luta', 'emagrecimento'],
    tokens: {
      ground: '#09090B',
      card_bg: '#18181B',
      border: '#27272A',
      accent: '#84CC16',
      accent_hover: '#65A30D',
      accent_light: 'rgba(132, 204, 22, 0.16)',
      text_main: '#FAFAFA',
      text_muted: '#A1A1AA',
      text_subtle: '#71717A',
      whatsapp: '#25D366',
      font_display: "'Plus Jakarta Sans', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'
    },
    sampleLead: {
      name: 'IronCore Studio • Treinamento & Musculação',
      city: 'Contagem',
      category: 'Studio Fitness & Academia',
      rating: '4.9',
      reviewsCount: '95',
      phone: '5531998765432',
      address: 'Av. Londres, 510 — Santa Cruz, Contagem - MG'
    },
    hero: {
      pill: 'Ganhe 1 Aula Experimental Gratuita pelo WhatsApp',
      headline: 'TREINAMENTO INTELIGENTE, RESULTADOS REAIS E ACOMPANHAMENTO',
      subheadline: 'Chega de academia lotada onde ninguém te orienta. No IronCore você conta com professores dedicados na sala, equipamentos biomecânicos de alta qualidade e foco nos seus objetivos.',
      hero_img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Felipe Santos',
        role: 'Coordenador Técnico • CREF 02841-G/MG',
        rating: '4.9',
        reviews: '+600 alunos ativos',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Nossas Modalidades',
      title: 'PROGRAMAS DESENVOLVIDOS PARA SUA SAÚDE, FORÇA E DISPOSIÇÃO',
      subtitle: 'Treinos planejados tanto para quem está começando do zero quanto para quem busca alto rendimento.',
      items: [
        {
          title: 'Musculação com Orientação Ativa',
          desc: 'Série montada sob medida e professores na sala corrigindo postura e ajustando cargas para evitar lesões.',
          badge: 'Acompanhado',
          img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Treinamento Funcional em Grupo',
          desc: 'Aulas dinâmicas de 45 minutos que queimam calorias, aceleram o metabolismo e aumentam o fôlego.',
          badge: 'Alta Energia',
          img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Avaliação Física & Bioimpedância',
          desc: 'Mapeamento completo de percentual de gordura, massa magra e evolução visual com relatório no celular.',
          badge: 'Ciência & Foco',
          img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Personal Trainer Individual',
          desc: 'Atenção 100% exclusiva de um profissional para quem busca resultados rápidos e cronograma flexível.',
          badge: 'Exclusivo',
          img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'Nossa Filosofia',
      title: 'AMBIENTE MOTIVADOR ONDE VOCÊ SE SENTE BEM-VINDO DESDE O PRIMEIRO DIA',
      desc1: 'Não acreditamos em fórmulas mágicas nem em academias impessoais. No IronCore criamos uma comunidade acolhedora onde cada aluno é chamado pelo nome e recebe o estímulo necessário para não desistir.',
      desc2: 'Espaço climatizado, equipamentos modernos com manutenção preventiva quinzenal e vestiários limpos com chuveiros quentes para você treinar e seguir direto para o trabalho.',
      about_img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Sem Multas Abusivas',
        subtitle: 'Planos transparentes e cancelamento simples'
      },
      differentials: [
        'Professores Atentos na Sala em Todos os Horários',
        'Aplicativo Próprio com Vídeos Explicativos dos Exercícios',
        'Estacionamento Próprio e Seguro para Alunos',
        'Planos Mensais e Recorrentes Sem Prender o Limite do Cartão'
      ]
    },
    stats: [
      { num: '94%', label: 'alunos que mantêm frequência ativa após 6 meses', icon: 'thumbs_up' },
      { num: '4.9★', label: 'avaliação média no Google Maps', icon: 'star' },
      { num: '0%', label: 'taxa de matrícula ou taxas ocultas', icon: 'shield' },
      { num: '5h às 22h', label: 'horários amplos para sua comodidade', icon: 'clock' }
    ],
    reviews: {
      tag: 'Resultados Reais',
      title: 'O QUE NOSSOS ALUNOS CONQUISTARAM',
      items: [
        {
          name: 'Thiago Oliveira',
          role: 'Aluno há 1 ano • -14kg eliminados',
          text: 'Nunca consegui ficar mais de 2 meses em academia convencional. No IronCore os professores realmente se importam e corrigem cada série.',
          rating: 5
        },
        {
          name: 'Renata Silveira',
          role: 'Treino Funcional',
          text: 'Aulas super animadas, turma acolhedora e equipamentos impecáveis. Minha dor nas costas sumiu em dois meses de treino.',
          rating: 5
        },
        {
          name: 'Bruno Meireles',
          role: 'Musculação Noturna',
          text: 'Ambiente nota 10, sem aquela muvuca insuportável de academia de rede. Dá para treinar sem revezar aparelho por 20 minutos.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Dê o Primeiro Passo',
      title: 'QUER EXPERIMENTAR UM TREINO DIFERENTE HOJE?',
      desc: 'Chame no WhatsApp e agende uma aula experimental 100% gratuita sem compromisso.',
      buttonText: 'Garantir Aula Grátis no WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Segunda a Sexta: 05:30 às 22:00',
      hours_saturday: 'Sábado: 08:00 às 14:00 | Domingo: 09:00 às 12:00',
      hours_note: 'Acesso livre a todas as modalidades na grade',
      parking_note: 'Vagas exclusivas na frente da academia'
    }
  },

  // 7. MANUTENÇÃO & SERVIÇOS RESIDENCIAIS
  services: {
    id: 'services',
    name: 'Manutenção & Serviços',
    categoryLabel: 'Eletricistas, Encanadores, Ar Condicionado & Reformas',
    keywords: ['bombeiro', 'hidraulico', 'hidráulico', 'encanador', 'vazamento', 'desentupimento', 'eletricista', 'eletrica', 'elétrica', 'ar condicionado', 'marido de aluguel', 'reforma', 'pintor', 'manutenção', 'manutencao'],
    tokens: {
      ground: '#F8FAFC',
      card_bg: '#FFFFFF',
      border: '#E2E8F0',
      accent: '#1E3A8A',
      accent_hover: '#1E40AF',
      accent_light: '#DBEAFE',
      text_main: '#0F172A',
      text_muted: '#475569',
      text_subtle: '#64748B',
      whatsapp: '#25D366',
      font_display: "'Plus Jakarta Sans', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'
    },
    sampleLead: {
      name: 'SOS Reparos & Hidráulica • Atendimento Rápido',
      city: 'Contagem',
      category: 'Manutenção Residencial & Predial',
      rating: '4.9',
      reviewsCount: '145',
      phone: '5531998765432',
      address: 'Atendimento em Domicílio em Contagem, Betim e BH'
    },
    hero: {
      pill: 'Chegamos em até 45 Minutos para Emergências',
      headline: 'REPAROS RÁPIDOS, SEM QUEBRA-QUEBRA E COM GARANTIA',
      subheadline: 'Vazamentos, problemas elétricos, desentupimentos e instalações. Detecção com equipamentos de precisão, orçamento justo prévio e garantia por escrito.',
      hero_img: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Mestre Gilberto',
        role: 'Técnico Especialista • 18 anos de experiência',
        rating: '4.9',
        reviews: '+3.400 chamados atendidos',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Nossos Serviços',
      title: 'SOLUÇÕES PROFISSIONAIS PARA VOCÊ NÃO TER DOR DE CABEÇA',
      subtitle: 'Equipamentos modernos que resolvem o problema sem danificar pisos ou paredes desnecessariamente.',
      items: [
        {
          title: 'Caça-Vazamentos com Geofone',
          desc: 'Detecção acústica milimétrica de vazamentos ocultos sob o chão ou alvenaria. Localize sem quebrar nada.',
          badge: 'Sem Quebra-Quebra',
          img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Instalações Elétricas & Chuveiros',
          desc: 'Troca de fiação, disjuntores que desarmam, tomadas aquecidas, luminárias e aumento de carga com segurança.',
          badge: 'Segurança Total',
          img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Desentupimento com Maquinário',
          desc: 'Desobstrução limpa e ágil de pias, ralos, vasos e caixas de gordura com maquinário rotativo moderno.',
          badge: 'Plantão Rápido',
          img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Instalação de Ar Condicionado',
          desc: 'Infraestrutura de cobre, vácuo na tubulação, suporte reforçado e higienização antibacteriana preventiva.',
          badge: 'Climatização',
          img: 'https://images.unsplash.com/photo-1614633833026-0620c5db1946?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'Profissionalismo',
      title: 'HONESTIDADE, CAPRICHO E RESPEITO PELO SEU PATRIMÔNIO',
      desc1: 'Sabemos que abrir as portas da sua casa para um técnico exige confiança. Nossa equipe trabalha uniformizada, com identificação, pontualidade britânica e ferramentas próprias.',
      desc2: 'Não deixamos sujeira para trás. Ao concluir o reparo, recolhemos todo o entulho e deixamos o ambiente limpo. Fornecemos nota fiscal e garantia documentada de 90 dias.',
      about_img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Garantia por Escrito',
        subtitle: 'Nota fiscal e 90 dias de garantia em todos os serviços'
      },
      differentials: [
        'Envie Foto ou Vídeo no WhatsApp e Receba Orçamento na Hora',
        'Técnicos com Identificação e Antecedentes Verificados',
        'Ferramentas Próprias e Limpeza pós-serviço Garantida',
        'Pagamento via Pix ou Cartão em até 6x'
      ]
    },
    stats: [
      { num: '45 min', label: 'tempo médio de chegada em chamados urgentes', icon: 'clock' },
      { num: '90 dias', label: 'de garantia oficial documentada', icon: 'shield' },
      { num: '4.9★', label: 'avaliação média oficial de clientes', icon: 'star' },
      { num: '100%', label: 'laudo técnico aceito para abatimento de conta Copasa', icon: 'award' }
    ],
    reviews: {
      tag: 'Depoimentos de Quem Chamou',
      title: 'CLIENTES QUE RESOLVERAM O PROBLEMA SEM ESTRESSE',
      items: [
        {
          name: 'Cláudio Ferreira',
          role: 'Caça-Vazamento • Bairro Eldorado',
          text: 'A conta de água veio 900 reais. O Gilberto achou o vazamento em 20 minutos com o geofone. Quebrou apenas 1 azulejo. Emitiu o laudo e a Copasa deu desconto!',
          rating: 5
        },
        {
          name: 'Carla Silveira',
          role: 'Instalação Elétrica & Chuveiro',
          text: 'Meu disjuntor caía todo dia. Fizeram a troca da fiação com muito capricho e deixaram tudo limpo. Super recomendo.',
          rating: 5
        },
        {
          name: 'Marcelo Antunes',
          role: 'Desentupimento Residencial',
          text: 'Chamei no sábado à noite e em 40 minutos o técnico estava na minha casa. Preço justo e trabalho rápido sem quebrar nada.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Chame o Técnico Agora',
      title: 'COM VAZAMENTO, FALTA DE LUZ OU CANO ENTUPIDO?',
      desc: 'Mande um vídeo do problema no WhatsApp. Nossa equipe calcula o orçamento e envia o técnico mais próximo.',
      buttonText: 'Chamar no WhatsApp com Urgência',
      bg_img: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Segunda a Sexta: 07:00 às 20:00',
      hours_saturday: 'Sábado & Domingo: Plantão de Emergência 24h',
      hours_note: 'Orçamentos rápidos com hora marcada ou socorro imediato',
      parking_note: 'Deslocamento ágil com veículo da empresa'
    }
  },

  // 8. OUTROS COMÉRCIOS / VAREJO LOCAL
  retail: {
    id: 'retail',
    name: 'Varejo & Comércio Local',
    categoryLabel: 'Mercados de Bairro, Hortifrútis, Floriculturas & Lojas',
    keywords: ['mercado', 'supermercado', 'hortifruti', 'hortifrúti', 'sacolao', 'sacolão', 'mercearia', 'floricultura', 'loja', 'roupa', 'calcados', 'deposito', 'depósito'],
    tokens: {
      ground: '#FAF8F5',
      card_bg: '#FFFFFF',
      border: '#E8E2D9',
      accent: '#15803D',
      accent_hover: '#166534',
      accent_light: '#DCFCE7',
      text_main: '#1C1917',
      text_muted: '#57534E',
      text_subtle: '#78716C',
      whatsapp: '#25D366',
      font_display: "'Plus Jakarta Sans', sans-serif",
      font_body: "'Inter', -apple-system, sans-serif",
      font_import: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'
    },
    sampleLead: {
      name: 'Empório & Hortifrúti Central • Frescor & Tradição',
      city: 'Contagem',
      category: 'Hortifrúti & Mercado Local',
      rating: '4.9',
      reviewsCount: '130',
      phone: '5531998765432',
      address: 'Rua Tiradentes, 890 — Industrial, Contagem - MG'
    },
    hero: {
      pill: 'Frutas e Verduras Frescas do Produtor Todo Dia',
      headline: 'FRESCOR, QUALIDADE E A COMODIDADE DE PEDIR NO WHATSAPP',
      subheadline: 'Produtos selecionados a dedo para a mesa da sua família. Hortifrúti fresquinho, queijos artesanais de Minas, mercearia fina e entrega rápida no seu bairro.',
      hero_img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      floating_card: {
        name: 'Seu Antônio & Família',
        role: 'Tradição no bairro há 22 anos',
        rating: '4.9',
        reviews: '+800 famílias atendidas',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
      }
    },
    services: {
      tag: 'Nossos Setores',
      title: 'TUDO O QUE VOCÊ PRECISA COM QUALIDADE E PREÇO JUSTO',
      subtitle: 'Chegada diária de produtos selecionados diretamente de cooperativas de Minas Gerais.',
      items: [
        {
          title: 'Hortifrúti 100% Selecionado',
          desc: 'Frutas doces, legumes higienizados e folhas verdinhas repostas todas as manhãs sem peças machucadas.',
          badge: 'Chegada Diária',
          img: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Queijos da Canastra & Laticínios',
          desc: 'Autêntico queijo minas artesanal, requeijão de corte, manteiga de garrafa e doces tradicionais.',
          badge: 'Sabor de Minas',
          img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Mercearia & Produtos a Granel',
          desc: 'Grãos selecionados, castanhas frescas, azeites extravirgem e itens de despensa com excelente custo-benefício.',
          badge: 'Granel Saudável',
          img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: 'Delivery pelo WhatsApp no Bairro',
          desc: 'Envie sua lista de compras por texto ou áudio. Montamos com o mesmo carinho que você escolheria.',
          badge: 'Entrega Rápida',
          img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80'
        }
      ]
    },
    about: {
      tag: 'Nossa Tradição',
      title: 'ATENDIMENTO CALOROSO E AQUELE COMPROMISSO DE COMÉRCIO DE VIZINHANÇA',
      desc1: 'Aqui você não é um número em uma esteira de supermercado gigante. Conhecemos nossos clientes pelo nome, sabemos suas preferências e temos orgulho de fazer parte da rotina da nossa comunidade.',
      desc2: 'Trabalhamos com pesagem precisa, preços transparentes e uma política rigorosa: se qualquer item que você comprou não estiver no padrão que esperava, trocamos imediatamente sem burocracia.',
      about_img: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=80',
      floating_badge: {
        title: 'Garantia de Frescor',
        subtitle: 'Se não estiver perfeito, trocamos na hora'
      },
      differentials: [
        'Envie sua Lista de Compras no WhatsApp e Receba em Casa',
        'Pesagem Rigorosa e Preços Justos Todo Dia',
        'Pagamento no Pix, Dinheiro ou Cartão na Maquininha',
        'Estacionamento Rápido na Porta para Carregar as Compras'
      ]
    },
    stats: [
      { num: '100%', label: 'produtos selecionados com garantia de frescor', icon: 'thumbs_up' },
      { num: '22 anos', label: 'de história e tradição na comunidade', icon: 'award' },
      { num: '4.9★', label: 'avaliação média oficial de vizinhos e clientes', icon: 'star' },
      { num: '40 min', label: 'tempo médio de montagem e entrega da sua feira', icon: 'clock' }
    ],
    reviews: {
      tag: 'Vizinhança Satisfeita',
      title: 'O QUE NOSSOS CLIENTES DIZEM',
      items: [
        {
          name: 'Dona Maria de Lourdes',
          role: 'Moradora do Bairro há 15 anos',
          text: 'Compro aqui desde quando abriram. O Seu Antônio escolhe as frutas como se fossem para os filhos dele. O mamão e a banana sempre perfeitos.',
          rating: 5
        },
        {
          name: 'André Guimarães',
          role: 'Pedido no WhatsApp',
          text: 'Mando a foto da lista no WhatsApp toda terça e chega em 30 minutos tudo separado, alface verdinha e sem nada machucado. Sensacional.',
          rating: 5
        },
        {
          name: 'Camila Resende',
          role: 'Queijos & Empório',
          text: 'O queijo canastra deles é o melhor de Contagem. Atendimento cordial e preços muito melhores que os grandes supermercados.',
          rating: 5
        }
      ]
    },
    cta_banner: {
      tag: 'Faça sua Feira Sem Sair de Casa',
      title: 'PREFERE RECEBER SUA COMPRA FRESQUINHA EM CASA?',
      desc: 'Mande sua lista por áudio ou texto no nosso WhatsApp. Entregamos rapidinho com pagamento na maquininha ou Pix.',
      buttonText: 'Mandar Lista no WhatsApp',
      bg_img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'
    },
    info: {
      hours_weekdays: 'Segunda a Sexta: 07:30 às 19:30',
      hours_saturday: 'Sábado: 07:30 às 18:00 | Domingo: 07:30 às 13:00',
      hours_note: 'Entregas em domicílio todos os dias no horário comercial',
      parking_note: 'Vagas rápidas na porta do empório'
    }
  }
};

