import React from 'react';
import { HealthTemplate } from './HealthTemplate.js';
import { FitnessTemplate } from './FitnessTemplate.js';
import { GastroTemplate } from './GastroTemplate.js';
import { AutoTemplate } from './AutoTemplate.js';
import { BeautyTemplate } from './BeautyTemplate.js';
import { PetTemplate } from './PetTemplate.js';
import { ServicesTemplate } from './ServicesTemplate.js';
import { RetailTemplate } from './RetailTemplate.js';
import { NicheTemplateProps } from './types.js';
import { detectNicheFromCategory } from './detectNiche.js';

interface NicheLandingPageProps extends NicheTemplateProps {
  nicheKey?: string;
}

export const NicheLandingPage: React.FC<NicheLandingPageProps> = ({
  nicheKey,
  lead,
  viewport = 'desktop',
  onCtaClick
}) => {
  // Se nicheKey não for passado, autodetecta a partir do nicho do comércio
  const effectiveNiche = nicheKey || detectNicheFromCategory(lead?.category, lead?.name);

  switch (effectiveNiche) {
    case 'fitness':
      return <FitnessTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'gastro':
      return <GastroTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'auto':
      return <AutoTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'beauty':
      return <BeautyTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'pet':
      return <PetTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'services':
      return <ServicesTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'retail':
      return <RetailTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
    case 'health':
    default:
      return <HealthTemplate lead={lead} viewport={viewport} onCtaClick={onCtaClick} />;
  }
};

