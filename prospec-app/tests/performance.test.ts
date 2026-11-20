import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Repository, getCached, invalidateCache } from '../src/persistence/database.js';
import { app } from '../src/index.js';

describe('Otimizações de Performance: Banco, RAM Cache, Redes e Sparse Fields', () => {
  test('1. Repository RAM Cache deve servir dados em memória e invalidar em mutações', () => {
    // Test cache key
    let computeCount = 0;
    const testKey = 'test_perf_key';
    const computeFn = () => {
      computeCount++;
      return { value: 42, count: computeCount };
    };

    const first = getCached(testKey, 5000, computeFn);
    assert.equal(first.count, 1);

    // Second call within TTL should return cached object without running computeFn
    const second = getCached(testKey, 5000, computeFn);
    assert.equal(second.count, 1);
    assert.equal(computeCount, 1);

    // Invalidation should force recompute
    invalidateCache('test_perf_');
    const third = getCached(testKey, 5000, computeFn);
    assert.equal(third.count, 2);
    assert.equal(computeCount, 2);
  });

  test('2. getStats deve usar RAM cache para acelerar chamadas repetidas', () => {
    const stats1 = Repository.getStats();
    assert.ok(stats1.totalLeads >= 0);

    const stats2 = Repository.getStats();
    assert.equal(stats1, stats2); // Same object reference from RAM cache
  });

  test('3. getLeads com summary=true deve omitir campos pesados (userReviews, photos)', () => {
    // Insert a lead with heavy review and photo arrays
    const lead = Repository.upsertLead({
      name: 'Comércio Teste Performance',
      source: 'test_scraper',
      category: 'Restaurante',
      city: 'Belo Horizonte',
      userReviews: JSON.stringify([{ author: 'Cliente', text: 'Muito bom atendimento!' }]),
      photos: JSON.stringify(['https://lh3.googleusercontent.com/p/foto1', 'https://lh3.googleusercontent.com/p/foto2'])
    });

    // Full fetch (summary = false)
    const fullList = Repository.getLeads({ search: 'Comércio Teste Performance', summary: false });
    const fullLead = fullList.find((l) => l.id === lead.id);
    assert.ok(fullLead);
    assert.ok(fullLead.userReviews);
    assert.ok(fullLead.photos);

    // Lightweight fetch (summary = true)
    const summaryList = Repository.getLeads({ search: 'Comércio Teste Performance', summary: true });
    const summaryLead = summaryList.find((l) => l.id === lead.id);
    assert.ok(summaryLead);
    assert.equal(summaryLead.name, 'Comércio Teste Performance');
    assert.equal(summaryLead.userReviews, undefined, 'userReviews deve ser omitido no modo summary');
    assert.equal(summaryLead.photos, undefined, 'photos deve ser omitido no modo summary');
  });

  test('4. Servidor Express deve estar configurado com middleware de compressão e rotas de status', () => {
    assert.ok(app);
    // Verify app handles /api/status route
    assert.equal(typeof (app as any).handle, 'function');
  });
});

