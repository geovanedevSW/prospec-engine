import fs from 'node:fs/promises';
import path from 'node:path';
import {
  DiscoveryAdapter,
  DiscoveryCapabilities,
  CampaignInput,
  DiscoveryResult,
  DiscoveredLead,
  PitchType
} from '../domain/types.js';
import { SCRAPER_DIR } from '../config.js';

export function optimizeGoogleCdnUrl(url?: string, size = 'w1200-h800-p-k-no'): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('http')) return trimmed;

  if (/googleusercontent\.com/i.test(trimmed)) {
    // Replace existing size parameters e.g. =w120-h120, =s120, =w100-h100-p-k-no
    if (/=[wshkbp0-9\-]+$/i.test(trimmed)) {
      return trimmed.replace(/=[wshkbp0-9\-]+$/i, `=${size}`);
    }
    if (!trimmed.includes('=')) {
      return `${trimmed}=${size}`;
    }
  }
  return trimmed;
}

export function normalizePhotos(raw?: any): string | undefined {
  if (!raw) return undefined;
  try {
    let list: any[] = [];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return undefined;
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        list = JSON.parse(trimmed);
      } else if (trimmed.includes(';') || trimmed.includes(',')) {
        list = trimmed.split(/;|,/).map(s => s.trim()).filter(Boolean);
      } else if (trimmed.startsWith('http')) {
        list = [trimmed];
      }
    } else if (Array.isArray(raw)) {
      list = raw;
    }

    const cleanUrls = list.map(item => {
      if (typeof item === 'string') return optimizeGoogleCdnUrl(item);
      if (item && typeof item === 'object') {
        const url = item.link || item.url || item.image || item.photo || item.src || item.thumbnail;
        return typeof url === 'string' ? optimizeGoogleCdnUrl(url) : null;
      }
      return null;
    }).filter((u): u is string => Boolean(u && u.startsWith('http')));

    return cleanUrls.length > 0 ? JSON.stringify(cleanUrls) : undefined;
  } catch {
    return undefined;
  }
}

export class ScraperKitAdapter implements DiscoveryAdapter {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || SCRAPER_DIR;
  }

  async capabilities(): Promise<DiscoveryCapabilities> {
    const outDir = path.join(this.baseDir, 'out');
    let hasCached = false;
    try {
      const files = await fs.readdir(outDir);
      hasCached = files.some(f => f.endsWith('.csv'));
    } catch {
      hasCached = false;
    }

    return {
      canSearchLive: false, // Live scraper engine requires active Docker container
      canImportCSV: true,
      hasCachedData: hasCached,
      supportedFormats: ['csv', 'json']
    };
  }

  async discover(input: CampaignInput): Promise<DiscoveryResult> {
    const outDir = path.join(this.baseDir, 'out');
    let targetFile = input.filePath;

    try {
      if (!targetFile) {
        const priorityCandidates = [
          path.join(outDir, 'contagem-leads-reviews.csv'),
          path.join(outDir, 'rmbh', 'by-city-reviews', 'contagem.csv'),
          path.join(outDir, 'teste-reviews.csv'),
          path.join(outDir, 'rmbh-leads.csv')
        ];
        for (const cand of priorityCandidates) {
          const ok = await fs.stat(cand).then(() => true).catch(() => false);
          if (ok) {
            targetFile = cand;
            break;
          }
        }
      }

      const exists = targetFile ? await fs.stat(targetFile).catch(() => null) : null;
      if (!exists) {
        // Fallback to any csv or json in out
        const files = await fs.readdir(outDir).catch(() => []);
        const validFile = files.find(f => f.endsWith('.csv') || f.endsWith('.json'));
        if (!validFile) {
          return { totalFound: 0, leads: [], sourceFile: targetFile || 'none' };
        }
        targetFile = path.join(outDir, validFile);
      }

      const auditCache = await this.loadAuditCache();
      const content = await fs.readFile(targetFile, 'utf-8');
      const leads = targetFile.endsWith('.json')
        ? this.parseJSONLeads(content, path.basename(targetFile), auditCache, input.limit)
        : this.parseCSVLeads(content, path.basename(targetFile), auditCache, input.limit);

      return {
        totalFound: leads.length,
        leads,
        sourceFile: targetFile
      };
    } catch (error: any) {
      console.error('[ScraperKitAdapter] Error reading discovery data:', error.message);
      return { totalFound: 0, leads: [] };
    }
  }

  private async loadAuditCache(): Promise<Record<string, any>> {
    try {
      const cachePath = path.join(this.baseDir, 'app', 'data', 'site-audits.json');
      const data = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private parseCSVLeads(
    content: string,
    sourceName: string,
    auditCache: Record<string, any>,
    limit?: number
  ): DiscoveredLead[] {
    const cleanContent = content.replace(/^\ufeff/, '');
    const lines = cleanContent.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]).map(h => h.replace(/^\ufeff/, '').trim().toLowerCase());
    const nameIdx = headers.findIndex(h => ['title', 'name', 'nome', 'business'].includes(h));
    const phoneIdx = headers.findIndex(h => ['phone', 'telefone', 'tel'].includes(h));
    const webIdx = headers.findIndex(h => ['website', 'site', 'url', 'web'].includes(h));
    const catIdx = headers.findIndex(h => ['category', 'categoria', 'type'].includes(h));
    const addrIdx = headers.findIndex(h => ['address', 'endereço', 'endereco', 'area'].includes(h));
    const cityIdx = headers.findIndex(h => ['municipality', 'municipio', 'city', 'cidade'].includes(h));
    const ratingIdx = headers.findIndex(h => ['review_rating', 'rating'].includes(h));
    const countIdx = headers.findIndex(h => ['review_count', 'reviews_count'].includes(h));
    const reviewsIdx = headers.findIndex(h => ['user_reviews', 'user_reviews_extended', 'reviews', 'comentarios', 'comentários'].includes(h));
    const thumbIdx = headers.findIndex(h => ['thumbnail', 'thumb', 'cover', 'cover_image', 'thumbnail_url', 'imagem', 'foto_capa'].includes(h));
    const photosIdx = headers.findIndex(h => ['images', 'photos', 'gallery', 'gallery_images', 'fotos'].includes(h));
    const logoIdx = headers.findIndex(h => ['logo', 'logo_url', 'avatar', 'avatar_url'].includes(h));
    const latIdx = headers.findIndex(h => ['latitude', 'lat'].includes(h));
    const lngIdx = headers.findIndex(h => ['longitude', 'lon', 'lng'].includes(h));

    const leads: DiscoveredLead[] = [];
    const max = limit ? Math.min(lines.length - 1, limit) : lines.length - 1;

    for (let i = 1; i <= max; i++) {
      const cols = this.parseCSVLine(lines[i]);
      const rawName = cols[nameIdx] || '';
      if (!rawName.trim()) continue;

      const rawPhone = cols[phoneIdx] || '';
      const rawWeb = cols[webIdx] || '';
      const rawCat = cols[catIdx] || '';

      // Ignore government domains and public entities
      const rawWebLower = rawWeb.toLowerCase();
      if (rawWebLower.includes('.gov.br') || rawWebLower.includes('.gov/') || rawWebLower.endsWith('.gov')) {
        continue;
      }
      const rawCatLower = rawCat.toLowerCase();
      if (rawCatLower.includes('city or town hall') || rawCatLower.includes('government') || rawName.toLowerCase().startsWith('prefeitura')) {
        continue;
      }
      const rawAddr = cols[addrIdx] || '';
      const rawCity = cols[cityIdx] || this.extractCityFromAddress(rawAddr);
      const rawThumb = thumbIdx !== -1 && cols[thumbIdx]?.trim() ? cols[thumbIdx].trim() : '';
      const rawPhotos = photosIdx !== -1 && cols[photosIdx]?.trim() ? cols[photosIdx].trim() : '';
      const rawLogo = logoIdx !== -1 && cols[logoIdx]?.trim() ? cols[logoIdx].trim() : '';
      const parsedLat = latIdx !== -1 && cols[latIdx]?.trim() ? parseFloat(cols[latIdx].trim()) : NaN;
      const parsedLng = lngIdx !== -1 && cols[lngIdx]?.trim() ? parseFloat(cols[lngIdx].trim()) : NaN;

      const phoneNorm = this.normalizePhone(rawPhone);
      const { websiteType, siteStatus, pitchType, siteAuditReason } = this.classifyPresence(rawWeb, auditCache);

      leads.push({
        source: `google-maps-scraper-kit:${sourceName}`,
        name: rawName.trim(),
        category: rawCat.trim(),
        address: rawAddr.trim(),
        city: rawCity.trim(),
        phoneRaw: rawPhone.trim(),
        phoneNorm,
        website: rawWeb.trim(),
        websiteType,
        siteStatus,
        pitchType,
        siteAuditReason,
        rating: cols[ratingIdx] || undefined,
        reviewsCount: cols[countIdx] || undefined,
        userReviews: reviewsIdx !== -1 && cols[reviewsIdx]?.trim() ? cols[reviewsIdx].trim() : undefined,
        thumbnailUrl: rawThumb ? optimizeGoogleCdnUrl(rawThumb) : undefined,
        logoUrl: rawLogo ? optimizeGoogleCdnUrl(rawLogo) : undefined,
        photos: normalizePhotos(rawPhotos),
        latitude: !isNaN(parsedLat) ? parsedLat : undefined,
        longitude: !isNaN(parsedLng) ? parsedLng : undefined
      });
    }

    return leads;
  }

  private parseJSONLeads(
    content: string,
    sourceName: string,
    auditCache: Record<string, any>,
    limit?: number
  ): DiscoveredLead[] {
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : (parsed.leads || parsed.results || []);
      const max = limit ? Math.min(items.length, limit) : items.length;
      const leads: DiscoveredLead[] = [];

      for (let i = 0; i < max; i++) {
        const item = items[i];
        const rawName = item.title || item.name || item.business || '';
        if (!rawName.trim()) continue;

        const rawPhone = item.phone || item.telefone || '';
        const rawWeb = item.website || item.site || item.url || '';
        const rawCat = item.category || item.categoria || '';

        // Ignore government domains and public entities
        const rawWebLower = rawWeb.toLowerCase();
        if (rawWebLower.includes('.gov.br') || rawWebLower.includes('.gov/') || rawWebLower.endsWith('.gov')) {
          continue;
        }
        const rawCatLower = rawCat.toLowerCase();
        if (rawCatLower.includes('city or town hall') || rawCatLower.includes('government') || rawName.toLowerCase().startsWith('prefeitura')) {
          continue;
        }
        const rawAddr = item.address || item.endereco || '';
        const rawCity = item.municipality || item.city || item.cidade || this.extractCityFromAddress(rawAddr);

        const phoneNorm = this.normalizePhone(rawPhone);
        const { websiteType, siteStatus, pitchType, siteAuditReason } = this.classifyPresence(rawWeb, auditCache);

        let userReviews: string | undefined = undefined;
        if (item.user_reviews || item.user_reviews_extended || item.reviews) {
          const rawRev = item.user_reviews || item.user_reviews_extended || item.reviews;
          userReviews = typeof rawRev === 'string' ? rawRev : JSON.stringify(rawRev);
        }

        const rawThumb = item.thumbnail || item.thumbnail_url || item.featured_image || item.cover || '';
        const rawPhotos = item.images || item.photos || item.gallery;
        const rawLogo = item.logo || item.logo_url || item.avatar || '';
        const rawLat = item.latitude !== undefined && item.latitude !== '' ? parseFloat(String(item.latitude)) : undefined;
        const rawLng = item.longitude !== undefined && item.longitude !== '' ? parseFloat(String(item.longitude)) : (item.lon !== undefined && item.lon !== '' ? parseFloat(String(item.lon)) : undefined);

        leads.push({
          source: `google-maps-scraper-kit:${sourceName}`,
          name: rawName.trim(),
          category: rawCat.trim(),
          address: rawAddr.trim(),
          city: rawCity.trim(),
          phoneRaw: rawPhone.trim(),
          phoneNorm,
          website: rawWeb.trim(),
          websiteType,
          siteStatus,
          pitchType,
          siteAuditReason,
          rating: item.review_rating ? String(item.review_rating) : undefined,
          reviewsCount: item.review_count ? String(item.review_count) : undefined,
          userReviews,
          thumbnailUrl: rawThumb ? optimizeGoogleCdnUrl(rawThumb) : undefined,
          logoUrl: rawLogo ? optimizeGoogleCdnUrl(rawLogo) : undefined,
          photos: normalizePhotos(rawPhotos),
          latitude: rawLat !== undefined && !isNaN(rawLat) ? rawLat : undefined,
          longitude: rawLng !== undefined && !isNaN(rawLng) ? rawLng : undefined
        });
      }
      return leads;
    } catch (e: any) {
      console.error('[ScraperKitAdapter] Failed to parse JSON leads:', e.message);
      return [];
    }
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current);
    return fields;
  }

  private normalizePhone(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10 || digits.length === 11) {
      return `55${digits}`;
    }
    return digits;
  }

  private extractCityFromAddress(address: string): string {
    if (!address) return '';
    const parts = address.split(',').map(p => p.trim());
    for (const part of parts) {
      if (part.toLowerCase().includes('belo horizonte')) return 'Belo Horizonte';
      if (part.toLowerCase().includes('contagem')) return 'Contagem';
      if (part.toLowerCase().includes('betim')) return 'Betim';
      if (part.toLowerCase().includes('nova lima')) return 'Nova Lima';
    }
    return '';
  }

  private classifyPresence(rawUrl: string, auditCache: Record<string, any>): {
    websiteType: 'none' | 'whatsapp' | 'social' | 'bio_link' | 'google_maps' | 'website';
    siteStatus: 'none' | 'whatsapp' | 'social' | 'bio_link' | 'google_maps' | 'online' | 'offline' | 'unverified';
    pitchType: PitchType;
    siteAuditReason?: string;
  } {
    const url = (rawUrl || '').trim();
    if (!url || url === '-' || url.toLowerCase() === 'n/a') {
      return {
        websiteType: 'none',
        siteStatus: 'none',
        pitchType: 'no_site',
        siteAuditReason: 'Sem site cadastrado'
      };
    }

    const lower = url.toLowerCase();
    if (lower.includes('wa.me') || lower.includes('whatsapp.com') || lower.includes('contate.me') || lower.includes('wa.link')) {
      return {
        websiteType: 'whatsapp',
        siteStatus: 'whatsapp',
        pitchType: 'whatsapp_site',
        siteAuditReason: 'Usa link direto do WhatsApp no lugar de site próprio'
      };
    }

    if (lower.includes('instagram.com') || lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('tiktok.com')) {
      return {
        websiteType: 'social',
        siteStatus: 'social',
        pitchType: 'social_site',
        siteAuditReason: 'Usa perfil de rede social no lugar de site profissional'
      };
    }

    if (lower.includes('linktr.ee') || lower.includes('bio.site') || lower.includes('beacons.ai') || lower.includes('taplink.cc')) {
      return {
        websiteType: 'bio_link',
        siteStatus: 'bio_link',
        pitchType: 'bio_site',
        siteAuditReason: 'Usa agregador de links de bio no lugar de site estruturado'
      };
    }

    if (lower.includes('maps.google.com') || lower.includes('goo.gl/maps') || lower.includes('maps.app.goo.gl')) {
      return {
        websiteType: 'google_maps',
        siteStatus: 'google_maps',
        pitchType: 'no_site',
        siteAuditReason: 'Link aponta para o próprio Google Maps'
      };
    }

    if (lower.includes('sites.google.com')) {
      return {
        websiteType: 'google_sites',
        siteStatus: 'online',
        pitchType: 'google_sites',
        siteAuditReason: 'Site feito no Google Sites (Oportunidade de Conversão / Upgrade)'
      };
    }

    // Official website candidate - check cached audit
    const cachedAudit = auditCache[url] || auditCache[url.replace(/\/$/, '')];
    if (cachedAudit) {
      if (cachedAudit.status === 'offline' || cachedAudit.httpCode >= 400 || cachedAudit.status === 'error') {
        return {
          websiteType: 'website',
          siteStatus: 'offline',
          pitchType: 'offline_site',
          siteAuditReason: cachedAudit.reason || `Site fora do ar (HTTP ${cachedAudit.httpCode || 'offline'})`
        };
      }
      return {
        websiteType: 'website',
        siteStatus: 'online',
        pitchType: 'active_site',
        siteAuditReason: 'Site ativo e respondendo 200 OK'
      };
    }

    return {
      websiteType: 'website',
      siteStatus: 'unverified',
      pitchType: 'active_site',
      siteAuditReason: 'Site cadastrado, pendente de verificação'
    };
  }
}

