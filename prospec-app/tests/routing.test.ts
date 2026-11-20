import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { app } from '../src/index.js';
import { matchRoute, buildRouteUrl, TAB_ROUTES } from '../src/client/src/utils/router.js';

describe('Sistema de Rotas & SPA Deep-Linking (Central Operação Local)', () => {
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

  describe('1. Entrega Servidor Express (SPA Fallback & Caching)', () => {
    const routesToTest = [
      { path: '/', label: 'Visão Geral (Raiz)' },
      { path: '/prospeccao', label: 'Prospecção' },
      { path: '/conversas', label: 'Conversas WhatsApp' },
      { path: '/whatsapp', label: 'WhatsApp Studio' },
      { path: '/layouts', label: 'Layouts no Doop' },
      { path: '/operacao', label: 'Operação' },
      { path: '/leads', label: 'Alias /leads' },
      { path: '/conversations', label: 'Alias /conversations' },
      { path: '/prospeccao?lead=123', label: 'Deep link com query lead' },
      { path: '/conversas?lead=abc-456', label: 'Deep link conversas com lead' },
    ];

    for (const { path, label } of routesToTest) {
      it(`GET ${path} deve retornar 200 com HTML index shell (${label})`, async () => {
        const res = await fetch(`${baseUrl}${path}`);
        assert.strictEqual(res.status, 200);
        const text = await res.text();
        assert.ok(text.includes('<!DOCTYPE html>') || text.includes('Central Operação Local'), 'Deve servir HTML');
        assert.ok(text.includes('root') || text.includes('Central'), 'Deve conter container raiz do SPA');
      });
    }

    it('HTML shell deve conter headers de revalidação Cache-Control (anti-cache)', async () => {
      const res = await fetch(`${baseUrl}/prospeccao`);
      const cacheControl = res.headers.get('cache-control');
      assert.ok(cacheControl, 'Deve possuir header Cache-Control');
      assert.ok(cacheControl.includes('no-cache') || cacheControl.includes('must-revalidate'), 'Deve solicitar revalidação de index.html');
    });

    it('Rotas de /api não devem ser sequestradas pelo SPA fallback', async () => {
      const res = await fetch(`${baseUrl}/api/status`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });
  });

  describe('2. Resolução de Rotas Client-Side (matchRoute & buildRouteUrl)', () => {
    it('Deve mapear "/" para a aba overview', () => {
      const match = matchRoute('/');
      assert.strictEqual(match.tab, 'overview');
      assert.strictEqual(match.canonicalPath, '/');
      assert.strictEqual(match.isAlias, false);
    });

    it('Deve mapear "/prospeccao" para a aba leads', () => {
      const match = matchRoute('/prospeccao');
      assert.strictEqual(match.tab, 'leads');
      assert.strictEqual(match.canonicalPath, '/prospeccao');
      assert.strictEqual(match.isAlias, false);
    });

    it('Deve reconhecer alias "/leads" e marcar isAlias=true para normalização', () => {
      const match = matchRoute('/leads');
      assert.strictEqual(match.tab, 'leads');
      assert.strictEqual(match.canonicalPath, '/prospeccao');
      assert.strictEqual(match.isAlias, true);
    });

    it('Deve mapear "/conversas" para a aba conversations', () => {
      const match = matchRoute('/conversas');
      assert.strictEqual(match.tab, 'conversations');
      assert.strictEqual(match.canonicalPath, '/conversas');
      assert.strictEqual(match.isAlias, false);
    });

    it('Deve reconhecer alias "/conversations" e marcar isAlias=true', () => {
      const match = matchRoute('/conversations');
      assert.strictEqual(match.tab, 'conversations');
      assert.strictEqual(match.canonicalPath, '/conversas');
      assert.strictEqual(match.isAlias, true);
    });

    it('Deve mapear "/whatsapp" para whatsapp studio', () => {
      const match = matchRoute('/whatsapp');
      assert.strictEqual(match.tab, 'whatsapp');
      assert.strictEqual(match.canonicalPath, '/whatsapp');
    });

    it('Deve mapear "/layouts" para prototypes doop', () => {
      const match = matchRoute('/layouts');
      assert.strictEqual(match.tab, 'prototypes');
      assert.strictEqual(match.canonicalPath, '/layouts');
    });

    it('Deve mapear "/operacao" para settings', () => {
      const match = matchRoute('/operacao');
      assert.strictEqual(match.tab, 'settings');
      assert.strictEqual(match.canonicalPath, '/operacao');
    });

    it('Deve extrair leadId via query string (?lead=abc)', () => {
      const match = matchRoute('/conversas', '?lead=comercio-123');
      assert.strictEqual(match.tab, 'conversations');
      assert.strictEqual(match.leadId, 'comercio-123');
    });

    it('Deve extrair leadId via path segment (/prospeccao/abc-99)', () => {
      const match = matchRoute('/prospeccao/abc-99');
      assert.strictEqual(match.tab, 'leads');
      assert.strictEqual(match.leadId, 'abc-99');
    });

    it('buildRouteUrl deve construir URLs canônicas corretas', () => {
      assert.strictEqual(buildRouteUrl('overview'), '/');
      assert.strictEqual(buildRouteUrl('leads'), '/prospeccao');
      assert.strictEqual(buildRouteUrl('leads', 'lead-77'), '/prospeccao?lead=lead-77');
      assert.strictEqual(buildRouteUrl('conversations', 'lead-88'), '/conversas?lead=lead-88');
      assert.strictEqual(buildRouteUrl('whatsapp', 'lead-99'), '/whatsapp?lead=lead-99');
      assert.strictEqual(buildRouteUrl('prototypes', 'lead-11'), '/layouts?lead=lead-11');
      assert.strictEqual(buildRouteUrl('settings'), '/operacao');
    });
  });
});

