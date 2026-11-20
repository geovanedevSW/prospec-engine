import { Procedure, Review, CaseItem, FaqItem, ContactInfo, ClinicUnit } from './types';

export const clinicUnits: ClinicUnit[] = [
  {
    id: 'contagem',
    title: 'Unidade Contagem',
    isMain: true,
    address: 'Rua Antônio Bernardino Muniz, 155',
    complement: 'Loja 02 — Centro',
    cityState: 'Contagem - MG',
    cep: '32040-630',
    phoneDisplay: '(31) 3390-0979',
    phoneRaw: '553133900979',
    whatsappDisplay: '(31) 98557-9266',
    whatsappNumber: '5531985579266',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=R.+Antônio+Bernardino+Muniz,+155+-+Centro,+Contagem+-+MG,+32040-630',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.272186717522!2d-44.05602492477317!3d-19.932402181457814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa69528ea28be75%3A0x4665ca8cf9eec0c1!2sR.%20Ant%C3%B4nio%20Bernardino%20Muniz%2C%20155%20-%20Centro%2C%20Contagem%20-%20MG%2C%2032040-630!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr',
    weekHours: 'Segunda a Sexta: 08:00 às 19:00',
    satHours: 'Sábados: 08:00 às 13:00'
  },
  {
    id: 'betim',
    title: 'Unidade Betim',
    isMain: false,
    address: 'Av. Belo Horizonte, 1220',
    complement: 'B. Jardim Teresópolis',
    cityState: 'Betim - MG',
    cep: '32670-340',
    phoneDisplay: '(31) 3390-0979',
    phoneRaw: '553133900979',
    whatsappDisplay: '(31) 98557-9266',
    whatsappNumber: '5531985579266',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=AV.+Belo+horizonte,+1220+-+B.+Jardim+Teres%C3%B3polis+-+Betim',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3750.485121404098!2d-44.15421252477218!3d-19.96492328143493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa69562725a39cb%3A0x4f127cb46f7bc293!2sAv.%20Belo%20Horizonte%2C%201220%20-%20Jardim%20Teresopolis%2C%20Betim%20-%20MG!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr',
    weekHours: 'Segunda a Sexta: 08:00 às 18:30',
    satHours: 'Sábados: 08:00 às 12:30'
  }
];

export const contactInfo: ContactInfo = {
  phoneDisplay: '(31) 3390-0979',
  phoneRaw: '553133900979',
  betimPhoneDisplay: '(31) 3390-0979',
  betimPhoneRaw: '553133900979',
  whatsappDisplay: '(31) 98557-9266',
  whatsappNumber: '5531985579266',
  address: 'Rua Antônio Bernardino Muniz, 155',
  addressComplement: 'Loja 02 — Centro',
  cityState: 'Contagem - MG',
  cep: '32040-630',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=R.+Antônio+Bernardino+Muniz,+155+-+Centro,+Contagem+-+MG,+32040-630',
  weekHours: 'Segunda a Sexta: 08:00 às 19:00',
  satHours: 'Sábados: 08:00 às 13:00'
};

export const proceduresList: Procedure[] = [
  {
    id: 'implante',
    title: 'Implante Dentário',
    category: 'implant',
    description: 'Recupere dentes perdidos com tecnologia de titânio de osseointegração rápida. Mastigação firme e estética natural.',
    duration: 'Planejamento digital 3D',
    highlight: 'Mais Procurado',
    whatsappMessage: 'Olá! Gostaria de informações e agendamento para Implante Dentário na DS Odontologia.'
  },
  {
    id: 'invisalign',
    title: 'Invisalign / Alinhadores',
    category: 'ortho',
    description: 'Alinhamento ortodôntico transparente, confortável e removível. Trate seu sorriso com discrição e sem fios metálicos.',
    duration: 'Escaneamento digital',
    highlight: 'Tecnologia Estética',
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Invisalign e alinhadores transparentes na DS Odontologia.'
  },
  {
    id: 'aparelho',
    title: 'Aparelho Ortodôntico',
    category: 'ortho',
    description: 'Aparelhos fixos metálicos e cerâmicos para correção de mordida e dentes desalinhados em crianças, jovens e adultos.',
    duration: 'Manutenção mensal',
    whatsappMessage: 'Olá! Tenho interesse em avaliação para Aparelho Ortodôntico na DS Odontologia.'
  },
  {
    id: 'clareamento',
    title: 'Clareamento Dental',
    category: 'aesthetic',
    description: 'Protocolos combinados em consultório a laser e moldeira caseira para dentes brancos e luminosos com zero sensibilidade.',
    duration: 'Sessões de 45 min',
    highlight: 'Resultado Rápido',
    whatsappMessage: 'Olá! Gostaria de agendar uma avaliação para Clareamento Dental na DS Odontologia.'
  },
  {
    id: 'facetas',
    title: 'Facetas / Lentes de Contato',
    category: 'aesthetic',
    description: 'Lâminas ultrafinas de porcelana ou resina injetada para corrigir formato, cor, espaçamentos e textura do sorriso.',
    duration: 'Design Personalizado',
    whatsappMessage: 'Olá! Gostaria de saber mais sobre Facetas e Lentes de Contato dental na DS Odontologia.'
  },
  {
    id: 'consulta-geral',
    title: 'Consulta Geral & Check-up',
    category: 'general',
    description: 'Avaliação clínica minuciosa com câmera intraoral, diagnóstico preventivo e plano de tratamento transparente sem surpresas.',
    duration: 'Atendimento humanizado',
    whatsappMessage: 'Olá! Gostaria de agendar uma Consulta Geral e check-up com dentista na DS Odontologia.'
  },
  {
    id: 'canal',
    title: 'Tratamento de Canal (Endodontia)',
    category: 'general',
    description: 'Eliminação da infecção e dor na raiz com sistema rotatório mecanizado de alta precisão, preservando a estrutura do dente.',
    duration: 'Sessão única na maioria dos casos',
    whatsappMessage: 'Olá! Preciso de atendimento ou avaliação para Tratamento de Canal na DS Odontologia.'
  },
  {
    id: 'protese',
    title: 'Prótese Dentária',
    category: 'implant',
    description: 'Próteses parciais, fixas, removíveis e totais com materiais de alta durabilidade e estabilidade para mastigar com confiança.',
    duration: 'Conforto anatômico',
    whatsappMessage: 'Olá! Gostaria de saber sobre Próteses Dentárias na DS Odontologia.'
  },
  {
    id: 'harmonizacao',
    title: 'Harmonização Orofacial',
    category: 'aesthetic',
    description: 'Toxina botulínica, preenchimento labial e bioestimuladores de colágeno aplicados por cirurgiões-dentistas qualificados.',
    duration: 'Procedimento em consultório',
    whatsappMessage: 'Olá! Gostaria de agendar avaliação para Harmonização Orofacial na DS Odontologia.'
  },
  {
    id: 'periodontia',
    title: 'Tratamento Periodontal',
    category: 'general',
    description: 'Cuidado e recuperação das gengivas inflamadas, sangramentos e suporte ósseo dental. Prevenção de perda de dentes.',
    duration: 'Controle de biofilme',
    whatsappMessage: 'Olá! Gostaria de agendar avaliação periodontal para cuidados na gengiva na DS Odontologia.'
  },
  {
    id: 'odontopediatria',
    title: 'Odontopediatria (Infantil)',
    category: 'general',
    description: 'Atendimento lúdico e paciente para bebês e crianças. Uma experiência acolhedora que transforma o medo em sorriso.',
    duration: 'Ambiente acolhedor',
    highlight: 'Espaço Família',
    whatsappMessage: 'Olá! Gostaria de agendar consulta com a Odontopediatra para meu filho(a) na DS Odontologia.'
  },
  {
    id: 'emergencia-24h',
    title: 'Emergência Dentária',
    category: 'surgery',
    description: 'Alívio imediato para dor aguda, quedas de restauração, traumas dentários e infecções. Prioridade na triagem.',
    duration: 'Atendimento prioritário',
    highlight: 'Plantão Rápido',
    whatsappMessage: 'URGENTE: Olá! Preciso de atendimento de Emergência Dentária na DS Odontologia.'
  },
  {
    id: 'extracao-siso',
    title: 'Extração de Siso',
    category: 'surgery',
    description: 'Cirurgia segura com anestesia localizada eficiente e técnicas minimamente invasivas para siso incluso ou impactado.',
    duration: 'Pós-operatório assistido',
    whatsappMessage: 'Olá! Gostaria de avaliar e agendar a Extração do Siso na DS Odontologia.'
  },
  {
    id: 'limpeza',
    title: 'Limpeza Dental (Profilaxia)',
    category: 'general',
    description: 'Remoção ultrassônica de tártaro, jato de bicarbonato e aplicação de flúor para hálito fresco e gengivas saudáveis.',
    duration: 'Sessão de 30 min',
    whatsappMessage: 'Olá! Gostaria de marcar uma Limpeza Dental preventiva na DS Odontologia.'
  },
  {
    id: 'protese-protocolo',
    title: 'Prótese Protocolo',
    category: 'implant',
    description: 'Reabilitação total fixa sobre 4 ou 6 implantes. Diga adeus às dentaduras móveis e recupere 100% da força mastigatória.',
    duration: 'Reabilitação completa',
    highlight: 'Transformação Total',
    whatsappMessage: 'Olá! Tenho interesse na Prótese Protocolo fixa sobre implantes na DS Odontologia.'
  },
  {
    id: 'bruxismo',
    title: 'Bruxismo e DTM',
    category: 'general',
    description: 'Placas miorrelaxantes personalizadas e protocolos para dores na mandíbula, estalos e desgaste noturno dos dentes.',
    duration: 'Placa rígida acrílica',
    whatsappMessage: 'Olá! Gostaria de avaliação para tratamento de Bruxismo e dor na mandíbula na DS Odontologia.'
  },
  {
    id: 'radiografia',
    title: 'Radiografia Odontológica',
    category: 'general',
    description: 'Diagnóstico por imagem rápido com baixa dosagem radiológica para planejamento preciso no próprio consultório.',
    duration: 'Exame rápido',
    whatsappMessage: 'Olá! Gostaria de saber sobre exames radiográficos e consultas na DS Odontologia.'
  }
];

export const googleReviews: Review[] = [
  {
    id: '1',
    author: 'Mariana Duarte Ramos',
    rating: 5,
    date: 'há 2 meses',
    text: 'Atendimento maravilhoso desde a recepção até a cadeira do dentista. Fiz meu tratamento de canal e não senti dor nenhuma. Toda a equipe é muito atenciosa e o ambiente é muito limpo e moderno.',
    initials: 'MD',
    localGuide: true
  },
  {
    id: '2',
    author: 'Carlos Eduardo Nogueira',
    rating: 5,
    date: 'há 3 semanas',
    text: 'Coloquei 2 implantes na DS Odontologia do Centro de Contagem. Fiquei muito satisfeito com o resultado e com o acompanhamento no pós-operatório. Nota 10 pela transparência no orçamento!',
    initials: 'CN'
  },
  {
    id: '3',
    author: 'Patrícia Alvarenga Silva',
    rating: 5,
    date: 'há 1 mês',
    text: 'Levo meus dois filhos para a odontopediatra da clínica. Eles perderam o medo de dentista, o carinho e o cuidado com as crianças é exemplar. Recomendo de olhos fechados!',
    initials: 'PA',
    localGuide: true
  },
  {
    id: '4',
    author: 'Renato Gomes de Souza',
    rating: 4,
    date: 'há 4 meses',
    text: 'Excelente localização bem no centro de Contagem. Profissionais muito capacitados e pontuais na consulta marcada. Fiz clareamento e limpeza preventiva.',
    initials: 'RG'
  },
  {
    id: '5',
    author: 'Juliana Beatriz Faria',
    rating: 5,
    date: 'há 1 mês',
    text: 'Fiz a colocação de aparelho e estou adorando a evolução. Ambiente muito acolhedor, dentistas pacientes que explicam cada etapa e preço muito justo.',
    initials: 'JF'
  },
  {
    id: '6',
    author: 'Marcos Vinícius Santos',
    rating: 5,
    date: 'há 2 meses',
    text: 'Fui atendido em uma emergência de dor aguda e resolveram na hora com muito profissionalismo. A estrutura da clínica passa muita segurança!',
    initials: 'MS',
    localGuide: true
  }
];

export const caseStudies: CaseItem[] = [
  {
    id: '1',
    title: 'Reabilitação do Sorriso',
    subtitle: 'Alinhamento & Clareamento',
    image: './images/caso-antes-depois.jpg',
    tag: 'Estética Dental'
  },
  {
    id: '2',
    title: 'Lentes e Resinas Estéticas',
    subtitle: 'Harmonia, cor e formato',
    image: './images/caso-sorriso.jpg',
    tag: 'Facetas'
  },
  {
    id: '3',
    title: 'Implante & Função Mastigatória',
    subtitle: 'Segurança e naturalidade',
    image: './images/caso-implante.jpg',
    tag: 'Implantes'
  }
];

export const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'Como agendar uma avaliação na DS Odontologia?',
    answer: 'Você pode agendar diretamente pelo WhatsApp oficial (31) 98557-9266 ou pelo formulário online do site. Nossa equipe responde rapidamente com os horários disponíveis que melhor se ajustam à sua rotina.'
  },
  {
    id: '2',
    question: 'Vocês atendem em Contagem e Betim?',
    answer: 'Sim! Temos a unidade principal no Centro de Contagem (Rua Antônio Bernardino Muniz, 155) e também nossa unidade em Betim (Av. Belo Horizonte, 1220 - B. Jardim Teresópolis), ambas com o mesmo telefone de atendimento (31) 3390-0979.'
  },
  {
    id: '3',
    question: 'Quais são as formas de pagamento disponíveis?',
    answer: 'Facilitamos o tratamento em até 12x no cartão de crédito, aceitamos cartões de débito, Pix e condições especiais para tratamentos de reabilitação e implantes.'
  },
  {
    id: '4',
    question: 'O tratamento de canal dói?',
    answer: 'Não. Utilizamos anestésicos modernos de alta eficácia e instrumentos rotatórios mecanizados que tornam o procedimento indolor, rápido e muito mais confortável do que os métodos antigos.'
  },
  {
    id: '5',
    question: 'Como funciona o atendimento de emergência dentária?',
    answer: 'Pacientes com dor de dente aguda, quedas de restaurações ou traumas são recebidos com prioridade imediata para alívio rápido do desconforto.'
  }
];
