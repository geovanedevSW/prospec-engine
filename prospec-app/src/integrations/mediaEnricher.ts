import { optimizeGoogleCdnUrl, normalizePhotos } from './discoveryAdapter.js';
import { OpenWAAdapter } from './messagingAdapter.js';
import { Lead } from '../domain/types.js';

export class MediaEnricher {
  private static openWa = new OpenWAAdapter();

  /**
   * Fetches official WhatsApp avatar / logo using OpenWA gateway.
   */
  static async fetchWhatsAppLogo(phone?: string): Promise<string | null> {
    if (!phone) return null;
    try {
      return await this.openWa.fetchProfilePicture(phone);
    } catch {
      return null;
    }
  }

  /**
   * Extracts og:image / profile picture from Instagram, Facebook, or web page.
   */
  static async fetchSocialOgImage(url?: string): Promise<string | null> {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const html = await res.text();

      // Look for og:image meta tag
      const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

      if (ogMatch && ogMatch[1] && ogMatch[1].startsWith('http')) {
        return ogMatch[1].replace(/&amp;/g, '&');
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generates a high-fidelity Street View facade image URL from coordinates.
   */
  static getStreetViewUrl(lat?: number | string, lng?: number | string): string | null {
    if (lat !== undefined && lng !== undefined) {
      const nLat = Number(lat);
      const nLng = Number(lng);
      if (!isNaN(nLat) && !isNaN(nLng) && (nLat !== 0 || nLng !== 0)) {
        return `https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${nLat},${nLng}&fov=90&heading=235&pitch=10`;
      }
    }
    return null;
  }

  /**
   * Helper that optimizes and normalizes all images in a lead object.
   */
  static processLeadImages(lead: Partial<Lead>): {
    thumbnailUrl?: string;
    logoUrl?: string;
    photos?: string;
    streetViewUrl?: string;
  } {
    const thumbnailUrl = lead.thumbnailUrl ? optimizeGoogleCdnUrl(lead.thumbnailUrl, 'w1600-h900-p-k-no') : undefined;
    const logoUrl = lead.logoUrl ? optimizeGoogleCdnUrl(lead.logoUrl, 's240-c-k-no') : undefined;
    const photos = normalizePhotos(lead.photos);
    const streetViewUrl = this.getStreetViewUrl(lead.latitude, lead.longitude) || undefined;

    return {
      thumbnailUrl,
      logoUrl,
      photos,
      streetViewUrl
    };
  }
}

