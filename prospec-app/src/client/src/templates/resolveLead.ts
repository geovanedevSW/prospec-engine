import { Lead } from '../../../domain/types.js';
import { TemplateLeadData } from './types.js';

export function resolveTemplateLead(lead?: Partial<Lead>, defaultCat: string = 'Comércio Local'): TemplateLeadData {
  const bname = lead?.name || 'Comércio Local Referência';
  const city = lead?.city || 'Belo Horizonte';
  const cat = lead?.category || defaultCat;
  const phone = lead?.phoneNorm || lead?.phoneRaw || '(31) 99876-5432';
  const phoneClean = phone.replace(/\D/g, '') || '5531998765432';
  const address = lead?.address || `Av. Principal, 1200 - Centro, ${city}`;
  const rating = lead?.rating ? parseFloat(lead.rating).toFixed(1) : '4.9';
  const revCount = lead?.reviewsCount || '750+';

  const waLink = `https://wa.me/${phoneClean}?text=${encodeURIComponent(
    `Olá! Conheci a ${bname} pelo site e gostaria de solicitar um atendimento/orçamento.`
  )}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${bname} ${address}`
  )}`;

  return {
    bname,
    city,
    cat,
    phone,
    phoneClean,
    waLink,
    mapsLink,
    rating,
    revCount,
    address,
    lead
  };
}

