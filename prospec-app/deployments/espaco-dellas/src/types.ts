export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  duration?: string;
  priceNote?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  text: string;
  date?: string;
  tag?: string;
}

export interface ResultItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface DifferentialItem {
  id: string;
  title: string;
  desc?: string;
}

export interface BusinessHours {
  days: string;
  hours: string;
  note?: string;
}

export interface DesignTokens {
  ground: string;
  groundWarm: string;
  cardBg: string;
  border: string;
  borderLight: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  textMain: string;
  textMuted: string;
  textSubtle: string;
  whatsapp: string;
  whatsappHover: string;
  star: string;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  headline: string;
  subheadline: string;
  city: string;
  state: string;
  category: string;
  phoneRaw: string;
  phoneNorm: string;
  rating: number;
  reviewsCount: number;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    fullFormatted: string;
    mapsSearchUrl: string;
    wazeUrl: string;
  };
  hours: BusinessHours;
  about: {
    title: string;
    description: string;
    highlight: string;
    imageUrl: string;
  };
  heroImageUrl: string;
  services: ServiceItem[];
  results: ResultItem[];
  reviews: ReviewItem[];
  faqs: FaqItem[];
  differentials: DifferentialItem[];
  tokens: DesignTokens;
}

