export interface Procedure {
  id: string;
  title: string;
  category: 'implant' | 'ortho' | 'aesthetic' | 'general' | 'surgery';
  description: string;
  duration?: string;
  highlight?: string;
  whatsappMessage: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  initials: string;
  localGuide?: boolean;
}

export interface CaseItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ClinicUnit {
  id: 'contagem' | 'betim';
  title: string;
  isMain?: boolean;
  address: string;
  complement: string;
  cityState: string;
  cep: string;
  phoneDisplay: string;
  phoneRaw: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  embedUrl: string;
  weekHours: string;
  satHours: string;
}

export interface ContactInfo {
  phoneDisplay: string;
  phoneRaw: string;
  betimPhoneDisplay: string;
  betimPhoneRaw: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  address: string;
  addressComplement: string;
  cityState: string;
  cep: string;
  googleMapsUrl: string;
  weekHours: string;
  satHours: string;
}
