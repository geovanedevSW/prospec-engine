import { NICHE_KITS, NicheKit } from './nicheKits.js';
import { Lead } from '../domain/types.js';
import {
  renderFitness,
  renderGastro,
  renderAuto,
  renderBeauty,
  renderPet,
  renderServices,
  renderRetail,
  renderHealth
} from './renderers/index.js';

export class NicheRenderer {
  /**
   * Renders the production-grade, 100% responsive, pixel-perfect HTML
   * for any of the 8 distinct Brazilian Niche Architectures.
   *
   * Each niche has its own tailored layout, industry-specific conversion
   * mechanics, bespoke sections, and verified zero-scrollbar mobile ergonomics.
   */
  static render(nicheKey: string, options?: { viewport?: 'desktop' | 'mobile'; lead?: Partial<Lead> }): string {
    const kit: NicheKit = NICHE_KITS[nicheKey] || NICHE_KITS['retail'] || NICHE_KITS['services'];

    switch (nicheKey) {
      case 'fitness':
        return renderFitness(kit, options);

      case 'gastro':
        return renderGastro(kit, options);

      case 'auto':
        return renderAuto(kit, options);

      case 'beauty':
        return renderBeauty(kit, options);

      case 'pet':
        return renderPet(kit, options);

      case 'services':
        return renderServices(kit, options);

      case 'retail':
        return renderRetail(kit, options);

      case 'health':
        return renderHealth(kit, options);

      default:
        // Default fallback
        if (kit.id === 'health') return renderHealth(kit, options);
        if (kit.id === 'services') return renderServices(kit, options);
        return renderRetail(kit, options);
    }
  }
}
