import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {
  MessagingAdapter,
  MessagingCapabilities,
  ConnectionHealth,
  ApprovedMessageInput,
  SendResult,
  PendingSendInput,
  ReconciliationResult,
  Lead
} from '../domain/types.js';
import { OPENWA_DIR } from '../config.js';
import { generateHumanizedPitch, buildAllPitchVariations, type PitchOptions } from '../domain/pitchGenerator.js';

export class OpenWAAdapter implements MessagingAdapter {
  private host: string;
  private port: number;
  private apiKey: string;
  private baseDir: string;
  private static cachedSession: { id: string; name: string; status: string; phone?: string; pushName?: string } | null = null;
  private static lastSessionFetch = 0;
  private static inflightPromise: Promise<{ id: string; name: string; status: string; phone?: string; pushName?: string } | null> | null = null;

  constructor(customPort = 2785, customHost = '127.0.0.1') {
    this.port = customPort;
    this.host = customHost;
    this.baseDir = OPENWA_DIR;
    this.apiKey = this.loadStoredApiKey();
  }

  private loadStoredApiKey(): string {
    try {
      const candidates = [
        path.join(this.baseDir, 'data', '.api-key'),
        path.resolve(this.baseDir, '..', 'OpenWA', 'data', '.api-key'),
        'C:\\Users\\Win 10\\Desktop\\baixar music\\OpenWA\\data\\.api-key'
      ];
      for (const keyFile of candidates) {
        if (fs.existsSync(keyFile)) {
          const val = fs.readFileSync(keyFile, 'utf-8').trim();
          if (val) return val;
        }
      }
    } catch {
      // Ignored
    }
    return process.env.OPENWA_API_KEY || '';
  }

  /**
   * Discovers the currently active WhatsApp session in OpenWA.
   * Utilizes a static cache and deduplicates inflight requests to respect rate limits.
   */
  async getActiveSession(forceRefresh = false): Promise<{ id: string; name: string; status: string; phone?: string; pushName?: string } | null> {
    const now = Date.now();
    if (!forceRefresh && OpenWAAdapter.cachedSession && (now - OpenWAAdapter.lastSessionFetch < 10000)) {
      return OpenWAAdapter.cachedSession;
    }

    if (OpenWAAdapter.inflightPromise) {
      return OpenWAAdapter.inflightPromise;
    }

    OpenWAAdapter.inflightPromise = new Promise<{ id: string; name: string; status: string; phone?: string; pushName?: string } | null>((resolve) => {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: '/api/sessions',
          method: 'GET',
          timeout: 3000,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const sessions = JSON.parse(data);
                if (Array.isArray(sessions) && sessions.length > 0) {
                  const ready = sessions.find((s: any) => s.status === 'ready' || s.status === 'connected');
                  const result = ready || sessions[0];
                  OpenWAAdapter.cachedSession = result;
                  OpenWAAdapter.lastSessionFetch = Date.now();
                  return resolve(result);
                }
              } catch {
                // fall through
              }
            }
            // If request failed or rate limited, but we have a prior cached session, preserve it gracefully
            if (OpenWAAdapter.cachedSession) {
              return resolve(OpenWAAdapter.cachedSession);
            }
            resolve(null);
          });
        }
      );

      req.on('error', () => {
        if (OpenWAAdapter.cachedSession) return resolve(OpenWAAdapter.cachedSession);
        resolve(null);
      });
      req.on('timeout', () => {
        req.destroy();
        if (OpenWAAdapter.cachedSession) return resolve(OpenWAAdapter.cachedSession);
        resolve(null);
      });
      req.end();
    }).finally(() => {
      OpenWAAdapter.inflightPromise = null;
    });

    return OpenWAAdapter.inflightPromise;
  }

  /**
   * Fetches contact's official WhatsApp avatar/profile picture.
   */
  async fetchProfilePicture(phone: string, sessionId?: string): Promise<string | null> {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) return null;

    let targetSessionId = sessionId;
    if (!targetSessionId || targetSessionId === 'default') {
      const active = await this.getActiveSession();
      targetSessionId = active?.id || 'default';
    }

    const contactId = `${cleanPhone}@c.us`;

    return new Promise((resolve) => {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: `/api/sessions/${targetSessionId}/contacts/${contactId}/profile-picture`,
          method: 'GET',
          timeout: 4000,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                const url = parsed.url || parsed.picture || parsed.profilePicture;
                if (url && typeof url === 'string' && url.startsWith('http')) {
                  return resolve(url);
                }
              } catch {
                // fall through
              }
            }
            resolve(null);
          });
        }
      );

      req.on('error', () => resolve(null));
      req.end();
    });
  }

  /**
   * Fetches real chat messages from OpenWA for an explicit chatId.
   */
  private async fetchMessagesForChatId(sessionId: string, chatId: string, limit = 50): Promise<Array<any>> {
    return new Promise((resolve) => {
      const headers: Record<string, string> = {};
      if (this.apiKey) headers['x-api-key'] = this.apiKey;

      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: `/api/sessions/${sessionId}/messages?chatId=${encodeURIComponent(chatId)}&limit=${limit}&orderBy=timestamp`,
          method: 'GET',
          timeout: 4000,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                if (parsed && Array.isArray(parsed.messages)) {
                  return resolve(parsed.messages);
                }
              } catch {
                // fall through
              }
            }
            resolve([]);
          });
        }
      );

      req.on('error', () => resolve([]));
      req.on('timeout', () => {
        req.destroy();
        resolve([]);
      });
      req.end();
    });
  }

  /**
   * Fetches real chat messages from OpenWA for a given phone or chatId, with automatic LID resolution.
   */
  async fetchChatMessages(phone: string, limit = 50): Promise<Array<{
    id: string;
    waMessageId?: string;
    chatId: string;
    from: string;
    to?: string;
    body: string;
    direction: 'incoming' | 'outgoing';
    status: string;
    timestamp: number;
    createdAt: string;
  }>> {
    const session = await this.getActiveSession();
    if (!session) return [];

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) return [];

    const candidateChatIds: string[] = [
      phone.includes('@') ? phone : `${cleanPhone}@c.us`
    ];

    // Check OpenWA's lid_mappings database for modern business Linked Device IDs (@lid)
    try {
      const openwaDbPath = path.join(this.baseDir, 'data', 'openwa.sqlite');
      if (fs.existsSync(openwaDbPath)) {
        const { DatabaseSync } = await import('node:sqlite');
        const db = new DatabaseSync(openwaDbPath, { readOnly: true });
        const row = db.prepare('SELECT lid FROM lid_mappings WHERE phone = ? OR phone LIKE ?').get(cleanPhone, `%${cleanPhone.slice(-8)}%`) as any;
        if (row && row.lid) {
          candidateChatIds.push(`${row.lid}@lid`);
        }
      }
    } catch {
      // Ignored fallback
    }

    for (const chatId of candidateChatIds) {
      const messages = await this.fetchMessagesForChatId(session.id, chatId, limit);
      if (Array.isArray(messages) && messages.length > 0) {
        // Discard empty protocol, cipher or handshake messages without text or media
        const valid = messages.filter(
          (m) => (m.body && typeof m.body === 'string' && m.body.trim().length > 0) || m.mediaPath || m.mediaMimetype
        );
        if (valid.length > 0) {
          return valid;
        }
      }
    }

    return [];
  }

  /**
   * Fetches recent active chats from OpenWA session.
   */
  async fetchRecentChats(limit = 50): Promise<Array<any>> {
    const session = await this.getActiveSession();
    if (!session) return [];

    return new Promise((resolve) => {
      const headers: Record<string, string> = {};
      if (this.apiKey) headers['x-api-key'] = this.apiKey;

      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: `/api/sessions/${session.id}/chats?limit=${limit}`,
          method: 'GET',
          timeout: 4000,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                  return resolve(parsed);
                }
              } catch {
                // fall through
              }
            }
            resolve([]);
          });
        }
      );

      req.on('error', () => resolve([]));
      req.on('timeout', () => {
        req.destroy();
        resolve([]);
      });
      req.end();
    });
  }

  /**
   * Resolves a phone number from an OpenWA chat object.
   */
  resolvePhoneFromChat(chat: any): string | null {
    if (!chat || !chat.id) return null;
    const chatId = String(chat.id);
    if (chatId.endsWith('@c.us')) {
      return chatId.replace('@c.us', '').replace(/\D/g, '');
    }
    if (chatId.endsWith('@lid')) {
      const lid = chatId.replace('@lid', '').trim();
      try {
        const openwaDbPath = path.join(this.baseDir, 'data', 'openwa.sqlite');
        if (fs.existsSync(openwaDbPath)) {
          const { DatabaseSync } = require('node:sqlite');
          const db = new DatabaseSync(openwaDbPath, { readOnly: true });
          const row = db.prepare('SELECT phone FROM lid_mappings WHERE lid = ?').get(lid) as any;
          if (row?.phone) {
            return String(row.phone).replace(/\D/g, '');
          }
        }
      } catch {
        // fallback
      }
    }
    if (chat.name && (chat.name.startsWith('+') || /\d{8,}/.test(chat.name))) {
      return chat.name.replace(/\D/g, '');
    }
    return null;
  }

  async capabilities(): Promise<MessagingCapabilities> {
    const health = await this.health();
    const isConnected = health.status === 'connected';

    return {
      canSendText: isConnected,
      canSendMedia: isConnected,
      hasWebhook: isConnected,
      supportsReconciliation: isConnected,
      isMock: !isConnected
    };
  }

  async health(): Promise<ConnectionHealth> {
    const now = new Date().toISOString();

    // Check OpenWA HTTP server health
    const serverReady = await new Promise<boolean>((resolve) => {
      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: '/api/health/ready',
          method: 'GET',
          timeout: 1500,
          headers: this.apiKey ? { 'x-api-key': this.apiKey } : {}
        },
        (res) => {
          resolve(Boolean(res.statusCode && res.statusCode < 400));
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });

    if (!serverReady) {
      const sessionPath = path.join(this.baseDir, 'data', 'sessions');
      let sessionDetails = 'Serviço OpenWA inativo na porta 2785';
      if (fs.existsSync(sessionPath)) {
        const sessions = fs.readdirSync(sessionPath).filter(s => s.startsWith('session-'));
        if (sessions.length > 0) {
          sessionDetails = `Gateway inativo no momento. Sessão salva detectada em disco: ${sessions[0]}`;
        }
      }

      return {
        status: 'disconnected',
        details: sessionDetails,
        lastCheckedAt: now
      };
    }

    // Server is ready, check active session state
    const session = await this.getActiveSession();
    if (!session) {
      return {
        status: 'connected',
        sessionName: 'OpenWA Core',
        details: 'Gateway ativo, nenhuma sessão iniciada',
        lastCheckedAt: now
      };
    }

    const isConnected = session.status === 'ready' || session.status === 'connected';
    return {
      status: isConnected ? 'connected' : (session.status === 'initializing' ? 'connected' : 'disconnected'),
      sessionName: session.name || 'bot-prospectar',
      details: isConnected
        ? `WhatsApp Conectado (${session.pushName || 'Operador'} - ${session.phone || 'Ativo'})`
        : `Sessão WhatsApp: ${session.status} (${session.name || 'bot-prospectar'})`,
      lastCheckedAt: now
    };
  }

  async send(input: ApprovedMessageInput, mode: 'mock' | 'integrado_sem_envio' | 'real' = 'mock'): Promise<SendResult> {
    const now = new Date().toISOString();

    // Safety policy: in mock or integrado_sem_envio mode, NEVER perform real external calls
    if (mode !== 'real') {
      return {
        success: true,
        status: 'mock_sent',
        providerMsgId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now
      };
    }

    // Real send through OpenWA gateway
    const session = await this.getActiveSession();
    if (!session || (session.status !== 'ready' && session.status !== 'connected')) {
      return {
        success: false,
        status: 'failed',
        error: session
          ? `Sessão WhatsApp '${session.name}' não está pronta (status atual: ${session.status}). Abra o painel OpenWA na porta ${this.port}.`
          : `Nenhuma sessão ativa encontrada no OpenWA na porta ${this.port}. Inicie a sessão no gateway.`,
        timestamp: now
      };
    }

    return new Promise((resolve) => {
      const cleanPhone = input.phone.replace(/\D/g, '');
      const chatId = input.phone.includes('@') ? input.phone : `${cleanPhone}@c.us`;

      const payload = JSON.stringify({
        chatId,
        text: input.body
      });

      const req = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: `/api/sessions/${session.id}/messages/send-text`,
          method: 'POST',
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            ...(this.apiKey ? { 'x-api-key': this.apiKey } : {})
          }
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                resolve({
                  success: true,
                  status: 'sent',
                  providerMsgId: parsed.messageId || parsed.id || `openwa_${Date.now()}`,
                  timestamp: now
                });
              } catch {
                resolve({
                  success: true,
                  status: 'sent',
                  providerMsgId: `openwa_${Date.now()}`,
                  timestamp: now
                });
              }
            } else {
              let errorMsg = `HTTP ${res.statusCode}: ${data}`;
              try {
                const parsed = JSON.parse(data);
                if (parsed.message) {
                  if (typeof parsed.message === 'string' && parsed.message.includes('could not resolve the recipient')) {
                    errorMsg = `O número ${cleanPhone} não foi localizado no WhatsApp. Telefones fixos (prefixos 2, 3, 4, 5) frequentemente não possuem WhatsApp. Atualize para o celular do lead no campo de telefone antes de disparar.`;
                  } else {
                    errorMsg = parsed.message;
                  }
                }
              } catch {
                // fall through
              }
              resolve({
                success: false,
                status: 'failed',
                error: errorMsg,
                timestamp: now
              });
            }
          });
        }
      );

      req.on('error', (err) => {
        resolve({
          success: false,
          status: 'failed',
          error: `Erro de conexão OpenWA: ${err.message}`,
          timestamp: now
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          status: 'failed',
          error: 'Timeout ao enviar mensagem pelo OpenWA (15s)',
          timestamp: now
        });
      });

      req.write(payload);
      req.end();
    });
  }

  async reconcile(input: PendingSendInput): Promise<ReconciliationResult> {
    return {
      reconciled: false,
      status: 'unknown'
    };
  }

  /**
   * Generates contextual commercial message according to lead audit and presence,
   * completely humanized (with sender presentation and concrete product value).
   */
  static generatePitchMessage(lead: Lead, senderName?: string, options?: PitchOptions): string {
    return generateHumanizedPitch(lead, { senderName, ...options });
  }

  /**
   * Returns all 3 variations of approach for the given lead.
   */
  static generatePitchVariations(lead: Lead, senderName?: string, options?: PitchOptions) {
    return buildAllPitchVariations(lead, { senderName, ...options });
  }
}

