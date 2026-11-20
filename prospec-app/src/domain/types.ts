/**
 * Domain types and contracts according to SPEC_SAAS_LOCAL.md
 */

export type CommercialStage =
  | 'novo'
  | 'qualificado'
  | 'contato_pendente'
  | 'aguardando_resposta'
  | 'em_conversa'
  | 'briefing_pendente'
  | 'prototipo_em_preparo'
  | 'prototipo_em_revisao'
  | 'prototipo_enviado'
  | 'proposta_enviada'
  | 'ganho'
  | 'perdido'
  | 'descartado'
  | 'nao_contatar';

export type PitchType =
  | 'no_site'
  | 'whatsapp_site'
  | 'social_site'
  | 'bio_site'
  | 'offline_site'
  | 'active_site'
  | 'google_sites';

export interface ReviewItem {
  author: string;
  rating?: number | string;
  text: string;
  time?: string;
}

export interface Lead {
  id: string;
  externalId?: string;
  source: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phoneRaw: string;
  phoneNorm: string;
  website: string;
  websiteType: string;
  siteStatus: string;
  siteAuditReason?: string;
  rating?: string;
  reviewsCount?: string;
  userReviews?: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  photos?: string;
  latitude?: number | string;
  longitude?: number | string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  stage: CommercialStage;
  pitchType: PitchType;
  niche?: string;
  nicheLabel?: string;
  doopCanvasUrl?: string;
  doopCanvasId?: string;
  vercelUrl?: string;
  vercelDeployedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Briefing {
  id: string;
  leadId: string;
  version: number;
  businessName: string;
  segment: string;
  targetAudience: string;
  services: string[];
  cta: string;
  references: string[];
  identityNotes: string;
  status: 'rascunho' | 'confirmado';
  createdAt: string;
  updatedAt: string;
}

export interface Prototype {
  id: string;
  leadId: string;
  briefId: string;
  provider: 'doop' | 'doop_mcp' | 'builtin_generator';
  status: 'gerando' | 'em_revisao' | 'aprovado' | 'rejeitado';
  artifactType: 'html_prototype' | 'screenshot' | 'interactive_canvas';
  url: string;
  previewHtml?: string;
  screenshotPath?: string;
  vercelUrl?: string;
  vercelDeploymentId?: string;
  vercelDeployedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  leadId: string;
  phone: string;
  direction: 'inbound' | 'outbound';
  body: string;
  status: 'preparada' | 'aprovada' | 'enviada' | 'falha' | 'simulada';
  approved: boolean;
  approvedAt?: string;
  sentAt?: string;
  providerMsgId?: string;
  createdAt: string;
}

export interface ServiceStatusReport {
  id: 'scraper' | 'openwa' | 'doop';
  name: string;
  status: 'available' | 'connected' | 'disconnected' | 'stopped' | 'mock' | 'degraded';
  mode: 'real' | 'mock';
  port: number;
  endpoint: string;
  lastCheckedAt: string;
  summary: string;
  actionRequired?: string;
  details?: Record<string, any>;
}

export interface SystemConfig {
  mode: 'mock' | 'integrado_sem_envio' | 'real';
  scraperPath: string;
  openwaPort: number;
  openwaApiKeyMasked: string;
  doopPort: number;
  doopClientPort: number;
  aiProvider: 'none' | 'openai' | 'anthropic' | 'gemini';
  aiKeyConfigured: boolean;
}

/* ------------------------------------------------------------------ */
/* Core Adapter Contracts (SPEC Section 7)                            */
/* ------------------------------------------------------------------ */

export interface DiscoveryCapabilities {
  canSearchLive: boolean;
  canImportCSV: boolean;
  hasCachedData: boolean;
  supportedFormats: string[];
}

export interface CampaignInput {
  segment?: string;
  location?: string;
  limit?: number;
  filePath?: string;
}

export interface DiscoveredLead {
  externalId?: string;
  source: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phoneRaw: string;
  phoneNorm: string;
  website: string;
  websiteType: 'none' | 'whatsapp' | 'social' | 'bio_link' | 'google_maps' | 'website';
  siteStatus: 'none' | 'whatsapp' | 'social' | 'bio_link' | 'google_maps' | 'online' | 'offline' | 'unverified';
  siteAuditReason?: string;
  rating?: string;
  reviewsCount?: string;
  userReviews?: string;
  thumbnailUrl?: string;
  logoUrl?: string;
  photos?: string;
  latitude?: number | string;
  longitude?: number | string;
  pitchType: PitchType;
}

export interface DiscoveryResult {
  totalFound: number;
  leads: DiscoveredLead[];
  sourceFile?: string;
}

export interface DiscoveryAdapter {
  capabilities(): Promise<DiscoveryCapabilities>;
  discover(input: CampaignInput): Promise<DiscoveryResult>;
}

export interface MessagingCapabilities {
  canSendText: boolean;
  canSendMedia: boolean;
  hasWebhook: boolean;
  supportsReconciliation: boolean;
  isMock: boolean;
}

export interface ConnectionHealth {
  status: 'connected' | 'disconnected' | 'connecting' | 'error' | 'mock';
  sessionName?: string;
  phoneConnected?: string;
  details?: string;
  lastCheckedAt: string;
}

export interface ApprovedMessageInput {
  leadId: string;
  phone: string;
  body: string;
  approvalId?: string;
}

export interface SendResult {
  success: boolean;
  providerMsgId?: string;
  status: 'sent' | 'queued' | 'mock_sent' | 'failed';
  error?: string;
  timestamp: string;
}

export interface PendingSendInput {
  providerMsgId?: string;
  phone: string;
}

export interface ReconciliationResult {
  reconciled: boolean;
  status: 'delivered' | 'read' | 'failed' | 'unknown';
}

export interface MessagingAdapter {
  capabilities(): Promise<MessagingCapabilities>;
  health(): Promise<ConnectionHealth>;
  send(input: ApprovedMessageInput): Promise<SendResult>;
  reconcile(input: PendingSendInput): Promise<ReconciliationResult>;
}

export interface PrototypeCapabilities {
  canGenerateHtml: boolean;
  canRenderScreenshot: boolean;
  canExportZip: boolean;
  hasMcpBridge: boolean;
  isMock: boolean;
}

export interface ConfirmedBriefInput {
  leadId: string;
  businessName: string;
  segment: string;
  targetAudience: string;
  services: string[];
  cta: string;
  references?: string[];
  identityNotes?: string;
  address?: string;
  city?: string;
  rating?: string;
  reviewsCount?: string;
  phone?: string;
  mapsUrl?: string;
}

export interface GenerationHandle {
  id: string;
  leadId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface GenerationResult {
  handleId: string;
  status: 'completed' | 'failed';
  artifactType: 'html_prototype' | 'screenshot' | 'interactive_canvas';
  url: string;
  previewHtml?: string;
  screenshotPath?: string;
  error?: string;
}

export interface PrototypeAdapter {
  capabilities(): Promise<PrototypeCapabilities>;
  generate(input: ConfirmedBriefInput): Promise<GenerationHandle>;
  status(handle: GenerationHandle): Promise<GenerationResult>;
}

