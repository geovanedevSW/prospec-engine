import { BusinessConfig } from './types';

export const siteData: BusinessConfig = {
  name: 'Espaço Dellas Ana Paula Pereira',
  tagline: 'Salão de Beleza & Estética • Baldim MG',
  headline: 'Cabelo, unhas e beleza em Baldim, com um horário só seu.',
  subheadline:
    'Conheça os serviços especializados da Ana Paula Pereira. Atendimento com hora marcada, biossegurança rigorosa e cuidado minucioso em cada detalhe.',
  city: 'Baldim',
  state: 'MG',
  category: 'Salão de Beleza & Estética',
  phoneRaw: '(31) 99061-4366',
  phoneNorm: '5531990614366',
  rating: 4.9,
  reviewsCount: 48,
  address: {
    street: 'Rua Geraldo Marquês, 228',
    neighborhood: 'Centro',
    city: 'Baldim',
    state: 'MG',
    zip: '35732-000',
    fullFormatted: 'Rua Geraldo Marquês, 228 - Centro, Baldim - MG',
    mapsSearchUrl:
      'https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o%20Dellas%20Ana%20Paula%20Pereira%20Rua%20Geraldo%20Marqu%C3%AAs%20228%20Baldim%20MG',
    wazeUrl:
      'https://waze.com/ul?q=Rua%20Geraldo%20Marques%20228%20Baldim%20MG&navigate=yes'
  },
  hours: {
    days: 'Terça a Sábado',
    hours: '08h30 às 18h30',
    note: 'Atendimento exclusivo com hora marcada'
  },
  about: {
    title: 'Sobre a Ana Paula e o Espaço',
    highlight: 'Atendimento humanizado, técnicas modernas e cuidado em cada detalhe.',
    description:
      'Com anos de experiência e dedicação no segmento de beleza em Baldim, a Ana Paula Pereira criou um ambiente privativo, pensado para que você relaxe e desfrute de um momento só seu. Cada procedimento é realizado com calma, produtos profissionais certificados e respeito absoluto pelo seu estilo e bem-estar.',
    imageUrl: '/images/sobre-atendimento.jpg'
  },
  heroImageUrl: '/images/hero.jpg',
  services: [
    {
      id: 'cabelos',
      title: 'Cortes & Tratamentos Capilares',
      desc: 'Cortes femininos, escovas modeladas, botox capilar, hidratação profunda e mechas com produtos profissionais de alto padrão.',
      badge: 'Mais Procurado',
      duration: '45 - 90 min'
    },
    {
      id: 'manicure',
      title: 'Manicure & Pedicure Spa',
      desc: 'Esmaltação de longa duração, blindagem, cuticulagem delicada e spa dos pés com instrumentos esterilizados em autoclave hospitalar.',
      badge: 'Biossegurança',
      duration: '50 min'
    },
    {
      id: 'sobrancelhas',
      title: 'Design de Sobrancelhas',
      desc: 'Alinhamento visagista que valoriza a simetria natural do seu rosto, com opção de aplicação de henna profissional de alta fixação.',
      badge: 'Personalizado',
      duration: '35 min'
    },
    {
      id: 'estetica',
      title: 'Estética Facial & Cuidados',
      desc: 'Limpeza de pele profunda, drenagem facial e cuidados dedicados para renovação, firmeza e luminosidade da sua pele.',
      badge: 'Especializado',
      duration: '60 min'
    }
  ],
  results: [
    {
      id: 'res-1',
      title: 'Cabelos & Mechas',
      subtitle: 'Tratamentos e mechas personalizadas com brilho e saúde',
      imageUrl: '/images/resultado-cabelos.jpg',
      badge: 'Capilar'
    },
    {
      id: 'res-2',
      title: 'Manicure & Pedicure Spa',
      subtitle: 'Cuidado delicado e durabilidade prolongada na esmaltação',
      imageUrl: '/images/resultado-manicure.jpg',
      badge: 'Unhas'
    },
    {
      id: 'res-3',
      title: 'Design de Sobrancelhas',
      subtitle: 'Alinhamento visagista que realça o olhar com naturalidade',
      imageUrl: '/images/resultado-sobrancelhas.jpg',
      badge: 'Olhar'
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      author: 'Mariângela Santos',
      rating: 5,
      text: 'Ambiente maravilhoso, acolhedor e atendimento nota 10. A Ana Paula é extremamente atenciosa, pontual e muito caprichosa no serviço!',
      tag: 'Cliente Verificada no Google'
    },
    {
      id: 'rev-2',
      author: 'Carla Ribeiro',
      rating: 5,
      text: 'Sempre saio renovada. Produtos de altíssima qualidade e um cuidado impecável com cada detalhe. O melhor salão de Baldim com certeza.',
      tag: 'Cliente Verificada no Google'
    },
    {
      id: 'rev-3',
      author: 'Fernanda Oliveira',
      rating: 5,
      text: 'Design de sobrancelha impecável e manicure que dura a semana inteira! Facilidade excelente para agendar pelo WhatsApp.',
      tag: 'Cliente Verificada no Google'
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'Como funciona o agendamento com hora marcada?',
      answer:
        'O agendamento é feito previamente pelo WhatsApp para garantir que o horário fique reservado exclusivamente para o seu atendimento, sem filas e com a atenção total que você merece.'
    },
    {
      id: 'faq-2',
      question: 'Como é garantida a biossegurança dos instrumentos?',
      answer:
        'Todos os alicates, espátulas e instrumentos metálicos são lavados e esterilizados em autoclave hospitalar com envelopes lacrados e indicador biológico. Lixas, palitos, toalhas e luvas são 100% descartáveis.'
    },
    {
      id: 'faq-3',
      question: 'Preciso fazer avaliação antes de fazer mechas ou químicas?',
      answer:
        'Sim. Antes de qualquer processo químico ou mechas, realizamos uma análise prévia e teste de mecha para diagnosticar a estrutura dos fios e garantir um resultado seguro e saudável.'
    },
    {
      id: 'faq-4',
      question: 'Quais são as formas de pagamento aceitas?',
      answer:
        'Aceitamos Pix, dinheiro e cartões de crédito e débito das principais bandeiras, com possibilidade de parcelamento para tratamentos capilares e pacotes.'
    },
    {
      id: 'faq-5',
      question: 'Onde o salão fica localizado e como estacionar?',
      answer:
        'Estamos na Rua Geraldo Marquês, 228, no Centro de Baldim. Um ponto nobre, tranquilo, de fácil acesso e com facilidade para estacionar em frente.'
    }
  ],
  differentials: [
    { id: 'diff-1', title: 'Atendimento 100% com Hora Marcada' },
    { id: 'diff-2', title: 'Biossegurança & Autoclave Hospitalar' },
    { id: 'diff-3', title: 'Produtos Profissionais Certificados' },
    { id: 'diff-4', title: 'Localização Privilegiada no Centro de Baldim' }
  ],
  tokens: {
    ground: '#FAF8F5',
    groundWarm: '#F5EFEB',
    cardBg: '#FFFFFF',
    border: '#E8E2D9',
    borderLight: '#F0ECE4',
    accent: '#8A3D4D',
    accentHover: '#733340',
    accentLight: '#F4EBEF',
    textMain: '#1C1917',
    textMuted: '#57534E',
    textSubtle: '#78716C',
    whatsapp: '#25D366',
    whatsappHover: '#22BF5B',
    star: '#F59E0B'
  }
};

export function getWhatsAppUrl(message?: string): string {
  const defaultMsg = `Olá Ana Paula! Gostaria de consultar os horários disponíveis no Espaço Dellas.`;
  const text = message || defaultMsg;
  return `https://wa.me/${siteData.phoneNorm}?text=${encodeURIComponent(text)}`;
}

export function getServiceBookingWhatsAppUrl(serviceTitle: string, period?: string): string {
  const periodText = period ? ` para o período da ${period.toLowerCase()}` : '';
  const text = `Olá Ana Paula! Gostaria de agendar um horário para *${serviceTitle}*${periodText}. Quais horários você tem disponíveis?`;
  return `https://wa.me/${siteData.phoneNorm}?text=${encodeURIComponent(text)}`;
}

