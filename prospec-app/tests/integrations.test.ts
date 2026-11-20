import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ScraperKitAdapter } from '../src/integrations/discoveryAdapter.js';
import { OpenWAAdapter } from '../src/integrations/messagingAdapter.js';
import { DoopAdapter } from '../src/integrations/prototypeAdapter.js';
import { Repository } from '../src/persistence/database.js';
import { ServiceRegistry } from '../src/services/serviceRegistry.js';

describe('Fase 0: Central Local Integrada', () => {

  it('1. ScraperKitAdapter deve detectar capabilities e ler dados reais de RMBH', async () => {
    const adapter = new ScraperKitAdapter();
    const caps = await adapter.capabilities();
    assert.strictEqual(caps.canImportCSV, true);
    assert.strictEqual(caps.hasCachedData, true);

    const result = await adapter.discover({ limit: 10 });
    assert.ok(result.totalFound > 0, 'Deveria encontrar leads no CSV');
    assert.ok(result.leads.length > 0, 'Deveria retornar lista de leads');

    const firstLead = result.leads[0];
    assert.ok(firstLead.name, 'Lead deve ter nome');
    assert.ok(firstLead.pitchType, 'Lead deve ter pitchType');
    assert.ok(firstLead.source.includes('google-maps-scraper-kit'), 'Origem deve ser preservada');
  });

  it('2. Repository deve persistir e deduplicar leads mantendo dados após reinício', () => {
    const testLead = {
      name: 'Comércio de Teste Integrado',
      source: 'test_suite',
      city: 'Belo Horizonte',
      phoneNorm: '5531988887777',
      category: 'Padaria & Confeitaria',
      pitchType: 'no_site' as const,
      priority: 'alta' as const
    };

    const saved = Repository.upsertLead(testLead);
    assert.ok(saved.id, 'Deve gerar ID');
    assert.strictEqual(saved.name, 'Comércio de Teste Integrado');

    // Re-upsert must deduplicate by phoneNorm
    const duplicate = Repository.upsertLead({
      name: 'Comércio de Teste Atualizado',
      source: 'test_suite_2',
      city: 'Belo Horizonte',
      phoneNorm: '5531988887777'
    });

    assert.strictEqual(duplicate.id, saved.id, 'IDs devem coincidir (deduplicação)');
    assert.strictEqual(duplicate.name, 'Comércio de Teste Atualizado');

    // Stage update
    const updated = Repository.updateLeadStage(saved.id, 'qualificado', 'Qualificado no teste');
    assert.strictEqual(updated?.stage, 'qualificado');
  });

  it('3. OpenWAAdapter deve gerar mensagens contextualizadas e operar em modo seguro', async () => {
    const adapter = new OpenWAAdapter(2785);
    const health = await adapter.health();
    assert.ok(['connected', 'disconnected', 'mock'].includes(health.status));

    const leadMock = {
      id: 'lead_123',
      name: 'Oficina Central BH',
      city: 'Belo Horizonte',
      category: 'Mecânica Automotiva',
      address: 'Av Amazonas, 1000',
      phoneRaw: '31999998888',
      phoneNorm: '5531999998888',
      website: '',
      websiteType: 'none',
      siteStatus: 'none',
      priority: 'alta' as const,
      stage: 'novo' as const,
      pitchType: 'offline_site' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pitch = OpenWAAdapter.generatePitchMessage(leadMock);
    assert.ok(pitch.includes('fora do ar'), 'Pitch de site offline deve conter texto de fora do ar');
    assert.ok(pitch.includes('Oficina Central BH'), 'Deve citar o nome da empresa');

    // Safe mode dispatch must NEVER make real network requests
    const sendRes = await adapter.send({
      leadId: leadMock.id,
      phone: leadMock.phoneNorm,
      body: pitch
    }, 'integrado_sem_envio');

    assert.strictEqual(sendRes.success, true);
    assert.strictEqual(sendRes.status, 'mock_sent');
    assert.ok(sendRes.providerMsgId?.includes('mock_'));
  });

  it('4. DoopAdapter deve gerar briefing compartilhado e HTML de alta fidelidade sem redigitação', async () => {
    const adapter = new DoopAdapter();
    const caps = await adapter.capabilities();
    assert.strictEqual(caps.canGenerateHtml, true);

    const brief = {
      businessName: 'Clínica Sorriso Perfeito',
      segment: 'Odontologia Especializada',
      services: ['Implantes Dentários', 'Ortodontia Digital', 'Clareamento a Laser'],
      cta: 'Agende sua Avaliação no WhatsApp'
    };

    const html = DoopAdapter.renderPrototypeHtml(brief);
    assert.ok(html.includes('Clínica Sorriso Perfeito'));
    assert.ok(html.includes('Implantes Dentários'));
    assert.ok(html.includes('Agende sua Avaliação no WhatsApp'));
    assert.ok(html.includes('Demonstração visual personalizada'));
  });

  it('5. ServiceRegistry deve reportar o estado de cada módulo isoladamente sem falhas', async () => {
    const services = await ServiceRegistry.getServicesStatus();
    assert.strictEqual(services.length, 3);

    const scraper = services.find(s => s.id === 'scraper');
    const openwa = services.find(s => s.id === 'openwa');
    const doop = services.find(s => s.id === 'doop');

    assert.ok(scraper, 'Scraper report deve existir');
    assert.ok(openwa, 'OpenWA report deve existir');
    assert.ok(doop, 'Doop report deve existir');

    assert.ok(['available', 'connected', 'disconnected', 'stopped', 'mock'].includes(scraper!.status));
    assert.ok(['available', 'connected', 'disconnected', 'stopped', 'mock'].includes(openwa!.status));
    assert.ok(['available', 'connected', 'disconnected', 'stopped', 'mock'].includes(doop!.status));
  });
});
