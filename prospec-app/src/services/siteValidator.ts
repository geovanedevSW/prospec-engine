import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Repository } from '../persistence/database.js';
import { Lead } from '../domain/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface SiteValidationResult {
  url: string;
  finalUrl?: string;
  status: 'online' | 'offline' | 'whatsapp' | 'social' | 'bio_link';
  httpCode?: number;
  pitchType: 'active_site' | 'offline_site' | 'whatsapp_site' | 'social_site' | 'bio_site' | 'no_site' | 'google_sites';
  siteStatus: 'online' | 'offline' | 'whatsapp' | 'social' | 'bio_link';
  siteAuditReason: string;
  durationMs: number;
}

const WA_DOMAINS = [
  'wa.me', 'api.whatsapp.com', 'whatsapp.com', 'chat.whatsapp.com',
  'web.whatsapp.com', 'contate.me', 'wa.link', 'whats.link', 'meugrupo.vip'
];

const SOCIAL_DOMAINS: Record<string, string> = {
  'instagram.com': 'Instagram',
  'instagr.am': 'Instagram',
  'facebook.com': 'Facebook',
  'fb.com': 'Facebook',
  'fb.me': 'Facebook',
  'm.facebook.com': 'Facebook',
  'web.facebook.com': 'Facebook',
  'messenger.com': 'Messenger',
  'tiktok.com': 'TikTok',
  'linkedin.com': 'LinkedIn',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'twitter.com': 'X / Twitter',
  'x.com': 'X / Twitter',
  'threads.net': 'Threads'
};

const BIO_DOMAINS: Record<string, string> = {
  'linktr.ee': 'Linktree',
  'beacons.ai': 'Beacons',
  'bio.site': 'Bio.site',
  'solo.to': 'Solo.to',
  'linkin.bio': 'Linkin.bio',
  'taplink.cc': 'Taplink',
  'campsite.bio': 'Campsite',
  'flowcode.com': 'Flowcode',
  'heylink.me': 'Heylink'
};

export class SiteValidator {
  private static auditCachePath = path.resolve(__dirname, '..', '..', '..', 'google-maps-scraper-kit', 'app', 'data', 'site-audits.json');

  static classifyDestination(urlStr: string): { type: 'whatsapp' | 'social' | 'bio_link'; label: string } | null {
    try {
      const norm = urlStr.includes('://') ? urlStr : `https://${urlStr}`;
      const parsed = new URL(norm);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

      for (const d of WA_DOMAINS) {
        if (host === d || host.endsWith('.' + d)) {
          return { type: 'whatsapp', label: 'WhatsApp' };
        }
      }

      for (const [d, label] of Object.entries(SOCIAL_DOMAINS)) {
        if (host === d || host.endsWith('.' + d)) {
          return { type: 'social', label };
        }
      }

      for (const [d, label] of Object.entries(BIO_DOMAINS)) {
        if (host === d || host.endsWith('.' + d)) {
          return { type: 'bio_link', label };
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  static async validateUrl(rawUrl: string, timeoutMs = 12000): Promise<SiteValidationResult> {
    const trimmed = (rawUrl || '').trim();
    const startTime = Date.now();

    if (!trimmed) {
      return {
        url: rawUrl,
        status: 'offline',
        pitchType: 'no_site',
        siteStatus: 'offline',
        siteAuditReason: 'Sem site cadastrado',
        durationMs: 0
      };
    }

    // Direct classification for social/wa/bio
    const destDirect = this.classifyDestination(trimmed);
    if (destDirect) {
      const pitchMap = {
        whatsapp: 'whatsapp_site' as const,
        social: 'social_site' as const,
        bio_link: 'bio_site' as const
      };
      return {
        url: trimmed,
        status: destDirect.type,
        pitchType: pitchMap[destDirect.type],
        siteStatus: destDirect.type,
        siteAuditReason: `Redireciona para ${destDirect.label} (Sem site próprio)`,
        durationMs: 0
      };
    }

    let urlToTry = trimmed;
    if (!/^https?:\/\//i.test(urlToTry)) {
      urlToTry = `https://${urlToTry}`;
    }

    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Sec-Ch-Ua': '"Not-A.Brand";v="99", "Chromium";v="124", "Google Chrome";v="124"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0'
    };

    // Helper for single request with abort signal
    const fetchWithTimeout = async (targetUrl: string, ms: number) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(targetUrl, {
          method: 'GET',
          headers: browserHeaders,
          redirect: 'follow',
          signal: controller.signal
        });
        clearTimeout(timer);
        return { res, error: null };
      } catch (err: any) {
        clearTimeout(timer);
        return { res: null, error: err };
      }
    };

    // Attempt 1: Standard HTTPS (or provided scheme)
    let { res, error } = await fetchWithTimeout(urlToTry, timeoutMs);

    // Attempt 2: If failed with SSL or connection reset and was HTTPS, fallback to HTTP
    if (!res && urlToTry.startsWith('https://')) {
      const httpUrl = urlToTry.replace(/^https:\/\//i, 'http://');
      const fallback = await fetchWithTimeout(httpUrl, Math.max(8000, timeoutMs - 4000));
      if (fallback.res) {
        res = fallback.res;
        error = null;
      }
    }

    const durationMs = Date.now() - startTime;

    if (res) {
      const finalUrl = res.url || urlToTry;
      const finalDest = this.classifyDestination(finalUrl);

      if (finalDest) {
        const pitchMap = {
          whatsapp: 'whatsapp_site' as const,
          social: 'social_site' as const,
          bio_link: 'bio_site' as const
        };
        return {
          url: trimmed,
          finalUrl,
          status: finalDest.type,
          pitchType: pitchMap[finalDest.type],
          siteStatus: finalDest.type,
          siteAuditReason: `Redireciona para ${finalDest.label} (Sem site próprio)`,
          durationMs
        };
      }

      if (finalUrl.includes('sites.google.com') || trimmed.includes('sites.google.com')) {
        return {
          url: trimmed,
          finalUrl,
          status: 'online',
          httpCode: res.status,
          pitchType: 'google_sites',
          siteStatus: 'online',
          siteAuditReason: 'Site feito no Google Sites (Oportunidade de Conversão / Upgrade)',
          durationMs
        };
      }

      // Success codes 200..399
      if (res.status >= 200 && res.status < 400) {
        return {
          url: trimmed,
          finalUrl,
          status: 'online',
          httpCode: res.status,
          pitchType: 'active_site',
          siteStatus: 'online',
          siteAuditReason: `Site ativo e respondendo (${res.status} OK)`,
          durationMs
        };
      }

      // Protection / WAF (403, 401, 429) -> domain is alive with corporate firewall
      if (res.status === 403 || res.status === 401 || res.status === 429) {
        return {
          url: trimmed,
          finalUrl,
          status: 'online',
          httpCode: res.status,
          pitchType: 'active_site',
          siteStatus: 'online',
          siteAuditReason: `Site ativo com proteção corporativa (HTTP ${res.status})`,
          durationMs
        };
      }

      // 404 or 410 -> not found
      if (res.status === 404 || res.status === 410) {
        return {
          url: trimmed,
          finalUrl,
          status: 'offline',
          httpCode: res.status,
          pitchType: 'offline_site',
          siteStatus: 'offline',
          siteAuditReason: `Site fora do ar (HTTP ${res.status})`,
          durationMs
        };
      }

      // Server error 500..599
      if (res.status >= 500) {
        return {
          url: trimmed,
          finalUrl,
          status: 'offline',
          httpCode: res.status,
          pitchType: 'offline_site',
          siteStatus: 'offline',
          siteAuditReason: `Erro no servidor de hospedagem (HTTP ${res.status})`,
          durationMs
        };
      }

      return {
        url: trimmed,
        finalUrl,
        status: 'offline',
        httpCode: res.status,
        pitchType: 'offline_site',
        siteStatus: 'offline',
        siteAuditReason: `Site inacessível (HTTP ${res.status})`,
        durationMs
      };
    }

    // Handled network errors
    const errorMsg = error?.message || String(error || 'Erro desconhecido');
    let reason = 'Site fora do ar / inacessível';

    if (errorMsg.includes('aborted') || errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
      reason = 'Tempo esgotado após 12s de espera (Inacessível)';
    } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo') || errorMsg.includes('EAI_AGAIN')) {
      reason = 'Domínio expirado / não encontrado (DNS)';
    } else if (errorMsg.includes('ECONNREFUSED')) {
      reason = 'Conexão recusada pelo servidor de hospedagem';
    } else if (errorMsg.includes('ECONNRESET')) {
      reason = 'Conexão reiniciada pelo servidor (Reset)';
    } else if (errorMsg.includes('CERT') || errorMsg.includes('SSL') || errorMsg.includes('TLS')) {
      reason = 'Falha crítica de certificado SSL/TLS';
    }

    return {
      url: trimmed,
      status: 'offline',
      httpCode: 0,
      pitchType: 'offline_site',
      siteStatus: 'offline',
      siteAuditReason: reason,
      durationMs
    };
  }

  static async revalidateLead(leadId: string): Promise<{ lead: Lead | null; result: SiteValidationResult }> {
    const lead = Repository.getLeadById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado`);
    }

    if (!lead.website || lead.website.trim() === '') {
      return {
        lead,
        result: {
          url: '',
          status: 'offline',
          pitchType: 'no_site',
          siteStatus: 'offline',
          siteAuditReason: 'Sem site cadastrado',
          durationMs: 0
        }
      };
    }

    const result = await this.validateUrl(lead.website);

    // Update in SQLite
    const updatedLead = Repository.updateLeadSiteAudit(lead.id, {
      websiteType: result.status === 'whatsapp' || result.status === 'social' || result.status === 'bio_link' ? result.status : 'website',
      siteStatus: result.siteStatus,
      pitchType: result.pitchType,
      siteAuditReason: result.siteAuditReason
    });

    // Update cache file in scraper kit
    this.updateCacheEntry(lead.website, result);

    return { lead: updatedLead, result };
  }

  static async revalidateTimeouts(limit = 100, onProgress?: (current: number, total: number, result: SiteValidationResult) => void): Promise<{
    totalChecked: number;
    recoveredOnline: number;
    stillOffline: number;
    redirectsFound: number;
    results: Array<{ leadId: string; name: string; website: string; result: SiteValidationResult }>;
  }> {
    const leads = Repository.getLeadsWithTimeout(limit);
    const results: Array<{ leadId: string; name: string; website: string; result: SiteValidationResult }> = [];

    let recoveredOnline = 0;
    let stillOffline = 0;
    let redirectsFound = 0;

    // Run with gentle concurrency (4 parallel workers) to avoid IP throttling
    const concurrency = 4;
    let index = 0;

    const worker = async () => {
      while (index < leads.length) {
        const currentIndex = index++;
        const item = leads[currentIndex];
        try {
          const val = await this.validateUrl(item.website);

          Repository.updateLeadSiteAudit(item.id, {
            websiteType: val.status === 'whatsapp' || val.status === 'social' || val.status === 'bio_link' ? val.status : 'website',
            siteStatus: val.siteStatus,
            pitchType: val.pitchType,
            siteAuditReason: val.siteAuditReason
          });

          this.updateCacheEntry(item.website, val);

          if (val.pitchType === 'active_site') recoveredOnline++;
          else if (val.pitchType === 'offline_site') stillOffline++;
          else redirectsFound++;

          results.push({ leadId: item.id, name: item.name, website: item.website, result: val });

          if (onProgress) {
            onProgress(results.length, leads.length, val);
          }
        } catch {
          // ignore individual worker failure
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, leads.length) }, () => worker());
    await Promise.all(workers);

    return {
      totalChecked: results.length,
      recoveredOnline,
      stillOffline,
      redirectsFound,
      results
    };
  }

  private static updateCacheEntry(url: string, result: SiteValidationResult) {
    try {
      if (!fs.existsSync(this.auditCachePath)) return;
      const raw = fs.readFileSync(this.auditCachePath, 'utf8');
      const cache = JSON.parse(raw);
      cache[url] = {
        url,
        finalUrl: result.finalUrl || url,
        status: result.status,
        httpCode: result.httpCode,
        reason: result.siteAuditReason,
        checkedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.auditCachePath, JSON.stringify(cache, null, 2), 'utf8');
    } catch {
      // cache sync failure is non-blocking
    }
  }
}

