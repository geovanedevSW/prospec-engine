import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { app, autoSeedIfEmpty } from '../src/index.js';
import { Repository } from '../src/persistence/database.js';

describe('API Routes: Central Operação Local', () => {
  let server: any;
  let baseUrl = '';

  before(async () => {
    await autoSeedIfEmpty();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        const port = typeof addr === 'object' && addr ? addr.port : 3333;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Helper for json requests
  async function api(path: string, options: { method?: string; body?: any } = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  it('GET /api/status deve retornar status dos 3 serviços e métricas', async () => {
    const { status, data } = await api('/api/status');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.services.length, 3);
    assert.ok(data.stats, 'Deve conter estatísticas');
  });

  it('POST /api/leads/import deve importar leads do scraper kit', async () => {
    const { status, data } = await api('/api/leads/import', {
      method: 'POST',
      body: { limit: 25 },
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.importedCount > 0, 'Deve importar pelo menos 1 lead');
  });

  it('GET /api/leads deve listar os leads com paginação e busca', async () => {
    const { status, data } = await api('/api/leads?limit=10');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.leads));
    assert.ok(data.leads.length > 0);
  });

  it('GET /api/niches e GET /api/leads?niche=... devem filtrar nichos corretamente', async () => {
    const { status, data } = await api('/api/niches');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.niches));
    assert.ok(data.niches.length > 0);

    const belezaNiche = data.niches.find((n: any) => n.id === 'beleza');
    assert.ok(belezaNiche, 'Nicho beleza deve existir');
    assert.ok(belezaNiche.count > 0, 'Deve ter contatos no nicho beleza');

    // Testar filtro por nicho
    const filteredRes = await api('/api/leads?niche=beleza&limit=10');
    assert.strictEqual(filteredRes.status, 200);
    assert.ok(filteredRes.data.leads.length > 0);
    for (const lead of filteredRes.data.leads) {
      assert.strictEqual(lead.niche, 'beleza');
    }
  });

  it('Fluxo Completo Manual: Lead -> WhatsApp Preparado -> Protótipo Gerado', async () => {
    // 1. Pegar primeiro lead
    const listRes = await api('/api/leads?limit=1');
    const lead = listRes.data.leads[0];
    assert.ok(lead, 'Deve existir um lead');

    // 2. Preparar WhatsApp sem redigitação
    const waPrep = await api('/api/whatsapp/prepare', {
      method: 'POST',
      body: {
        leadId: lead.id,
        phone: lead.phoneNorm || lead.phoneRaw,
      },
    });
    assert.strictEqual(waPrep.status, 200);
    assert.strictEqual(waPrep.data.success, true);
    assert.ok(waPrep.data.message.body.length > 10, 'Mensagem contextualizada gerada');

    // 3. Aprovar mensagem
    const waApprove = await api('/api/whatsapp/approve', {
      method: 'POST',
      body: { messageId: waPrep.data.message.id },
    });
    assert.strictEqual(waApprove.status, 200);

    // 4. Enviar mensagem (em modo seguro simulado)
    const waSend = await api('/api/whatsapp/send', {
      method: 'POST',
      body: {
        messageId: waPrep.data.message.id,
        leadId: lead.id,
        phone: lead.phoneNorm,
        body: waPrep.data.message.body,
        mode: 'integrado_sem_envio'
      },
    });
    assert.strictEqual(waSend.status, 200);
    assert.strictEqual(waSend.data.result.status, 'mock_sent');

    // 5. Salvar briefing de protótipo sem redigitação
    const briefRes = await api('/api/prototypes/briefing', {
      method: 'POST',
      body: {
        leadId: lead.id,
        businessName: lead.name,
        segment: lead.category,
        cta: 'Chamar no WhatsApp',
        services: ['Serviço Especializado 1', 'Serviço Especializado 2'],
        status: 'confirmado',
      },
    });
    assert.strictEqual(briefRes.status, 200);
    assert.strictEqual(briefRes.data.success, true);

    // 6. Gerar Protótipo
    const protoRes = await api('/api/prototypes/generate', {
      method: 'POST',
      body: { leadId: lead.id },
    });
    assert.strictEqual(protoRes.status, 200);
    assert.strictEqual(protoRes.data.success, true);
    assert.ok(
      protoRes.data.prototype.url.includes('/c/') || protoRes.data.prototype.url.includes('/api/prototypes/'),
      'URL do protótipo deve ser do Doop Canvas ou API local'
    );

    // 7. Preview HTML do protótipo
    const previewEndpoint = protoRes.data.canvasId
      ? `/api/prototypes/canvas/${protoRes.data.canvasId}/preview`
      : protoRes.data.prototype.url;
    const previewRes = await fetch(`${baseUrl}${previewEndpoint}?leadId=${lead.id}`);
    assert.strictEqual(previewRes.status, 200);
    const htmlText = await previewRes.text();
    assert.ok(htmlText.includes(lead.name), 'HTML deve renderizar o nome da empresa');
    assert.ok(htmlText.includes('Chamar no WhatsApp'), 'HTML deve renderizar o CTA');

    // Limpeza da mensagem criada no teste de fluxo
    if (waPrep?.data?.message?.id) {
      Repository.deleteMessage(waPrep.data.message.id);
    }
  });

  it('GET /api/config deve retornar configuração com segredos mascarados', async () => {
    const { status, data } = await api('/api/config');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.config.apiKeyMasked.includes('****'), 'Segredo deve estar mascarado');
  });

  it('PUT /api/leads/:id deve atualizar telefone, observações e dados do comércio', async () => {
    const listRes = await api('/api/leads?limit=1');
    assert.strictEqual(listRes.status, 200);
    const targetLead = listRes.data.leads[0];
    assert.ok(targetLead, 'Deve encontrar um lead para teste');

    const updatePayload = {
      phone: '(31) 9207-4101',
      notes: 'Contato de teste autorizado pelo operador: 553192074101',
      city: 'Belo Horizonte'
    };

    const updateRes = await api(`/api/leads/${targetLead.id}`, {
      method: 'PUT',
      body: updatePayload
    });

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.success, true);
    assert.strictEqual(updateRes.data.lead.phoneRaw, '(31) 9207-4101');
    assert.strictEqual(updateRes.data.lead.phoneNorm, '553192074101');
    assert.strictEqual(updateRes.data.lead.notes, 'Contato de teste autorizado pelo operador: 553192074101');
  });

  it('GET /api/whatsapp/conversations deve retornar resumo de conversas ativas', async () => {
    const { status, data } = await api('/api/whatsapp/conversations');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.conversations), 'Deve retornar array de conversas');
  });

  it('GET /api/whatsapp/chat/:leadId e POST /api/whatsapp/chat/:leadId/send devem gerenciar timeline do chat', async () => {
    const listRes = await api('/api/leads?limit=1');
    assert.strictEqual(listRes.status, 200);
    const lead = listRes.data.leads[0];
    assert.ok(lead, 'Deve encontrar um lead para o chat');

    // 1. Enviar mensagem de resposta no chat (em modo seguro)
    const sendRes = await api(`/api/whatsapp/chat/${lead.id}/send`, {
      method: 'POST',
      body: {
        text: 'Olá! Teste de mensagem pelo chat em tempo real.',
        senderName: 'Geovane Teste',
        mode: 'integrado_sem_envio'
      }
    });
    assert.strictEqual(sendRes.status, 200);
    assert.strictEqual(sendRes.data.success, true);
    assert.ok(sendRes.data.message.id, 'Deve retornar ID da mensagem gravada');

    // 2. Buscar timeline do chat e conferir a mensagem inserida
    const chatRes = await api(`/api/whatsapp/chat/${lead.id}`);
    assert.strictEqual(chatRes.status, 200);
    assert.strictEqual(chatRes.data.success, true);
    assert.ok(Array.isArray(chatRes.data.messages), 'Deve retornar mensagens');
    assert.ok(chatRes.data.messages.length > 0, 'Deve conter a mensagem gravada');
    const lastMsg = chatRes.data.messages[chatRes.data.messages.length - 1];
    assert.strictEqual(lastMsg.body, 'Olá! Teste de mensagem pelo chat em tempo real.');
    assert.strictEqual(lastMsg.direction, 'outbound');

    // Limpeza da mensagem criada no teste de chat
    if (sendRes?.data?.message?.id) {
      Repository.deleteMessage(sendRes.data.message.id);
    }
  });
});
