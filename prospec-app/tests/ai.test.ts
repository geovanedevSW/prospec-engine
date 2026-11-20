import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from '../src/index.js';
import { AIService } from '../src/services/aiService.js';

describe('Integração de IA (Claude Sonnet 5 via GhostCLI)', () => {
  let server: any;
  let baseUrl = '';

  before(async () => {
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

  it('GET /api/ai/config deve retornar configuração ativa com chave mascarada', async () => {
    const { status, data } = await api('/api/ai/config');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.config.provider, 'anthropic');
    assert.strictEqual(data.config.model, 'claude-sonnet-5');
    assert.strictEqual(data.config.hasKey, true);
    assert.ok(data.config.maskedKey.includes('...'));
  });

  it('GET /api/ai/status deve conectar com GhostCLI e validar Claude Sonnet', async () => {
    const { status, data } = await api('/api/ai/status');
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.model, 'claude-sonnet-5');
    if (data.available) {
      assert.ok(typeof data.latencyMs === 'number');
    } else {
      assert.ok(typeof data.error === 'string');
    }
  });

  it('POST /api/ai/chat deve validar payload de mensagens', async () => {
    const { status, data } = await api('/api/ai/chat', { method: 'POST', body: {} });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
  });

  it('GET e DELETE /api/ai/messages devem persistir e gerenciar histórico SQLite', async () => {
    // 1. Salvar mensagem via Repository
    const { Repository } = await import('../src/persistence/database.js');
    Repository.saveAiMessage({
      role: 'user',
      content: 'Mensagem de teste de histórico'
    });
    Repository.saveAiMessage({
      role: 'assistant',
      content: 'Resposta de teste persistida no SQLite'
    });

    // 2. Buscar histórico via API
    const { status: getStatus, data: getData } = await api('/api/ai/messages');
    assert.strictEqual(getStatus, 200);
    assert.strictEqual(getData.success, true);
    assert.ok(Array.isArray(getData.messages));
    assert.ok(getData.messages.some((m: any) => m.content === 'Mensagem de teste de histórico'));

    // 3. Limpar histórico via DELETE
    const { status: delStatus, data: delData } = await api('/api/ai/messages', { method: 'DELETE' });
    assert.strictEqual(delStatus, 200);
    assert.strictEqual(delData.success, true);

    // 4. Confirmar que limpou
    const { data: afterData } = await api('/api/ai/messages');
    assert.strictEqual(afterData.messages.length, 0);
  });

  it('POST /api/ai/generate-approach deve validar leadId obrigatório', async () => {
    const { status, data } = await api('/api/ai/generate-approach', { method: 'POST', body: {} });
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('leadId'));
  });

  it('sanitizeHumanizerText deve remover travessões de IA (—) e adjetivos inflados (ex: nota impecável)', async () => {
    const { sanitizeHumanizerText } = await import('../src/services/aiService.js');
    const input = 'Vi aqui que vocês mantêm uma nota impecável de 5.0 estrelas no Google com mais de 50 avaliações — parabéns pelo cuidado com os pacientes.';
    const output = sanitizeHumanizerText(input);

    // Não pode conter nenhum travessão em dash
    assert.strictEqual(output.includes('—'), false, 'Não deve conter travessão em dash (—)');
    assert.strictEqual(output.includes('–'), false, 'Não deve conter en-dash (–)');
    // Não pode conter adjetivo inflado 'nota impecável'
    assert.strictEqual(output.includes('nota impecável'), false, 'Não deve conter "nota impecável"');
    // Deve ter substituído com naturalidade
    assert.ok(output.includes('ótima nota'));
    assert.ok(output.includes('50 avaliações, parabéns'));
  });
});

