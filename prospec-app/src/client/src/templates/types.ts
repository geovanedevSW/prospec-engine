import { Lead } from '../../../domain/types.js';

export interface TemplateLeadData {
  bname: string;
  city: string;
  cat: string;
  phone: string;
  phoneClean: string;
  waLink: string;
  mapsLink: string;
  rating: string;
  revCount: string | number;
  address: string;
  lead?: Partial<Lead>;
}

export interface NicheTemplateProps {
  lead?: Partial<Lead>;
  viewport?: 'desktop' | 'mobile' | 'tablet';
  onCtaClick?: (ctaType: string) => void;
}

