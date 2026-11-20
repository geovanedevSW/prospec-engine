import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ScraperKitAdapter } from '../src/integrations/discoveryAdapter.js';
import { Repository } from '../src/persistence/database.js';
import { DoopAdapter } from '../src/integrations/prototypeAdapter.js';

describe('Validação Real do Teste de Contagem com Reviews', () => {
  test('Deve importar leads reais do arquivo teste-reviews.csv com comentários', async () => {
    const adapter = new ScraperKitAdapter();
    const result = await adapter.discover({ filePath: '../google-maps-scraper-kit/out/teste-reviews.csv' });

    assert.ok(result.totalFound > 0, 'Deve encontrar leads no CSV');
    
    // Find Barbearia do Gustavo
    const gustavo = result.leads.find(l => l.name.includes('Gustavo'));
    assert.ok(gustavo, 'Barbearia do Gustavo deve estar presente');
    assert.ok(gustavo?.userReviews, 'Deve conter userReviews');

    // Upsert to SQLite
    const saved = Repository.upsertLead({
      name: gustavo.name,
      source: gustavo.source,
      category: gustavo.category,
      address: gustavo.address,
      city: gustavo.city,
      phoneRaw: gustavo.phoneRaw,
      phoneNorm: gustavo.phoneNorm,
      website: gustavo.website,
      websiteType: gustavo.websiteType,
      siteStatus: gustavo.siteStatus,
      pitchType: gustavo.pitchType,
      rating: gustavo.rating,
      reviewsCount: gustavo.reviewsCount,
      userReviews: gustavo.userReviews
    });

    assert.ok(saved.id);
    assert.ok(saved.userReviews);

    // Render HTML Prototype
    const html = DoopAdapter.renderPrototypeHtml({
      businessName: saved.name,
      segment: saved.category,
      city: saved.city,
      rating: saved.rating,
      reviewsCount: saved.reviewsCount,
      userReviews: saved.userReviews
    });

    // Check that real customer comments are in the HTML
    assert.ok(html.includes('Deivison Cardoso') || html.includes('Ana estavao'), 'Deve conter nome de cliente real no HTML');
    assert.ok(html.includes('Barbearia do Gustavo'), 'Deve conter título da empresa');
  });
});

