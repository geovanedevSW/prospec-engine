import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { Lead, Briefing, Prototype, MessageRecord, CommercialStage } from '../domain/types.js';
import { DATA_DIR, DB_PATH } from '../config.js';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA busy_timeout = 10000;
  PRAGMA journal_mode = WAL;
`);

// Helper to sanitize undefined -> null for node:sqlite
const sanitize = (val: any) => (val === undefined ? null : val);

export const NICHE_DICTIONARY: Record<string, { label: string; iconName: string; desc: string }> = {
  beleza: { label: 'Beleza & Estética', iconName: 'Scissors', desc: 'Barbearias, salões de beleza, esmalterias, spas e estética' },
  saude: { label: 'Saúde & Odonto', iconName: 'HeartPulse', desc: 'Dentistas, consultórios médicos, clínicas especializadas e fisioterapia' },
  automotivo: { label: 'Automotivo & Mecânica', iconName: 'Wrench', desc: 'Oficinas mecânicas, auto elétricas, funilaria, pneus e autopeças' },
  pet: { label: 'Pet Shop & Veterinária', iconName: 'PawPrint', desc: 'Clínicas veterinárias, banho & tosa, pet shops e lojas de ração' },
  fitness: { label: 'Fitness & Academias', iconName: 'Activity', desc: 'Academias, estúdios de pilates, crossfit, artes marciais e esportes' },
  manutencao: { label: 'Manutenção & Serviços', iconName: 'Hammer', desc: 'Encanadores, eletricistas, maridos de aluguel e desentupidoras' },
  alimentacao: { label: 'Alimentação & Gastronomia', iconName: 'UtensilsCrossed', desc: 'Restaurantes, pizzarias, hamburguerias, confeitarias e lanches' },
  outros: { label: 'Outros Comércios', iconName: 'Building2', desc: 'Comércio varejista, serviços locais e escritórios' }
};

export function classifyNiche(category?: string | null): { id: string; label: string; iconName: string } {
  if (!category) return { id: 'outros', label: NICHE_DICTIONARY.outros.label, iconName: NICHE_DICTIONARY.outros.iconName };
  const c = String(category).toLowerCase();
  if (/barber|beauty|salon|hair|nail|spa|sal[aã]o|est[eé]tica|manicur|sobrancelh|beautician|cosmet|tattoo/.test(c)) {
    return { id: 'beleza', label: NICHE_DICTIONARY.beleza.label, iconName: NICHE_DICTIONARY.beleza.iconName };
  }
  if (/dent|doctor|medic|clinic|hospital|fisioter|sa[uú]de|psico|surgeon|therapy|chiropract|optom|health/.test(c)) {
    return { id: 'saude', label: NICHE_DICTIONARY.saude.label, iconName: NICHE_DICTIONARY.saude.iconName };
  }
  if (/auto|repair|car|pneu|freio|mecanic|oficina|ve[ií]culo|funilaria|motorcycle|towing|tire|oil change/.test(c)) {
    return { id: 'automotivo', label: NICHE_DICTIONARY.automotivo.label, iconName: NICHE_DICTIONARY.automotivo.iconName };
  }
  if (/pet|reptile|veterinar|animal|c[aã]o|gato|aquarium/.test(c)) {
    return { id: 'pet', label: NICHE_DICTIONARY.pet.label, iconName: NICHE_DICTIONARY.pet.iconName };
  }
  if (/gym|fitness|pilates|trainer|academia|crossfit|esporte|martial|yoga|dance/.test(c)) {
    return { id: 'fitness', label: NICHE_DICTIONARY.fitness.label, iconName: NICHE_DICTIONARY.fitness.iconName };
  }
  if (/plumber|handyman|electric|locksmith|encanad|desentup|hidr[aá]ulic|marido de aluguel|eletricist|roofing|painter|contractor|air conditioning|hvac/.test(c)) {
    return { id: 'manutencao', label: NICHE_DICTIONARY.manutencao.label, iconName: NICHE_DICTIONARY.manutencao.iconName };
  }
  if (/restaurant|pizza|bar|caf[eé]|bakery|food|lanche|padaria|a[cç]a[ií]|burger|snack|ice cream/.test(c)) {
    return { id: 'alimentacao', label: NICHE_DICTIONARY.alimentacao.label, iconName: NICHE_DICTIONARY.alimentacao.iconName };
  }
  return { id: 'outros', label: NICHE_DICTIONARY.outros.label, iconName: NICHE_DICTIONARY.outros.iconName };
}

// Register custom SQL functions for fast SQLite queries
db.function('niche_id', (category: any) => classifyNiche(category).id);
db.function('niche_label', (category: any) => classifyNiche(category).label);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    source TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    phone_raw TEXT DEFAULT '',
    phone_norm TEXT DEFAULT '',
    website TEXT DEFAULT '',
    website_type TEXT DEFAULT 'none',
    site_status TEXT DEFAULT 'none',
    site_audit_reason TEXT,
    rating TEXT,
    reviews_count TEXT,
    user_reviews TEXT,
    thumbnail_url TEXT,
    logo_url TEXT,
    photos TEXT,
    latitude REAL,
    longitude REAL,
    priority TEXT DEFAULT 'media',
    stage TEXT DEFAULT 'novo',
    pitch_type TEXT DEFAULT 'no_site',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS briefings (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    business_name TEXT NOT NULL,
    segment TEXT DEFAULT '',
    target_audience TEXT DEFAULT '',
    services TEXT DEFAULT '[]',
    cta TEXT DEFAULT '',
    reference_links TEXT DEFAULT '[]',
    identity_notes TEXT DEFAULT '',
    status TEXT DEFAULT 'rascunho',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS prototypes (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    brief_id TEXT,
    provider TEXT DEFAULT 'builtin_generator',
    status TEXT DEFAULT 'em_revisao',
    artifact_type TEXT DEFAULT 'html_prototype',
    url TEXT NOT NULL,
    preview_html TEXT,
    screenshot_path TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    direction TEXT DEFAULT 'outbound',
    body TEXT NOT NULL,
    status TEXT DEFAULT 'preparada',
    approved INTEGER DEFAULT 0,
    approved_at TEXT,
    sent_at TEXT,
    provider_msg_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    lead_id TEXT,
    payload TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_copilot_messages (
    id TEXT PRIMARY KEY,
    lead_id TEXT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- High-Performance B-Tree Indexes (Structured Indexing)
  CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON leads(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
  CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
  CREATE INDEX IF NOT EXISTS idx_leads_pitch_type ON leads(pitch_type);
  CREATE INDEX IF NOT EXISTS idx_leads_phone_norm ON leads(phone_norm);
  CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);
  CREATE INDEX IF NOT EXISTS idx_prototypes_lead_id ON prototypes(lead_id);
  CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
  CREATE INDEX IF NOT EXISTS idx_briefings_lead_id ON briefings(lead_id);
  CREATE INDEX IF NOT EXISTS idx_ai_copilot_created ON ai_copilot_messages(created_at ASC);
  CREATE INDEX IF NOT EXISTS idx_ai_copilot_lead ON ai_copilot_messages(lead_id);
`);

// Safe migrations for newly added columns if table existed previously
const safeMigrations = [
  'ALTER TABLE leads ADD COLUMN user_reviews TEXT',
  'ALTER TABLE leads ADD COLUMN thumbnail_url TEXT',
  'ALTER TABLE leads ADD COLUMN logo_url TEXT',
  'ALTER TABLE leads ADD COLUMN photos TEXT',
  'ALTER TABLE leads ADD COLUMN latitude REAL',
  'ALTER TABLE leads ADD COLUMN longitude REAL',
  'ALTER TABLE leads ADD COLUMN vercel_url TEXT',
  'ALTER TABLE leads ADD COLUMN vercel_deployed_at TEXT',
  'ALTER TABLE prototypes ADD COLUMN vercel_url TEXT',
  'ALTER TABLE prototypes ADD COLUMN vercel_deployment_id TEXT',
  'ALTER TABLE prototypes ADD COLUMN vercel_deployed_at TEXT',
];
for (const sql of safeMigrations) {
  try {
    db.exec(sql);
  } catch {
    // Column already exists or already migrated
  }
}

// In-Memory RAM Cache for frequent read-heavy dashboard queries
interface RamCacheEntry<T> {
  data: T;
  expiresAt: number;
}
const ramCache = new Map<string, RamCacheEntry<any>>();

export function getCached<T>(key: string, ttlMs: number, compute: () => T): T {
  const now = Date.now();
  const cached = ramCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const data = compute();
  ramCache.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    ramCache.clear();
    return;
  }
  for (const k of ramCache.keys()) {
    if (k.startsWith(prefix)) {
      ramCache.delete(k);
    }
  }
}

export class Repository {
  static getStats() {
    return getCached('repo_stats', 8000, () => {
      const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
      const stageCounts = db.prepare('SELECT stage, COUNT(*) as count FROM leads GROUP BY stage').all() as { stage: string; count: number }[];
      const pitchCounts = db.prepare('SELECT pitch_type, COUNT(*) as count FROM leads GROUP BY pitch_type').all() as { pitch_type: string; count: number }[];
      const cityCounts = db.prepare("SELECT city, COUNT(*) as count FROM leads WHERE city != '' AND city IS NOT NULL GROUP BY city ORDER BY count DESC").all() as { city: string; count: number }[];
      const nicheCounts = this.getNichesWithCounts();
      const hasReviews = db.prepare("SELECT COUNT(*) as count FROM leads WHERE (reviews_count IS NOT NULL AND reviews_count != '' AND reviews_count != '0') OR (user_reviews IS NOT NULL AND user_reviews != '' AND user_reviews != '[]')").get() as { count: number };
      const totalPrototypes = db.prepare('SELECT COUNT(*) as count FROM prototypes').get() as { count: number };
      const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get() as { count: number };

      return {
        totalLeads: totalLeads.count,
        stageCounts: Object.fromEntries(stageCounts.map(s => [s.stage, s.count])),
        pitchCounts: Object.fromEntries(pitchCounts.map(p => [p.pitch_type, p.count])),
        cityCounts,
        nicheCounts,
        hasReviewsCount: hasReviews.count,
        totalPrototypes: totalPrototypes.count,
        totalMessages: totalMessages.count
      };
    });
  }

  static getCitiesWithCounts(): Array<{ city: string; count: number }> {
    return getCached('repo_cities', 15000, () => {
      return db.prepare("SELECT city, COUNT(*) as count FROM leads WHERE city != '' AND city IS NOT NULL GROUP BY city ORDER BY count DESC").all() as any[];
    });
  }

  static getNichesWithCounts(): Array<{ id: string; label: string; count: number; iconName: string; desc: string }> {
    return getCached('repo_niches', 15000, () => {
      const rows = db.prepare(`
        SELECT niche_id(category) as niche_key, COUNT(*) as count
        FROM leads
        GROUP BY niche_key
        ORDER BY count DESC
      `).all() as Array<{ niche_key: string; count: number }>;
      return rows.map(r => {
        const meta = NICHE_DICTIONARY[r.niche_key] || NICHE_DICTIONARY.outros;
        return {
          id: r.niche_key,
          label: meta.label,
          iconName: meta.iconName,
          desc: meta.desc,
          count: r.count
        };
      });
    });
  }

  static getLeads(filters: { search?: string; stage?: string; city?: string; pitchType?: string; niche?: string; limit?: number; offset?: number; summary?: boolean }) {
    let query = `
      SELECT leads.*,
        (SELECT url FROM prototypes WHERE prototypes.lead_id = leads.id AND (prototypes.provider = 'doop' OR prototypes.artifact_type = 'doop_canvas' OR prototypes.id LIKE 'canvas_%') ORDER BY created_at ASC LIMIT 1) as doop_canvas_url,
        (SELECT id FROM prototypes WHERE prototypes.lead_id = leads.id AND (prototypes.provider = 'doop' OR prototypes.artifact_type = 'doop_canvas' OR prototypes.id LIKE 'canvas_%') ORDER BY created_at ASC LIMIT 1) as doop_canvas_id
      FROM leads WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR category LIKE ? OR phone_raw LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }
    if (filters.stage) {
      query += ' AND stage = ?';
      params.push(filters.stage);
    }
    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }
    if (filters.pitchType) {
      query += ' AND pitch_type = ?';
      params.push(filters.pitchType);
    }
    if (filters.niche) {
      query += ' AND niche_id(category) = ?';
      params.push(filters.niche);
    }

    if (filters.limit !== undefined && filters.limit !== null && filters.limit > 0) {
      query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      params.push(filters.limit, filters.offset || 0);
    } else if (filters.offset) {
      query += ' ORDER BY updated_at DESC LIMIT -1 OFFSET ?';
      params.push(filters.offset);
    } else {
      query += ' ORDER BY updated_at DESC';
    }

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(r => this.mapLeadRow(r, filters.summary));
  }

  static getLeadById(id?: string | null): Lead | null {
    if (!id || typeof id !== 'string') return null;
    const row = db.prepare(`
      SELECT leads.*,
        (SELECT url FROM prototypes WHERE prototypes.lead_id = leads.id AND (prototypes.provider = 'doop' OR prototypes.artifact_type = 'doop_canvas' OR prototypes.id LIKE 'canvas_%') ORDER BY created_at ASC LIMIT 1) as doop_canvas_url,
        (SELECT id FROM prototypes WHERE prototypes.lead_id = leads.id AND (prototypes.provider = 'doop' OR prototypes.artifact_type = 'doop_canvas' OR prototypes.id LIKE 'canvas_%') ORDER BY created_at ASC LIMIT 1) as doop_canvas_id
      FROM leads WHERE id = ?
    `).get(id) as any;
    return row ? this.mapLeadRow(row) : null;
  }

  static findExistingLead(key: { phoneNorm?: string; name: string; city: string }): Lead | null {
    if (key.phoneNorm && key.phoneNorm.length >= 8) {
      const match = db.prepare('SELECT * FROM leads WHERE phone_norm = ?').get(key.phoneNorm) as any;
      if (match) return this.mapLeadRow(match);
    }
    const matchName = db.prepare('SELECT * FROM leads WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND LOWER(TRIM(city)) = LOWER(TRIM(?))').get(key.name, key.city) as any;
    return matchName ? this.mapLeadRow(matchName) : null;
  }

  static upsertLead(lead: Partial<Lead> & { name: string; source: string }): Lead {
    const existing = lead.id ? this.getLeadById(lead.id) : this.findExistingLead({
      phoneNorm: lead.phoneNorm,
      name: lead.name,
      city: lead.city || ''
    });

    const now = new Date().toISOString();
    const id = existing?.id || lead.id || crypto.randomUUID();

    if (existing) {
      // Protect operator custom edits: if lead has messages or advanced commercial stage, preserve phone
      const hasMessages = db.prepare('SELECT 1 FROM messages WHERE lead_id = ? LIMIT 1').get(existing.id);
      const isAdvanced = existing.stage && existing.stage !== 'descoberto';
      const keepExistingPhone = (hasMessages || isAdvanced) && Boolean(existing.phoneNorm || existing.phoneRaw);

      const phoneRawVal = keepExistingPhone ? existing.phoneRaw : (lead.phoneRaw ?? existing.phoneRaw);
      const phoneNormVal = keepExistingPhone ? existing.phoneNorm : (lead.phoneNorm ?? existing.phoneNorm);

      db.prepare(`
        UPDATE leads SET
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          phone_raw = COALESCE(?, phone_raw),
          phone_norm = COALESCE(?, phone_norm),
          website = COALESCE(?, website),
          website_type = COALESCE(?, website_type),
          site_status = COALESCE(?, site_status),
          site_audit_reason = COALESCE(?, site_audit_reason),
          rating = COALESCE(?, rating),
          reviews_count = COALESCE(?, reviews_count),
          user_reviews = COALESCE(?, user_reviews),
          thumbnail_url = COALESCE(?, thumbnail_url),
          logo_url = COALESCE(?, logo_url),
          photos = COALESCE(?, photos),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          pitch_type = COALESCE(?, pitch_type),
          updated_at = ?
        WHERE id = ?
      `).run(
        sanitize(lead.name),
        sanitize(lead.category ?? existing.category),
        sanitize(lead.address ?? existing.address),
        sanitize(lead.city ?? existing.city),
        sanitize(phoneRawVal),
        sanitize(phoneNormVal),
        sanitize(lead.website ?? existing.website),
        sanitize(lead.websiteType ?? existing.websiteType),
        sanitize(lead.siteStatus ?? existing.siteStatus),
        sanitize(lead.siteAuditReason ?? existing.siteAuditReason),
        sanitize(lead.rating ?? existing.rating),
        sanitize(lead.reviewsCount ?? existing.reviewsCount),
        sanitize(lead.userReviews ?? existing.userReviews),
        sanitize(lead.thumbnailUrl ?? existing.thumbnailUrl),
        sanitize(lead.logoUrl ?? existing.logoUrl),
        sanitize(lead.photos ?? existing.photos),
        lead.latitude !== undefined ? lead.latitude : existing.latitude ?? null,
        lead.longitude !== undefined ? lead.longitude : existing.longitude ?? null,
        sanitize(lead.pitchType ?? existing.pitchType),
        now,
        id
      );
    } else {
      db.prepare(`
        INSERT INTO leads (
          id, external_id, source, name, category, address, city,
          phone_raw, phone_norm, website, website_type, site_status,
          site_audit_reason, rating, reviews_count, user_reviews,
          thumbnail_url, logo_url, photos, latitude, longitude,
          priority, stage, pitch_type, notes, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `).run(
        id,
        sanitize(lead.externalId),
        lead.source,
        lead.name,
        sanitize(lead.category ?? ''),
        sanitize(lead.address ?? ''),
        sanitize(lead.city ?? ''),
        sanitize(lead.phoneRaw ?? ''),
        sanitize(lead.phoneNorm ?? ''),
        sanitize(lead.website ?? ''),
        sanitize(lead.websiteType ?? 'none'),
        sanitize(lead.siteStatus ?? 'none'),
        sanitize(lead.siteAuditReason),
        sanitize(lead.rating),
        sanitize(lead.reviewsCount),
        sanitize(lead.userReviews),
        sanitize(lead.thumbnailUrl),
        sanitize(lead.logoUrl),
        sanitize(lead.photos),
        lead.latitude !== undefined ? lead.latitude : null,
        lead.longitude !== undefined ? lead.longitude : null,
        sanitize(lead.priority ?? 'media'),
        sanitize(lead.stage ?? 'novo'),
        sanitize(lead.pitchType ?? 'no_site'),
        sanitize(lead.notes ?? ''),
        now,
        now
      );
    }

    invalidateCache('repo_');
    return this.getLeadById(id)!;
  }

  static updateLeadStage(id: string, stage: CommercialStage, reason?: string): Lead | null {
    if (!id) return null;
    const now = new Date().toISOString();
    db.prepare('UPDATE leads SET stage = ?, updated_at = ? WHERE id = ?').run(stage, now, id);
    invalidateCache('repo_stats');
    this.logEvent({
      type: 'stage_change',
      source: 'operator_ui',
      leadId: id,
      payload: { stage, reason }
    });
    return this.getLeadById(id);
  }

  static updateLead(id: string, updates: Partial<Lead>): Lead | null {
    if (!id) return null;
    const existing = this.getLeadById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const params: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      params.push(sanitize(updates.name));
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      params.push(sanitize(updates.category));
    }
    if (updates.address !== undefined) {
      fields.push('address = ?');
      params.push(sanitize(updates.address));
    }
    if (updates.city !== undefined) {
      fields.push('city = ?');
      params.push(sanitize(updates.city));
    }
    if (updates.phoneRaw !== undefined) {
      fields.push('phone_raw = ?');
      params.push(sanitize(updates.phoneRaw));
    }
    if (updates.phoneNorm !== undefined) {
      fields.push('phone_norm = ?');
      params.push(sanitize(updates.phoneNorm));
    }
    if (updates.website !== undefined) {
      fields.push('website = ?');
      params.push(sanitize(updates.website));
    }
    if (updates.websiteType !== undefined) {
      fields.push('website_type = ?');
      params.push(sanitize(updates.websiteType));
    }
    if (updates.siteStatus !== undefined) {
      fields.push('site_status = ?');
      params.push(sanitize(updates.siteStatus));
    }
    if (updates.pitchType !== undefined) {
      fields.push('pitch_type = ?');
      params.push(sanitize(updates.pitchType));
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      params.push(sanitize(updates.priority));
    }
    if (updates.stage !== undefined) {
      fields.push('stage = ?');
      params.push(sanitize(updates.stage));
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      params.push(sanitize(updates.notes));
    }

    if (fields.length === 0) return existing;

    fields.push('updated_at = ?');
    params.push(now);
    params.push(id);

    db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    invalidateCache('repo_');

    this.logEvent({
      type: 'lead_update',
      source: 'operator_ui',
      leadId: id,
      payload: updates
    });

    return this.getLeadById(id);
  }

  static updateLeadSiteAudit(
    id: string,
    audit: {
      websiteType?: string;
      siteStatus: string;
      pitchType: string;
      siteAuditReason: string;
    }
  ): Lead | null {
    if (!id) return null;
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE leads SET
        website_type = COALESCE(?, website_type),
        site_status = ?,
        pitch_type = ?,
        site_audit_reason = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      audit.websiteType || null,
      audit.siteStatus,
      audit.pitchType,
      audit.siteAuditReason,
      now,
      id
    );

    invalidateCache('repo_stats');
    this.logEvent({
      type: 'site_audit_update',
      source: 'site_validator',
      leadId: id,
      payload: { ...audit }
    });

    return this.getLeadById(id);
  }

  static getLeadsWithTimeout(limit = 250): Array<{ id: string; name: string; website: string }> {
    const rows = db.prepare(`
      SELECT id, name, website FROM leads
      WHERE website != '' AND website IS NOT NULL
        AND (
          site_audit_reason LIKE '%Tempo esgotado%'
          OR site_audit_reason LIKE '%Timeout%'
          OR site_audit_reason LIKE '%servidor não respondeu%'
        )
      LIMIT ?
    `).all(limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      website: r.website
    }));
  }

  static purgeGovLeads(): { deletedCount: number; deleted: Array<{ id: string; name: string; website: string }> } {
    const govRows = db.prepare(`
      SELECT id, name, website FROM leads
      WHERE LOWER(website) LIKE '%.gov%'
         OR LOWER(category) LIKE '%city or town hall%'
         OR LOWER(category) LIKE '%government%'
         OR LOWER(name) LIKE '%prefeitura municipal%'
    `).all() as any[];

    if (govRows.length === 0) {
      return { deletedCount: 0, deleted: [] };
    }

    const deleteStmt = db.prepare('DELETE FROM leads WHERE id = ?');
    for (const r of govRows) {
      db.prepare('DELETE FROM messages WHERE lead_id = ?').run(r.id);
      db.prepare('DELETE FROM prototypes WHERE lead_id = ?').run(r.id);
      db.prepare('DELETE FROM briefings WHERE lead_id = ?').run(r.id);
      deleteStmt.run(r.id);
    }

    return {
      deletedCount: govRows.length,
      deleted: govRows.map((r) => ({ id: r.id, name: r.name, website: r.website }))
    };
  }

  static getBriefingByLead(leadId?: string | null): Briefing | null {
    if (!leadId || typeof leadId !== 'string') return null;
    const row = db.prepare('SELECT * FROM briefings WHERE lead_id = ? ORDER BY version DESC LIMIT 1').get(leadId) as any;
    if (!row) return null;
    return {
      id: row.id,
      leadId: row.lead_id,
      version: row.version,
      businessName: row.business_name,
      segment: row.segment,
      targetAudience: row.target_audience,
      services: JSON.parse(row.services || '[]'),
      cta: row.cta,
      references: JSON.parse(row.reference_links || '[]'),
      identityNotes: row.identity_notes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static saveBriefing(brief: Partial<Briefing> & { leadId: string; businessName: string }): Briefing {
    const existing = this.getBriefingByLead(brief.leadId);
    const now = new Date().toISOString();
    const id = existing?.id || crypto.randomUUID();
    const version = (existing?.version || 0) + 1;

    if (existing) {
      db.prepare(`
        UPDATE briefings SET
          version = ?,
          business_name = ?,
          segment = ?,
          target_audience = ?,
          services = ?,
          cta = ?,
          reference_links = ?,
          identity_notes = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `).run(
        version,
        brief.businessName,
        sanitize(brief.segment ?? ''),
        sanitize(brief.targetAudience ?? ''),
        JSON.stringify(brief.services || []),
        sanitize(brief.cta ?? ''),
        JSON.stringify(brief.references || []),
        sanitize(brief.identityNotes ?? ''),
        sanitize(brief.status ?? 'rascunho'),
        now,
        id
      );
    } else {
      db.prepare(`
        INSERT INTO briefings (
          id, lead_id, version, business_name, segment, target_audience,
          services, cta, reference_links, identity_notes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        brief.leadId,
        1,
        brief.businessName,
        sanitize(brief.segment ?? ''),
        sanitize(brief.targetAudience ?? ''),
        JSON.stringify(brief.services || []),
        sanitize(brief.cta ?? ''),
        JSON.stringify(brief.references || []),
        sanitize(brief.identityNotes ?? ''),
        sanitize(brief.status ?? 'rascunho'),
        now,
        now
      );
    }

    return this.getBriefingByLead(brief.leadId)!;
  }

  static getPrototypesByLead(leadId?: string | null): Prototype[] {
    if (!leadId || typeof leadId !== 'string') return [];
    const rows = db.prepare('SELECT * FROM prototypes WHERE lead_id = ? ORDER BY created_at DESC').all(leadId) as any[];
    return rows.map(r => ({
      id: r.id,
      leadId: r.lead_id,
      briefId: r.brief_id,
      provider: r.provider,
      status: r.status,
      artifactType: r.artifact_type,
      url: r.url,
      previewHtml: r.preview_html,
      screenshotPath: r.screenshot_path,
      vercelUrl: r.vercel_url || undefined,
      vercelDeploymentId: r.vercel_deployment_id || undefined,
      vercelDeployedAt: r.vercel_deployed_at || undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  static getDoopCanvasByLead(leadId?: string | null): Prototype | null {
    if (!leadId || typeof leadId !== 'string') return null;
    const row = db.prepare(`
      SELECT * FROM prototypes 
      WHERE lead_id = ? AND (provider = 'doop' OR artifact_type = 'doop_canvas' OR id LIKE 'canvas_%')
      ORDER BY created_at ASC 
      LIMIT 1
    `).get(leadId) as any;
    if (!row) return null;
    return {
      id: row.id,
      leadId: row.lead_id,
      briefId: row.brief_id,
      provider: row.provider,
      status: row.status,
      artifactType: row.artifact_type,
      url: row.url,
      previewHtml: row.preview_html,
      screenshotPath: row.screenshot_path,
      vercelUrl: row.vercel_url || undefined,
      vercelDeploymentId: row.vercel_deployment_id || undefined,
      vercelDeployedAt: row.vercel_deployed_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static getPrototypeById(id?: string | null): Prototype | null {
    if (!id || typeof id !== 'string') return null;
    const row = db.prepare('SELECT * FROM prototypes WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      leadId: row.lead_id,
      briefId: row.brief_id,
      provider: row.provider,
      status: row.status,
      artifactType: row.artifact_type,
      url: row.url,
      previewHtml: row.preview_html,
      screenshotPath: row.screenshot_path,
      vercelUrl: row.vercel_url || undefined,
      vercelDeploymentId: row.vercel_deployment_id || undefined,
      vercelDeployedAt: row.vercel_deployed_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static savePrototype(p: Partial<Prototype> & { leadId: string; url: string }): Prototype {
    const id = p.id || crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO prototypes (
        id, lead_id, brief_id, provider, status, artifact_type,
        url, preview_html, screenshot_path, vercel_url, vercel_deployment_id, vercel_deployed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        brief_id = COALESCE(excluded.brief_id, prototypes.brief_id),
        provider = excluded.provider,
        status = excluded.status,
        artifact_type = excluded.artifact_type,
        url = excluded.url,
        preview_html = COALESCE(excluded.preview_html, prototypes.preview_html),
        screenshot_path = COALESCE(excluded.screenshot_path, prototypes.screenshot_path),
        vercel_url = COALESCE(excluded.vercel_url, prototypes.vercel_url),
        vercel_deployment_id = COALESCE(excluded.vercel_deployment_id, prototypes.vercel_deployment_id),
        vercel_deployed_at = COALESCE(excluded.vercel_deployed_at, prototypes.vercel_deployed_at),
        updated_at = excluded.updated_at
    `).run(
      id,
      p.leadId,
      sanitize(p.briefId),
      sanitize(p.provider ?? 'builtin_generator'),
      sanitize(p.status ?? 'em_revisao'),
      sanitize(p.artifactType ?? 'html_prototype'),
      p.url,
      sanitize(p.previewHtml),
      sanitize(p.screenshotPath),
      sanitize(p.vercelUrl),
      sanitize(p.vercelDeploymentId),
      sanitize(p.vercelDeployedAt),
      now,
      now
    );

    invalidateCache('repo_stats');
    return this.getPrototypeById(id)!;
  }

  static updatePrototypeVercel(id: string, vercelUrl: string, deploymentId?: string): boolean {
    const now = new Date().toISOString();
    const res = db.prepare(`
      UPDATE prototypes
      SET vercel_url = ?, vercel_deployment_id = ?, vercel_deployed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(vercelUrl, deploymentId || '', now, now, id);
    invalidateCache('repo_stats');
    return res.changes > 0;
  }

  static updateLeadVercel(leadId: string, vercelUrl: string): boolean {
    const now = new Date().toISOString();
    const res = db.prepare(`
      UPDATE leads
      SET vercel_url = ?, vercel_deployed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(vercelUrl, now, now, leadId);
    invalidateCache('repo_stats');
    return res.changes > 0;
  }

  static getLeadByPhone(phone: string): Lead | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return null;
    const last8 = digits.slice(-8);

    const row = db.prepare(`
      SELECT * FROM leads
      WHERE phone_norm LIKE ? OR phone_raw LIKE ?
      LIMIT 1
    `).get(`%${last8}%`, `%${last8}%`) as any;

    return row ? this.mapLeadRow(row) : null;
  }

  static getMessageByProviderId(providerMsgId: string): MessageRecord | null {
    if (!providerMsgId) return null;
    const r = db.prepare('SELECT * FROM messages WHERE provider_msg_id = ? OR id = ? LIMIT 1').get(providerMsgId, providerMsgId) as any;
    if (!r) return null;
    return {
      id: r.id,
      leadId: r.lead_id,
      phone: r.phone,
      direction: r.direction,
      body: r.body,
      status: r.status,
      approved: Boolean(r.approved),
      approvedAt: r.approved_at,
      sentAt: r.sent_at,
      providerMsgId: r.provider_msg_id,
      createdAt: r.created_at
    };
  }

  static getConversationsSummary(): Array<{
    lead: Lead;
    lastMessage: MessageRecord;
    messageCount: number;
    hasInbound: boolean;
    hasInboundHistory: boolean;
    inboundCount: number;
  }> {
    const rows = db.prepare(`
      SELECT 
        l.*,
        m.id as msg_id,
        m.direction as msg_direction,
        m.body as msg_body,
        m.status as msg_status,
        m.sent_at as msg_sent_at,
        m.provider_msg_id as msg_provider_msg_id,
        m.created_at as msg_created_at,
        (SELECT COUNT(*) FROM messages WHERE lead_id = l.id AND TRIM(body) != '') as total_messages,
        (SELECT COUNT(*) FROM messages WHERE lead_id = l.id AND direction = 'inbound' AND TRIM(body) != '') as inbound_count
      FROM leads l
      JOIN messages m ON m.id = (
        SELECT id FROM messages 
        WHERE lead_id = l.id AND TRIM(body) != '' 
        ORDER BY COALESCE(sent_at, created_at) DESC, id DESC 
        LIMIT 1
      )
      ORDER BY COALESCE(m.sent_at, m.created_at) DESC
    `).all() as any[];

    return rows.map(r => ({
      lead: this.mapLeadRow(r),
      lastMessage: {
        id: r.msg_id,
        leadId: r.id,
        phone: r.phone_norm || r.phone_raw,
        direction: r.msg_direction,
        body: r.msg_body,
        status: r.msg_status,
        approved: true,
        sentAt: r.msg_sent_at || r.msg_created_at,
        providerMsgId: r.msg_provider_msg_id,
        createdAt: r.msg_created_at
      },
      messageCount: r.total_messages || 1,
      // hasInbound is true only when the last message was sent by the contact (awaiting operator reply)
      hasInbound: r.msg_direction === 'inbound',
      hasInboundHistory: (r.inbound_count || 0) > 0,
      inboundCount: r.inbound_count || 0
    }));
  }

  static getMessagesByLead(leadId?: string | null): MessageRecord[] {
    if (!leadId || typeof leadId !== 'string') return [];
    const rows = db.prepare(`
      SELECT * FROM messages 
      WHERE lead_id = ? AND TRIM(body) != '' 
      ORDER BY COALESCE(sent_at, created_at) ASC, id ASC
    `).all(leadId) as any[];
    return rows.map(r => ({
      id: r.id,
      leadId: r.lead_id,
      phone: r.phone,
      direction: r.direction,
      body: r.body,
      status: r.status,
      approved: Boolean(r.approved),
      approvedAt: r.approved_at,
      sentAt: r.sent_at || r.created_at,
      providerMsgId: r.provider_msg_id,
      createdAt: r.created_at
    }));
  }

  static saveMessage(m: Partial<MessageRecord> & { leadId: string; phone: string; body: string }): MessageRecord {
    const id = m.id || crypto.randomUUID();
    const now = new Date().toISOString();

    // Prevent storing empty handshake or protocol messages without body
    if ((!m.body || !m.body.trim()) && !(m as any).mediaPath) {
      return {
        id,
        leadId: m.leadId,
        phone: m.phone,
        direction: m.direction ?? 'outbound',
        body: '',
        status: m.status ?? 'descartada',
        approved: false,
        sentAt: m.sentAt || now,
        createdAt: now
      };
    }

    db.prepare(`
      INSERT INTO messages (
        id, lead_id, phone, direction, body, status, approved, approved_at, sent_at, provider_msg_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      m.leadId,
      m.phone,
      sanitize(m.direction ?? 'outbound'),
      m.body.trim(),
      sanitize(m.status ?? 'preparada'),
      m.approved ? 1 : 0,
      m.approvedAt ?? null,
      m.sentAt ?? now,
      m.providerMsgId ?? null,
      now
    );

    invalidateCache('repo_stats');
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  }

  static updateMessage(id: string, updates: Partial<MessageRecord>) {
    if (!id) return;
    const fields: string[] = [];
    const params: any[] = [];
    if (updates.status) { fields.push('status = ?'); params.push(updates.status); }
    if (updates.approved !== undefined) { fields.push('approved = ?'); params.push(updates.approved ? 1 : 0); }
    if (updates.approvedAt) { fields.push('approved_at = ?'); params.push(updates.approvedAt); }
    if (updates.sentAt) { fields.push('sent_at = ?'); params.push(updates.sentAt); }
    if (updates.providerMsgId) { fields.push('provider_msg_id = ?'); params.push(updates.providerMsgId); }

    if (fields.length > 0) {
      params.push(id);
      db.prepare(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`).run(...params);
      invalidateCache('repo_stats');
    }
  }

  static deleteMessage(id: string): boolean {
    if (!id) return false;
    const res = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    if (res.changes > 0) {
      invalidateCache('repo_stats');
      return true;
    }
    return false;
  }

  static deleteMessagesByLeadId(leadId: string): number {
    if (!leadId) return 0;
    const res = db.prepare('DELETE FROM messages WHERE lead_id = ?').run(leadId);
    return res.changes;
  }

  static clearMessagesExcept(keepLeadIds: string[]): number {
    if (!keepLeadIds || keepLeadIds.length === 0) {
      const res = db.prepare('DELETE FROM messages').run();
      return res.changes;
    }
    const placeholders = keepLeadIds.map(() => '?').join(', ');
    const res = db.prepare(`DELETE FROM messages WHERE lead_id NOT IN (${placeholders})`).run(...keepLeadIds);
    return res.changes;
  }

  static logEvent(event: { type: string; source: string; leadId?: string; payload?: any }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_events (id, type, source, lead_id, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, event.type, event.source, sanitize(event.leadId), JSON.stringify(event.payload || {}), now);
  }

  static getSetting(key: string, defaultValue = ''): string {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  }

  static setSetting(key: string, value: string) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(key, value, now);
  }

  static getAiMessages(leadId?: string | null): Array<{ id: string; leadId?: string; role: 'user' | 'assistant'; content: string; createdAt: string }> {
    let rows: any[];
    if (leadId) {
      rows = db.prepare('SELECT * FROM ai_copilot_messages WHERE lead_id = ? OR lead_id IS NULL ORDER BY created_at ASC LIMIT 100').all(leadId) as any[];
    } else {
      rows = db.prepare('SELECT * FROM ai_copilot_messages ORDER BY created_at ASC LIMIT 100').all() as any[];
    }
    return rows.map(r => ({
      id: r.id,
      leadId: r.lead_id || undefined,
      role: r.role as 'user' | 'assistant',
      content: r.content,
      createdAt: r.created_at
    }));
  }

  static saveAiMessage(m: { id?: string; leadId?: string | null; role: 'user' | 'assistant'; content: string }): { id: string; role: string; content: string; createdAt: string } {
    const id = m.id || crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO ai_copilot_messages (id, lead_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, sanitize(m.leadId), m.role, m.content, now);

    return { id, role: m.role, content: m.content, createdAt: now };
  }

  static clearAiMessages(leadId?: string | null): number {
    if (leadId) {
      const res = db.prepare('DELETE FROM ai_copilot_messages WHERE lead_id = ?').run(leadId);
      return res.changes;
    }
    const res = db.prepare('DELETE FROM ai_copilot_messages').run();
    return res.changes;
  }

  private static mapLeadRow(r: any, summary: boolean = false): Lead {
    const nicheInfo = classifyNiche(r.category);
    return {
      id: r.id,
      externalId: r.external_id || undefined,
      source: r.source,
      name: r.name,
      category: r.category || '',
      niche: nicheInfo.id,
      nicheLabel: nicheInfo.label,
      address: r.address || '',
      city: r.city || '',
      phoneRaw: r.phone_raw || '',
      phoneNorm: r.phone_norm || '',
      website: r.website || '',
      websiteType: r.website_type || 'none',
      siteStatus: r.site_status || 'none',
      siteAuditReason: r.site_audit_reason || undefined,
      rating: r.rating || undefined,
      reviewsCount: r.reviews_count || undefined,
      userReviews: summary ? undefined : (r.user_reviews || undefined),
      thumbnailUrl: r.thumbnail_url || undefined,
      logoUrl: r.logo_url || undefined,
      photos: summary ? undefined : (r.photos || undefined),
      latitude: r.latitude !== null && r.latitude !== undefined ? Number(r.latitude) : undefined,
      longitude: r.longitude !== null && r.longitude !== undefined ? Number(r.longitude) : undefined,
      priority: r.priority || 'media',
      stage: r.stage || 'novo',
      pitchType: r.pitch_type || 'no_site',
      doopCanvasUrl: r.doop_canvas_url || undefined,
      doopCanvasId: r.doop_canvas_id ? (r.doop_canvas_id.startsWith('canvas_') ? r.doop_canvas_id.replace('canvas_', '') : r.doop_canvas_id) : undefined,
      vercelUrl: r.vercel_url || undefined,
      vercelDeployedAt: r.vercel_deployed_at || undefined,
      notes: summary ? undefined : (r.notes || ''),
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }
}
