import { Router } from 'express';
import { Repository } from '../persistence/database.js';
import { ServiceRegistry } from '../services/serviceRegistry.js';
import { ScraperKitAdapter } from '../integrations/discoveryAdapter.js';
import { OpenWAAdapter } from '../integrations/messagingAdapter.js';
import { DoopAdapter } from '../integrations/prototypeAdapter.js';
import { DoopProcessManager } from '../services/doopProcessManager.js';
import { LayoutEngine } from '../services/layoutEngine.js';
import { SiteValidator } from '../services/siteValidator.js';
import { AIService } from '../services/aiService.js';
import { VercelDeployer } from '../services/vercelDeployer.js';
import { NICHE_KITS } from '../services/nicheKits.js';
import { NicheRenderer } from '../services/nicheRenderer.js';
import { Lead } from '../domain/types.js';

export const apiRouter = Router();

const scraperAdapter = new ScraperKitAdapter();
const openwaAdapter = new OpenWAAdapter();
const doopAdapter = new DoopAdapter();

// Status & Dashboard Overview
apiRouter.get('/status', async (req, res) => {
  try {
    const services = await ServiceRegistry.getServicesStatus();
    const stats = Repository.getStats();
    const mode = Repository.getSetting('operation_mode', 'integrado_sem_envio');
    const doopStatus = DoopProcessManager.getStatus();
    const hasVercelToken = !!VercelDeployer.getActiveToken();

    res.json({
      success: true,
      mode,
      services,
      stats,
      doopStatus,
      hasVercelToken,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leads List (supports Sparse/Summary fields for ultra-light payloads)
apiRouter.get('/leads', (req, res) => {
  try {
    const { search, stage, city, pitchType, niche, limit, offset, summary } = req.query;
    const leads = Repository.getLeads({
      search: search as string,
      stage: stage as string,
      city: city as string,
      pitchType: pitchType as string,
      niche: niche as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : 0,
      summary: summary === 'true' || summary === '1'
    });
    res.json({ success: true, leads });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cities with Counts
apiRouter.get('/cities', (req, res) => {
  try {
    const cities = Repository.getCitiesWithCounts();
    res.json({ success: true, cities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Niches with Counts
apiRouter.get('/niches', (req, res) => {
  try {
    const niches = Repository.getNichesWithCounts();
    res.json({ success: true, niches });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Import Leads from Scraper
apiRouter.post('/leads/import', async (req, res) => {
  try {
    const { filePath, limit } = req.body;
    const result = await scraperAdapter.discover({ filePath, limit: limit || 200 });

    let importedCount = 0;
    for (const lead of result.leads) {
      Repository.upsertLead({
        name: lead.name,
        source: lead.source,
        category: lead.category,
        address: lead.address,
        city: lead.city,
        phoneRaw: lead.phoneRaw,
        phoneNorm: lead.phoneNorm,
        website: lead.website,
        websiteType: lead.websiteType,
        siteStatus: lead.siteStatus,
        pitchType: lead.pitchType,
        siteAuditReason: lead.siteAuditReason,
        rating: lead.rating,
        reviewsCount: lead.reviewsCount,
        userReviews: lead.userReviews,
        thumbnailUrl: lead.thumbnailUrl,
        logoUrl: lead.logoUrl,
        photos: lead.photos,
        latitude: lead.latitude,
        longitude: lead.longitude,
        priority: lead.pitchType === 'offline_site' || lead.pitchType === 'no_site' ? 'alta' : 'media'
      });
      importedCount++;
    }

    Repository.logEvent({
      type: 'leads_imported',
      source: 'scraper_kit',
      payload: { count: importedCount, sourceFile: result.sourceFile }
    });

    res.json({
      success: true,
      importedCount,
      sourceFile: result.sourceFile,
      stats: Repository.getStats()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lead Details
apiRouter.get('/leads/:id', (req, res) => {
  try {
    const lead = Repository.getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado' });
    }

    const briefing = Repository.getBriefingByLead(lead.id);
    const prototypes = Repository.getPrototypesByLead(lead.id);
    const messages = Repository.getMessagesByLead(lead.id);

    // Pre-generate contextual pitch message suggestion if no message exists
    const senderName = (req.query.senderName as string) || undefined;
    const isReadyParam = req.query.isReady !== undefined ? req.query.isReady === 'true' : undefined;
    const suggestedPitch = OpenWAAdapter.generatePitchMessage(lead, senderName, { isReady: isReadyParam });
    const pitchVariations = OpenWAAdapter.generatePitchVariations(lead, senderName, { isReady: isReadyParam });

    res.json({
      success: true,
      lead,
      briefing,
      prototypes,
      messages,
      suggestedPitch,
      pitchVariations
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dynamic Humanized Pitch Regeneration
apiRouter.post('/leads/:id/pitch', (req, res) => {
  try {
    const lead = Repository.getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado' });
    }
    const { senderName, variantIndex, isReady } = req.body || {};
    const pitch = OpenWAAdapter.generatePitchMessage(lead, senderName, { variantIndex, isReady });
    const variations = OpenWAAdapter.generatePitchVariations(lead, senderName, { isReady });
    res.json({
      success: true,
      pitch,
      variations,
      variantIndex: variantIndex ?? 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Lead Information (Direct contact edit, name, address, notes, etc.)
const handleUpdateLead = (req: express.Request, res: express.Response) => {
  try {
    const lead = Repository.getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Comércio não encontrado' });
    }

    const {
      name,
      category,
      address,
      city,
      phone,
      phoneRaw,
      phoneNorm,
      website,
      websiteType,
      notes,
      stage,
      priority,
      pitchType
    } = req.body || {};

    let raw = phoneRaw !== undefined ? phoneRaw : phone;
    let norm = phoneNorm;

    if (raw !== undefined && !norm) {
      const digits = (raw || '').replace(/\D/g, '');
      if (digits.length === 10 || digits.length === 11) {
        norm = `55${digits}`;
      } else {
        norm = digits;
      }
    } else if (norm !== undefined && !raw) {
      raw = norm;
    }

    const updates: any = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (address !== undefined) updates.address = String(address).trim();
    if (city !== undefined) updates.city = String(city).trim();
    if (raw !== undefined) updates.phoneRaw = String(raw).trim();
    if (norm !== undefined) updates.phoneNorm = String(norm).trim();
    if (website !== undefined) updates.website = String(website).trim();
    if (websiteType !== undefined) updates.websiteType = websiteType;
    if (notes !== undefined) updates.notes = String(notes).trim();
    if (stage !== undefined) updates.stage = stage;
    if (priority !== undefined) updates.priority = priority;
    if (pitchType !== undefined) updates.pitchType = pitchType;

    const updated = Repository.updateLead(req.params.id, updates);

    res.json({
      success: true,
      lead: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

apiRouter.put('/leads/:id', handleUpdateLead);
apiRouter.patch('/leads/:id', handleUpdateLead);

// Update Lead Stage
apiRouter.post('/leads/:id/stage', (req, res) => {
  try {
    const { stage, reason } = req.body;
    const updated = Repository.updateLeadStage(req.params.id, stage, reason);
    res.json({ success: true, lead: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: Prepare Message (No send)
apiRouter.post('/whatsapp/prepare', (req, res) => {
  try {
    const { leadId, phone, body } = req.body;
    const lead = Repository.getLeadById(leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

    const messageText = body || OpenWAAdapter.generatePitchMessage(lead);
    const targetPhone = phone || lead.phoneNorm || lead.phoneRaw;

    const message = Repository.saveMessage({
      leadId,
      phone: targetPhone,
      direction: 'outbound',
      body: messageText,
      status: 'preparada',
      approved: false
    });

    Repository.updateLeadStage(leadId, 'contato_pendente', 'Mensagem preparada no WhatsApp');

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: Approve Message
apiRouter.post('/whatsapp/approve', (req, res) => {
  try {
    const { messageId } = req.body;
    const now = new Date().toISOString();
    Repository.updateMessage(messageId, {
      approved: true,
      approvedAt: now,
      status: 'aprovada'
    });
    res.json({ success: true, messageId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: Session Status
apiRouter.get('/whatsapp/session', async (req, res) => {
  try {
    const session = await openwaAdapter.getActiveSession();
    const health = await openwaAdapter.health();
    res.json({
      success: true,
      session,
      health
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: List all active conversations (with automatic OpenWA reconciliation)
apiRouter.get('/whatsapp/conversations', async (req, res) => {
  try {
    // Opportunistic sync from OpenWA for newly active chats
    try {
      const openwaChats = await openwaAdapter.fetchRecentChats(30);
      if (Array.isArray(openwaChats) && openwaChats.length > 0) {
        for (const chat of openwaChats) {
          if (chat.isGroup || chat.kind === 'group' || chat.id.includes('@g.us') || chat.id.includes('@newsletter')) {
            continue;
          }
          const phone = openwaAdapter.resolvePhoneFromChat(chat);
          if (!phone) continue;
          const lead = Repository.getLeadByPhone(phone);
          if (!lead) continue;

          // If lead has 0 local messages in SQLite, pull messages from OpenWA
          const localMsgs = Repository.getMessagesByLead(lead.id);
          if (localMsgs.length === 0) {
            const remoteMsgs = await openwaAdapter.fetchChatMessages(lead.phoneNorm || phone, 20);
            let hasInbound = false;
            for (const rm of remoteMsgs) {
              if ((!rm.body || !rm.body.trim()) && !rm.mediaPath && !rm.mediaMimetype) {
                continue; // Ignore empty protocol messages
              }
              const providerId = rm.waMessageId || rm.id;
              const existing = Repository.getMessageByProviderId(providerId);
              if (!existing) {
                const isInbound = rm.direction === 'incoming';
                Repository.saveMessage({
                  leadId: lead.id,
                  phone: lead.phoneNorm || phone,
                  direction: isInbound ? 'inbound' : 'outbound',
                  body: rm.body.trim(),
                  status: isInbound ? 'recebida' : 'enviada',
                  approved: true,
                  approvedAt: rm.createdAt || (rm.timestamp ? new Date(rm.timestamp * 1000).toISOString() : new Date().toISOString()),
                  sentAt: rm.createdAt || (rm.timestamp ? new Date(rm.timestamp * 1000).toISOString() : new Date().toISOString()),
                  providerMsgId: providerId
                });
                if (isInbound) hasInbound = true;
              }
            }
            if (hasInbound && lead.stage !== 'qualificado' && lead.stage !== 'fechado') {
              Repository.updateLeadStage(lead.id, 'em_conversa', 'Conversa sincronizada do WhatsApp');
            }
          }
        }
      }
    } catch {
      // Non-blocking sync error
    }

    const rawList = Repository.getConversationsSummary();
    const list = rawList.map((c) => ({
      id: c.lead?.id,
      name: c.lead?.name || 'Comércio Sem Nome',
      category: c.lead?.category || 'Comércio Local',
      city: c.lead?.city || 'RMBH',
      phoneRaw: c.lead?.phoneRaw || '',
      phoneNorm: c.lead?.phoneNorm || '',
      stage: c.lead?.stage || 'em_conversa',
      priority: c.lead?.priority || 'media',
      lead: c.lead,
      lastMessage: c.lastMessage,
      messageCount: c.messageCount,
      hasInbound: c.hasInbound,
      hasInboundHistory: c.hasInboundHistory,
      inboundCount: c.inboundCount
    }));
    res.json({ success: true, count: list.length, conversations: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: Get complete chat thread for a lead (with auto-sync from OpenWA)
apiRouter.get('/whatsapp/chat/:leadId', async (req, res) => {
  try {
    const lead = Repository.getLeadById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

    const phone = lead.phoneNorm || lead.phoneRaw;
    if (phone) {
      try {
        const remoteMessages = await openwaAdapter.fetchChatMessages(phone, 50);
        if (Array.isArray(remoteMessages) && remoteMessages.length > 0) {
          let hasNewInbound = false;

          for (const rm of remoteMessages) {
            if ((!rm.body || !rm.body.trim()) && !rm.mediaPath && !rm.mediaMimetype) {
              continue; // Ignore empty protocol messages
            }
            const providerId = rm.waMessageId || rm.id;
            const existing = Repository.getMessageByProviderId(providerId);
            if (!existing) {
              const isInbound = rm.direction === 'incoming';
              Repository.saveMessage({
                leadId: lead.id,
                phone: phone,
                direction: isInbound ? 'inbound' : 'outbound',
                body: rm.body.trim(),
                status: isInbound ? 'recebida' : 'enviada',
                approved: true,
                approvedAt: rm.createdAt || new Date(rm.timestamp * 1000).toISOString(),
                sentAt: rm.createdAt || new Date(rm.timestamp * 1000).toISOString(),
                providerMsgId: providerId
              });

              if (isInbound) {
                hasNewInbound = true;
              }
            }
          }

          if (hasNewInbound && lead.stage !== 'qualificado' && lead.stage !== 'fechado') {
            Repository.updateLeadStage(lead.id, 'em_conversa', 'Resposta recebida do cliente no WhatsApp');
          }
        }
      } catch (err: any) {
        // Silent catch for remote sync errors
        console.error('Erro ao sincronizar mensagens do OpenWA:', err.message);
      }
    }

    const messages = Repository.getMessagesByLead(lead.id);
    const session = await openwaAdapter.getActiveSession();
    const updatedLead = Repository.getLeadById(lead.id);

    res.json({
      success: true,
      lead: updatedLead,
      messages,
      session
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: Send chat reply
apiRouter.post('/whatsapp/chat/:leadId/send', async (req, res) => {
  try {
    const lead = Repository.getLeadById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

    const { body, text, mode: requestedMode } = req.body;
    const rawContent = body !== undefined ? body : text;
    if (!rawContent || !String(rawContent).trim()) {
      return res.status(400).json({ success: false, error: 'Conteúdo da mensagem não pode ser vazio' });
    }
    const messageContent = String(rawContent).trim();

    const phone = lead.phoneNorm || lead.phoneRaw;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Comércio sem telefone cadastrado' });
    }

    const configuredMode = Repository.getSetting('operation_mode', 'integrado_sem_envio') as 'mock' | 'integrado_sem_envio' | 'real';
    const currentMode = (requestedMode || configuredMode) as 'mock' | 'integrado_sem_envio' | 'real';

    const result = await openwaAdapter.send({
      leadId: lead.id,
      phone,
      body: messageContent
    }, currentMode);

    const message = Repository.saveMessage({
      leadId: lead.id,
      phone,
      direction: 'outbound',
      body: messageContent,
      status: result.success ? (result.status === 'sent' ? 'enviada' : 'simulada') : 'falha',
      approved: true,
      approvedAt: new Date().toISOString(),
      sentAt: result.timestamp,
      providerMsgId: result.providerMsgId
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Falha ao transmitir mensagem pelo WhatsApp',
        message,
        result,
        mode: currentMode
      });
    }

    if (lead.stage === 'novo' || lead.stage === 'contato_pendente') {
      Repository.updateLeadStage(
        lead.id,
        'aguardando_resposta',
        currentMode === 'real' ? 'Abordagem transmitida via WhatsApp' : 'Abordagem simulada (Modo Seguro)'
      );
    }

    res.json({
      success: true,
      message,
      result,
      mode: currentMode
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp: Send Approved Message
apiRouter.post('/whatsapp/send', async (req, res) => {
  try {
    const { messageId, leadId, phone, body, mode: requestedMode } = req.body;
    const configuredMode = Repository.getSetting('operation_mode', 'integrado_sem_envio') as 'mock' | 'integrado_sem_envio' | 'real';
    const currentMode = (requestedMode || configuredMode) as 'mock' | 'integrado_sem_envio' | 'real';

    const result = await openwaAdapter.send({
      leadId: leadId || 'direct',
      phone: phone || '',
      body: body || ''
    }, currentMode);

    if (messageId) {
      Repository.updateMessage(messageId, {
        status: result.success
          ? (result.status === 'sent' ? 'enviada' : 'simulada')
          : 'falha',
        sentAt: result.timestamp,
        providerMsgId: result.providerMsgId
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Falha ao enviar mensagem pelo WhatsApp',
        result,
        mode: currentMode
      });
    }

    if (leadId) {
      Repository.updateLeadStage(
        leadId,
        'aguardando_resposta',
        currentMode === 'real'
          ? 'Mensagem enviada com sucesso no WhatsApp'
          : 'Mensagem simulada com sucesso (Modo Seguro)'
      );
    }

    res.json({ success: true, result, mode: currentMode });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Prototypes: Save / Confirm Briefing
apiRouter.post('/prototypes/briefing', (req, res) => {
  try {
    const { leadId, businessName, segment, targetAudience, services, cta, references, identityNotes, status } = req.body;
    const lead = Repository.getLeadById(leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

    const brief = Repository.saveBriefing({
      leadId,
      businessName: businessName || lead.name,
      segment: segment || lead.category,
      targetAudience,
      services: services || [],
      cta: cta || 'Fale Conosco pelo WhatsApp',
      references: references || [],
      identityNotes: identityNotes || '',
      status: status || 'rascunho'
    });

    if (status === 'confirmado') {
      Repository.updateLeadStage(leadId, 'prototipo_em_preparo', 'Briefing confirmado para protótipo');
    }

    res.json({ success: true, briefing: brief });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Doop Canvas: Create or update unique canvas for commerce (pins 1 fixed ID per lead)
apiRouter.post('/leads/:id/create-canvas', async (req, res) => {
  try {
    const lead = Repository.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

    // Enforce 1 fixed canvas ID per lead
    const existingDoopProto = Repository.getDoopCanvasByLead(lead.id);
    const existingCanvasId = req.body?.canvasId || existingDoopProto?.id?.replace('canvas_', '') || (existingDoopProto?.url?.includes('/c/') ? existingDoopProto.url.split('/c/')[1] : undefined) || (lead as any).doopCanvasId;

    // Generate / update unique canvas in Doop (reusing fixed canvasId)
    const canvasResult = await LayoutEngine.createUniqueCanvas(lead, {
      ...req.body,
      existingCanvasId
    });

    let brief = Repository.getBriefingByLead(lead.id);
    if (!brief) {
      brief = Repository.saveBriefing({
        leadId: lead.id,
        businessName: lead.name,
        segment: lead.category || 'Comércio Local',
        targetAudience: 'Clientes locais e regionais',
        services: ['Atendimento com Hora Marcada', 'Orçamentos Personalizados', 'Produtos e Serviços de Qualidade'],
        cta: 'Chamar no WhatsApp',
        identityNotes: 'doop_unique_layout',
        status: 'confirmado'
      });
    }

    const protoId = `canvas_${canvasResult.canvas_id}`;
    const prototype = Repository.savePrototype({
      id: protoId,
      leadId: lead.id,
      briefId: brief.id,
      provider: 'doop',
      status: 'concluido',
      artifactType: 'doop_canvas',
      url: canvasResult.canvas_url,
      previewHtml: canvasResult.desktop_html
    });

    Repository.updateLeadStage(lead.id, 'prototipo_em_revisao', 'Canvas oficial estruturado no Doop');
    Repository.logEvent({
      type: 'canvas_updated',
      source: 'doop',
      leadId: lead.id,
      payload: { canvasId: canvasResult.canvas_id, url: canvasResult.canvas_url, framesCount: canvasResult.frames.length }
    });

    res.json({
      success: true,
      canvasId: canvasResult.canvas_id,
      canvasUrl: canvasResult.canvas_url,
      framesCount: canvasResult.frames.length,
      tokens: canvasResult.tokens,
      prototype
    });
  } catch (error: any) {
    console.error('[routes] Erro ao criar/atualizar canvas no Doop:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Prototypes: Generate / Update Prototype (Routed directly to official Doop Canvas)
apiRouter.post('/prototypes/generate', async (req, res) => {
  try {
    const { leadId, theme } = req.body;
    const lead = Repository.getLeadById(leadId);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead não encontrado' });

    // Check for existing fixed canvas
    const existingDoopProto = Repository.getDoopCanvasByLead(lead.id);
    const existingCanvasId = existingDoopProto?.id?.replace('canvas_', '') || (existingDoopProto?.url?.includes('/c/') ? existingDoopProto.url.split('/c/')[1] : undefined) || (lead as any).doopCanvasId;

    let brief = Repository.getBriefingByLead(leadId);
    if (!brief) {
      brief = Repository.saveBriefing({
        leadId,
        businessName: lead.name,
        segment: lead.category || 'Comércio Local',
        targetAudience: 'Clientes locais e regionais',
        services: ['Atendimento com Hora Marcada', 'Orçamentos Personalizados', 'Produtos e Serviços de Qualidade'],
        cta: 'Chamar no WhatsApp',
        identityNotes: theme || 'auto',
        status: 'confirmado'
      });
    }

    const canvasResult = await LayoutEngine.createUniqueCanvas(lead, {
      theme,
      cta: brief.cta,
      services: brief.services,
      existingCanvasId
    });

    const protoId = `canvas_${canvasResult.canvas_id}`;
    const prototype = Repository.savePrototype({
      id: protoId,
      leadId,
      briefId: brief.id,
      provider: 'doop',
      status: 'concluido',
      artifactType: 'doop_canvas',
      url: canvasResult.canvas_url,
      previewHtml: canvasResult.desktop_html
    });

    Repository.updateLeadStage(leadId, 'prototipo_em_revisao', 'Canvas com layout único no Doop');

    res.json({
      success: true,
      prototype,
      canvasId: canvasResult.canvas_id,
      canvasUrl: canvasResult.canvas_url,
      framesCount: canvasResult.frames.length
    });
  } catch (error: any) {
    console.error('[routes] Erro no generate canvas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Canvas Frame Live Preview Endpoint
apiRouter.get('/prototypes/canvas/:canvasId/preview', async (req, res) => {
  try {
    const canvasId = req.params.canvasId;
    const viewport = (req.query.viewport as 'desktop' | 'mobile' | 'tablet') || 'desktop';

    // 1. Try fetching frame HTML live from Doop MCP
    let html = await LayoutEngine.getCanvasPreviewHtml(canvasId, viewport);

    // 2. Fallback to cached previewHtml from database
    if (!html) {
      const proto = Repository.getPrototypeById(`canvas_${canvasId}`);
      if (proto?.previewHtml) {
        html = proto.previewHtml;
      }
    }

    if (!html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR"><head><meta charset="utf-8"><title>Canvas Doop</title>
        <style>body{font-family:-apple-system,sans-serif;background:#FAF8F5;color:#1C1917;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head>
        <body><div style="text-align:center;padding:24px;"><h2>Canvas do Doop</h2><p>O canvas ID <strong>${canvasId}</strong> ainda não possui frames gerados.</p></div></body>
        </html>
      `);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error: any) {
    res.status(500).send(`Erro ao renderizar preview do canvas: ${error.message}`);
  }
});

// Prototypes: Standalone Preview (Only uses Canvas, no preconfigured template)
apiRouter.get('/prototypes/:id/preview', async (req, res) => {
  try {
    const protoId = req.params.id;
    const viewport = (req.query.viewport as 'desktop' | 'mobile' | 'tablet') || 'desktop';

    // 1. If protoId is a canvas ID or canvas_XXX
    const cleanCanvasId = protoId.startsWith('canvas_') ? protoId.replace('canvas_', '') : (protoId !== 'live' ? protoId : null);
    if (cleanCanvasId) {
      let html = await LayoutEngine.getCanvasPreviewHtml(cleanCanvasId, viewport);
      if (!html) {
        const proto = Repository.getPrototypeById(`canvas_${cleanCanvasId}`) || Repository.getPrototypeById(protoId);
        if (proto?.previewHtml) html = proto.previewHtml;
      }
      if (html) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }
    }

    // 2. If leadId query param is provided, locate the lead's fixed Doop canvas
    const leadId = req.query.leadId as string | undefined;
    if (leadId) {
      const lead = Repository.getLeadById(leadId);
      if (lead) {
        const doopCanvas = Repository.getDoopCanvasByLead(lead.id);
        const canvasId = doopCanvas?.id?.startsWith('canvas_')
          ? doopCanvas.id.replace('canvas_', '')
          : (doopCanvas?.url?.includes('/c/') ? doopCanvas.url.split('/c/')[1] : null);

        if (canvasId) {
          let html = await LayoutEngine.getCanvasPreviewHtml(canvasId, viewport);
          if (!html && doopCanvas?.previewHtml) html = doopCanvas.previewHtml;
          if (html) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(html);
          }
        }

        // If lead has no canvas yet, display informative placeholder
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`
          <!DOCTYPE html>
          <html lang="pt-BR"><head><meta charset="utf-8"><title>Prévia do Doop</title>
          <style>body{font-family:-apple-system,sans-serif;background:#FAF8F5;color:#1C1917;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head>
          <body><div style="text-align:center;padding:24px;"><h2>Canvas Aguardando Criação</h2><p>Nenhum canvas gerado ainda para <strong>${lead.name}</strong> no Doop.<br>Clique em "Criar Canvas no Doop" para gerar o layout oficial.</p></div></body>
          </html>
        `);
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR"><head><meta charset="utf-8"><title>Protótipo</title>
      <style>body{font-family:-apple-system,sans-serif;background:#FAF8F5;color:#1C1917;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head>
      <body><div style="text-align:center;padding:24px;"><h2>Protótipo não encontrado</h2><p>Utilize os layouts oficiais no Doop.</p></div></body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`Erro ao renderizar protótipo: ${error.message}`);
  }
});

// Brazilian Niche Kits Endpoints
apiRouter.get('/niche-kits', (req, res) => {
  try {
    const kits = Object.values(NICHE_KITS).map(kit => ({
      id: kit.id,
      name: kit.name,
      categoryLabel: kit.categoryLabel,
      keywords: kit.keywords,
      tokens: kit.tokens,
      sampleLead: kit.sampleLead,
      hero: kit.hero,
      about: kit.about,
      cta_banner: kit.cta_banner,
      info: kit.info,
      servicesCount: kit.services?.items?.length || 0,
      differentialsCount: kit.about?.differentials?.length || 0,
      statsCount: kit.stats?.length || 0,
      reviewsCount: kit.reviews?.items?.length || 0,
      services: kit.services?.items || [],
      differentials: kit.about?.differentials || [],
      stats: kit.stats || [],
      reviews: kit.reviews?.items || []
    }));
    res.json({ success: true, kits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/niche-kits/:id/preview', (req, res) => {
  try {
    const kitId = req.params.id;
    const viewport = (req.query.viewport as 'desktop' | 'mobile') || 'desktop';
    const leadId = req.query.leadId as string | undefined;

    let leadData: Partial<Lead> | undefined = undefined;
    if (leadId) {
      const dbLead = Repository.getLeadById(leadId);
      if (dbLead) leadData = dbLead;
    }

    const html = NicheRenderer.render(kitId, { viewport, lead: leadData });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error: any) {
    res.status(500).send(`Erro ao renderizar kit de nicho: ${error.message}`);
  }
});

apiRouter.post('/niche-kits/:id/apply', (req, res) => {
  try {
    const kitId = req.params.id;
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId é obrigatório' });
    }

    const lead = Repository.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado' });
    }

    const kit = NICHE_KITS[kitId];
    if (!kit) {
      return res.status(404).json({ success: false, error: `Kit de nicho '${kitId}' não encontrado` });
    }

    // Save briefing based on niche kit
    const brief = Repository.saveBriefing({
      leadId: lead.id,
      businessName: lead.name,
      niche: kit.id,
      theme: kit.id,
      headline: kit.hero.headline.replace('{cidade}', lead.city || kit.sampleLead.city),
      subheadline: kit.hero.subheadline.replace('{empresa}', lead.name),
      cta: 'Agendar pelo WhatsApp',
      services: (kit.services?.items || []).map(s => ({
        title: s.title,
        desc: s.desc,
        badge: s.badge
      })),
      differentials: kit.about?.differentials || [],
      palette: {
        primary: kit.tokens.accent,
        secondary: kit.tokens.ground,
        text: kit.tokens.text_main,
        bg: kit.tokens.card_bg
      }
    });

    // Render standalone production HTML
    const desktopHtml = NicheRenderer.render(kit.id, { viewport: 'desktop', lead });

    // Save or update prototype
    const proto = Repository.savePrototype({
      id: `kit_${kit.id}_${lead.id}`,
      leadId: lead.id,
      briefId: brief.id,
      provider: 'custom',
      status: 'concluido',
      artifactType: 'standalone_landing',
      url: `/api/niche-kits/${kit.id}/preview?leadId=${lead.id}`,
      previewHtml: desktopHtml
    });

    Repository.updateLeadStage(lead.id, 'prototipo_em_revisao', `Modelo de alta conversão (${kit.name}) aplicado`);

    res.json({
      success: true,
      kit: kit.name,
      brief,
      prototype: proto
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vercel Deployment & Configuration Endpoints
apiRouter.get('/vercel/config', async (req, res) => {
  try {
    const token = VercelDeployer.getActiveToken();
    const teamId = VercelDeployer.getActiveTeamId();
    if (!token) {
      return res.json({ success: true, hasToken: false, teamId });
    }
    const check = await VercelDeployer.verifyToken(token, teamId);
    res.json({
      success: true,
      hasToken: true,
      valid: check.valid,
      user: check.user,
      teamId,
      error: check.error
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/vercel/config', async (req, res) => {
  try {
    const { token, teamId } = req.body;
    if (token !== undefined) {
      Repository.setSetting('vercel_token', token.trim());
    }
    if (teamId !== undefined) {
      Repository.setSetting('vercel_team_id', teamId.trim());
    }

    const activeToken = VercelDeployer.getActiveToken(token);
    const activeTeamId = VercelDeployer.getActiveTeamId(teamId);
    let check = { valid: false, user: undefined as string | undefined, error: undefined as string | undefined };
    if (activeToken) {
      check = await VercelDeployer.verifyToken(activeToken, activeTeamId);
    }

    res.json({
      success: true,
      hasToken: !!activeToken,
      valid: check.valid,
      user: check.user,
      error: check.error,
      message: 'Configurações da Vercel salvas com sucesso'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deploy Prototype to Vercel
apiRouter.post('/prototypes/:id/deploy-vercel', async (req, res) => {
  try {
    const protoId = req.params.id;
    const proto = Repository.getPrototypeById(protoId);
    if (!proto) {
      return res.status(404).json({ success: false, error: 'Protótipo não encontrado' });
    }

    const lead = Repository.getLeadById(proto.leadId);
    let html = proto.previewHtml;

    if (!html || !html.trim()) {
      if (lead) {
        const doopCanvas = Repository.getDoopCanvasByLead(lead.id);
        const canvasId = doopCanvas?.id?.startsWith('canvas_')
          ? doopCanvas.id.replace('canvas_', '')
          : (doopCanvas?.url?.includes('/c/') ? doopCanvas.url.split('/c/')[1] : null);
        if (canvasId) {
          html = (await LayoutEngine.getCanvasPreviewHtml(canvasId)) || doopCanvas?.previewHtml;
        }
      }
    }

    const deployResult = await VercelDeployer.deploy(html, {
      projectName: req.body?.projectName || (lead ? lead.name : `site-${protoId}`),
      lead: lead || undefined,
      token: req.body?.token,
      teamId: req.body?.teamId
    });

    if (deployResult.success && deployResult.url) {
      Repository.updatePrototypeVercel(proto.id, deployResult.url, deployResult.deploymentId);
      if (lead) {
        Repository.updateLeadVercel(lead.id, deployResult.url);
        Repository.updateLeadStage(lead.id, 'prototipo_em_revisao', 'Site publicado na Vercel com link ao vivo');
      }

      Repository.logEvent({
        type: 'prototype_deployed_vercel',
        source: 'vercel_deployer',
        leadId: proto.leadId,
        payload: {
          prototypeId: proto.id,
          url: deployResult.url,
          deploymentId: deployResult.deploymentId
        }
      });
    }

    res.json({
      ...deployResult,
      prototypeId: proto.id,
      leadId: proto.leadId
    });
  } catch (error: any) {
    console.error('[routes] Erro no deploy para Vercel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deploy Lead directly to Vercel (Finds or generates prototype and deploys)
apiRouter.post('/leads/:id/deploy-vercel', async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = Repository.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead não encontrado' });
    }

    const protos = Repository.getPrototypesByLead(leadId);
    let targetProto = protos.find(p => p.previewHtml && p.previewHtml.trim().length > 0) || protos[0];
    let html = targetProto?.previewHtml;

    if (!html || !html.trim()) {
      const doopCanvas = Repository.getDoopCanvasByLead(leadId);
      const canvasId = doopCanvas?.id?.startsWith('canvas_')
        ? doopCanvas.id.replace('canvas_', '')
        : (doopCanvas?.url?.includes('/c/') ? doopCanvas.url.split('/c/')[1] : null);
      if (canvasId) {
        html = (await LayoutEngine.getCanvasPreviewHtml(canvasId)) || doopCanvas?.previewHtml;
      }
    }

    const deployResult = await VercelDeployer.deploy(html, {
      projectName: req.body?.projectName || lead.name,
      lead,
      token: req.body?.token,
      teamId: req.body?.teamId
    });

    if (deployResult.success && deployResult.url) {
      if (targetProto) {
        Repository.updatePrototypeVercel(targetProto.id, deployResult.url, deployResult.deploymentId);
      } else {
        const protoId = `proto_vercel_${Date.now()}`;
        targetProto = Repository.savePrototype({
          id: protoId,
          leadId,
          provider: 'builtin_generator',
          status: 'aprovado',
          artifactType: 'html_prototype',
          url: deployResult.url,
          previewHtml: html,
          vercelUrl: deployResult.url,
          vercelDeploymentId: deployResult.deploymentId,
          vercelDeployedAt: new Date().toISOString()
        });
      }

      Repository.updateLeadVercel(lead.id, deployResult.url);
      Repository.updateLeadStage(lead.id, 'prototipo_em_revisao', 'Site publicado na Vercel com link ao vivo');

      Repository.logEvent({
        type: 'lead_deployed_vercel',
        source: 'vercel_deployer',
        leadId: lead.id,
        payload: {
          url: deployResult.url,
          deploymentId: deployResult.deploymentId
        }
      });
    }

    const updatedLead = Repository.getLeadById(leadId);
    res.json({
      ...deployResult,
      lead: updatedLead,
      prototype: targetProto
    });
  } catch (error: any) {
    console.error('[routes] Erro no deploy de lead para Vercel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Doop Process Management Endpoints
apiRouter.post('/services/doop/start', async (req, res) => {
  try {
    const result = await DoopProcessManager.start();
    res.json({ success: result.success, message: result.message, status: DoopProcessManager.getStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/services/doop/stop', async (req, res) => {
  try {
    const result = await DoopProcessManager.stop();
    res.json({ success: result.success, message: result.message, status: DoopProcessManager.getStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/services/doop/restart', async (req, res) => {
  try {
    const result = await DoopProcessManager.restart();
    res.json({ success: result.success, message: result.message, status: DoopProcessManager.getStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/services/doop/status', (req, res) => {
  res.json({ success: true, status: DoopProcessManager.getStatus() });
});

apiRouter.get('/services/doop/logs', (req, res) => {
  res.json({ success: true, logs: DoopProcessManager.getLogs() });
});

// Config & Settings
apiRouter.get('/config', (req, res) => {
  try {
    const mode = Repository.getSetting('operation_mode', 'integrado_sem_envio');
    const openwaPort = Repository.getSetting('openwa_port', '2785');
    const doopPort = Repository.getSetting('doop_port', '4400');
    const scraperPort = Repository.getSetting('scraper_port', '8080');

    res.json({
      success: true,
      config: {
        mode,
        openwaPort: parseInt(openwaPort, 10),
        doopPort: parseInt(doopPort, 10),
        scraperPort: parseInt(scraperPort, 10),
        apiKeyMasked: 'owa_k1_****'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/config', (req, res) => {
  try {
    const { mode, openwaPort, doopPort, scraperPort } = req.body;
    if (mode) Repository.setSetting('operation_mode', mode);
    if (openwaPort) Repository.setSetting('openwa_port', String(openwaPort));
    if (doopPort) Repository.setSetting('doop_port', String(doopPort));
    if (scraperPort) Repository.setSetting('scraper_port', String(scraperPort));

    res.json({ success: true, message: 'Configurações salvas com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Purge Government Leads (.gov, .gov.br, prefeituras)
apiRouter.post('/leads/purge-gov', (req, res) => {
  try {
    const result = Repository.purgeGovLeads();
    const stats = Repository.getStats();
    res.json({
      success: true,
      result,
      stats,
      message: `${result.deletedCount} órgãos governamentais (.gov) removidos da base.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Site Validator Endpoints
apiRouter.post('/leads/:id/revalidate-site', async (req, res) => {
  try {
    const { id } = req.params;
    const { lead, result } = await SiteValidator.revalidateLead(id);
    res.json({
      success: true,
      lead,
      result,
      message: `Site revalidado com sucesso: ${result.siteAuditReason}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/leads/revalidate-timeouts', async (req, res) => {
  try {
    const limit = req.body.limit ? parseInt(req.body.limit, 10) : 250;
    const summary = await SiteValidator.revalidateTimeouts(limit);
    const stats = Repository.getStats();
    res.json({
      success: true,
      summary,
      stats,
      message: `${summary.recoveredOnline} sites recuperados como online de ${summary.totalChecked} verificados.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/site-check/validate-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL é obrigatória' });
    const result = await SiteValidator.validateUrl(url);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI & Copilot Endpoints (Claude Sonnet 5 via GhostCLI / Anthropic)
apiRouter.get('/ai/status', async (req, res) => {
  try {
    const status = await AIService.checkStatus();
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/ai/config', (req, res) => {
  try {
    const config = AIService.getConfig();
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/ai/config', (req, res) => {
  try {
    const { apiKey, baseUrl, model, provider } = req.body;
    AIService.saveConfig({ apiKey, baseUrl, model, provider });
    res.json({ success: true, message: 'Configurações de IA salvas com sucesso' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/ai/chat', async (req, res) => {
  try {
    const { messages, leadContext, customSystemPrompt } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Array de mensagens é obrigatório' });
    }
    const result = await AIService.chat({ messages, leadContext, customSystemPrompt });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/ai/analyze-lead', async (req, res) => {
  try {
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId é obrigatório' });
    }
    const result = await AIService.analyzeLead(leadId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/ai/suggest-reply', async (req, res) => {
  try {
    const { leadId, customInstruction } = req.body;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId é obrigatório' });
    }
    const result = await AIService.suggestReply(leadId, customInstruction);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Copilot Persisted History
apiRouter.get('/ai/messages', (req, res) => {
  try {
    const { leadId } = req.query;
    const messages = AIService.getHistory(leadId as string | undefined);
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/ai/messages', (req, res) => {
  try {
    const { leadId } = req.query;
    const deletedCount = AIService.clearHistory(leadId as string | undefined);
    res.json({ success: true, deletedCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Dynamic Humanized Approach Generator (Skill Humanizer)
apiRouter.post('/ai/generate-approach', async (req, res) => {
  try {
    const { leadId, senderName } = req.body;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId é obrigatório' });
    }
    const result = await AIService.generateHumanizedApproaches(leadId, { senderName });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
