import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DoopAdapter } from '../src/integrations/prototypeAdapter.js';
import { optimizeGoogleCdnUrl, normalizePhotos } from '../src/integrations/discoveryAdapter.js';
import { MediaEnricher } from '../src/integrations/mediaEnricher.js';
import { Repository } from '../src/persistence/database.js';

describe('Integração de Imagens Reais (Google Maps, WhatsApp, Redes Sociais, Fachada)', () => {
  test('optimizeGoogleCdnUrl deve redimensionar URLs do Google CDN e preservar outras URLs', () => {
    // 1. Google CDN with existing size parameter
    const googleUrl1 = 'https://lh3.googleusercontent.com/p/AF1QipN3-test=w120-h120';
    const optimized1 = optimizeGoogleCdnUrl(googleUrl1, 'w1600-h900-p-k-no');
    assert.strictEqual(optimized1, 'https://lh3.googleusercontent.com/p/AF1QipN3-test=w1600-h900-p-k-no');

    // 2. Google CDN without size parameter
    const googleUrl2 = 'https://lh5.googleusercontent.com/p/AF1QipP_another';
    const optimized2 = optimizeGoogleCdnUrl(googleUrl2, 's240-c-k-no');
    assert.strictEqual(optimized2, 'https://lh5.googleusercontent.com/p/AF1QipP_another=s240-c-k-no');

    // 3. Regular non-Google URL
    const regularUrl = 'https://meuestabelecimento.com/foto.jpg';
    assert.strictEqual(optimizeGoogleCdnUrl(regularUrl), regularUrl);
  });

  test('normalizePhotos deve tratar JSON arrays, arrays de objetos e delimitadores', () => {
    // 1. Array of strings
    const list1 = ['https://cdn.test/1.jpg', 'https://cdn.test/2.jpg'];
    const normalized1 = normalizePhotos(list1);
    assert.ok(normalized1);
    assert.deepStrictEqual(JSON.parse(normalized1), list1);

    // 2. Array of objects with image / photo field
    const list2 = [{ image: 'https://cdn.test/obj1.jpg' }, { photo: 'https://cdn.test/obj2.jpg' }];
    const normalized2 = normalizePhotos(list2);
    assert.ok(normalized2);
    assert.deepStrictEqual(JSON.parse(normalized2), ['https://cdn.test/obj1.jpg', 'https://cdn.test/obj2.jpg']);

    // 3. Delimiter separated string
    const stringList = 'https://cdn.test/a.jpg; https://cdn.test/b.jpg';
    const normalized3 = normalizePhotos(stringList);
    assert.ok(normalized3);
    assert.deepStrictEqual(JSON.parse(normalized3), ['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg']);
  });

  test('DoopAdapter.parseLeadImages deve priorizar heroImage, logoUrl, serviceImages e Street View', () => {
    const rawPhotos = JSON.stringify([
      'https://lh3.googleusercontent.com/p/photo1=w100-h100',
      'https://lh3.googleusercontent.com/p/photo2=w100-h100',
      'https://lh3.googleusercontent.com/p/photo3=w100-h100'
    ]);

    const leadData = {
      thumbnailUrl: 'https://lh3.googleusercontent.com/p/thumb=w200-h200',
      logoUrl: 'https://lh3.googleusercontent.com/p/logo=s100',
      photos: rawPhotos,
      latitude: -19.9854,
      longitude: -43.8470
    };

    const parsed = DoopAdapter.parseLeadImages(leadData);

    assert.strictEqual(parsed.hasRealPhotos, true);
    assert.strictEqual(parsed.heroImage, 'https://lh3.googleusercontent.com/p/thumb=w1600-h900-p-k-no');
    assert.strictEqual(parsed.logoUrl, 'https://lh3.googleusercontent.com/p/logo=s240-c-k-no');
    assert.strictEqual(parsed.serviceImages.length, 3);
    assert.strictEqual(parsed.serviceImages[0], 'https://lh3.googleusercontent.com/p/photo1=w800-h600-p-k-no');
    assert.ok(parsed.locationImage?.includes('location=-19.9854,-43.847'));
  });

  test('DoopAdapter.parseLeadImages deve utilizar a 1ª foto como heroImage se thumbnailUrl não existir', () => {
    const parsed = DoopAdapter.parseLeadImages({
      photos: JSON.stringify(['https://cdn.example.com/p1.jpg', 'https://cdn.example.com/p2.jpg'])
    });

    assert.strictEqual(parsed.hasRealPhotos, true);
    assert.strictEqual(parsed.heroImage, 'https://cdn.example.com/p1.jpg');
    assert.strictEqual(parsed.serviceImages.length, 1);
    assert.strictEqual(parsed.serviceImages[0], 'https://cdn.example.com/p2.jpg');
  });

  test('Repository deve persistir e recuperar thumbnailUrl, logoUrl, photos, latitude e longitude', () => {
    const photosJson = JSON.stringify(['https://cdn.maps/1.jpg', 'https://cdn.maps/2.jpg']);

    const lead = Repository.upsertLead({
      name: 'Studio Beleza Real Teste Imagens',
      source: 'test:images',
      city: 'Nova Lima',
      thumbnailUrl: 'https://lh3.googleusercontent.com/p/capa=w500',
      logoUrl: 'https://cdn.whatsapp.net/avatar123.jpg',
      photos: photosJson,
      latitude: -19.9854089,
      longitude: -43.8470691
    });

    assert.ok(lead.id);
    assert.strictEqual(lead.thumbnailUrl, 'https://lh3.googleusercontent.com/p/capa=w500');
    assert.strictEqual(lead.logoUrl, 'https://cdn.whatsapp.net/avatar123.jpg');
    assert.strictEqual(lead.photos, photosJson);
    assert.strictEqual(Number(lead.latitude).toFixed(4), '-19.9854');
    assert.strictEqual(Number(lead.longitude).toFixed(4), '-43.8471');

    const fetched = Repository.getLeadById(lead.id);
    assert.strictEqual(fetched?.thumbnailUrl, 'https://lh3.googleusercontent.com/p/capa=w500');
    assert.strictEqual(fetched?.logoUrl, 'https://cdn.whatsapp.net/avatar123.jpg');
    assert.strictEqual(fetched?.photos, photosJson);
  });

  test('DoopAdapter.renderPrototypeHtml deve injetar imagens reais no HTML do protótipo', () => {
    const html = DoopAdapter.renderPrototypeHtml({
      businessName: 'Barbearia VIP Real',
      segment: 'Barbearia',
      city: 'Contagem',
      thumbnailUrl: 'https://lh3.googleusercontent.com/p/thumb_vip=w400',
      logoUrl: 'https://lh3.googleusercontent.com/p/logo_vip=s80',
      photos: JSON.stringify(['https://lh3.googleusercontent.com/p/servico1=w300', 'https://lh3.googleusercontent.com/p/servico2=w300']),
      latitude: -19.932,
      longitude: -44.053
    });

    // 1. Logo in header
    assert.ok(html.includes('https://lh3.googleusercontent.com/p/logo_vip=s240-c-k-no'), 'Deve conter a logo oficial no header');

    // 2. Hero Image & Verified Badge
    assert.ok(html.includes('https://lh3.googleusercontent.com/p/thumb_vip=w1600-h900-p-k-no'), 'Deve conter a foto de capa real no hero');
    assert.ok(html.includes('Fotos Reais Verificadas'), 'Deve conter a badge de fotos reais no hero');

    // 3. Service Cards with Real Photo
    assert.ok(html.includes('https://lh3.googleusercontent.com/p/servico1=w800-h600-p-k-no'), 'Deve conter a foto real do 1º serviço');
    assert.ok(html.includes('Foto Real'), 'Deve conter a badge Foto Real nos cards de serviço');

    // 4. Facade / Street View in Location Section
    assert.ok(html.includes('Fachada / Street View'), 'Deve conter a seção de fachada/Street view');
    assert.ok(html.includes('location=-19.932,-44.053'), 'Deve conter a URL de Street View com coordenadas reais');
  });
});

