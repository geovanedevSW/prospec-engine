import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DoopAdapter } from '../src/integrations/prototypeAdapter.js';
import { Repository } from '../src/persistence/database.js';

describe('Suporte a Comentários e Avaliações de Clientes', () => {
  test('DoopAdapter.parseLeadReviews deve fazer parse de reviews em JSON e delimitadores', () => {
    // 1. JSON Array of objects
    const jsonReviews = JSON.stringify([
      { name: 'Carlos Eduardo', rating: 5, text: 'Serviço nota 10, muito profissional!', when: 'há 2 semanas' },
      { name: 'Mariana Lima', rating: 5, text: 'Melhor experiência da região!', when: 'há 1 mês' }
    ]);
    const parsed1 = DoopAdapter.parseLeadReviews(jsonReviews);
    assert.strictEqual(parsed1.length, 2);
    assert.strictEqual(parsed1[0].author, 'Carlos Eduardo');
    assert.strictEqual(parsed1[0].text, 'Serviço nota 10, muito profissional!');
    assert.strictEqual(parsed1[0].time, 'há 2 semanas');

    // 2. Delimiter separated strings
    const delimReviews = 'Atendimento excelente;Recomendo a todos da cidade';
    const parsed2 = DoopAdapter.parseLeadReviews(delimReviews);
    assert.strictEqual(parsed2.length, 2);
    assert.strictEqual(parsed2[0].text, 'Atendimento excelente');
    assert.strictEqual(parsed2[1].text, 'Recomendo a todos da cidade');
  });

  test('DoopAdapter.renderPrototypeHtml deve injetar depoimentos com comentários reais do Google', () => {
    const realReviewsJson = JSON.stringify([
      { author: 'Ana Paula Rocha', rating: 5, text: 'Minha oficina de confiança há mais de 5 anos!', time: 'Cliente Verificado' }
    ]);

    const html = DoopAdapter.renderPrototypeHtml({
      businessName: 'Auto Mecânica Rocha',
      segment: 'Oficina Mecânica',
      city: 'Betim',
      rating: '4.9',
      reviewsCount: '150',
      userReviews: realReviewsJson
    });

    assert.ok(html.includes('Ana Paula Rocha'), 'Deve conter o nome do cliente real');
    assert.ok(html.includes('Minha oficina de confiança há mais de 5 anos!'), 'Deve conter o comentário real');
    assert.ok(html.includes('Cliente Verificado'), 'Deve conter a badge de validação');
  });

  test('Repository deve persistir e recuperar userReviews na tabela leads', () => {
    const reviewsData = JSON.stringify([
      { author: 'Felipe Santos', rating: 5, text: 'Corte perfeito e pontualidade britânica!' }
    ]);

    const lead = Repository.upsertLead({
      name: 'Barbearia Imperial Teste Reviews',
      source: 'test:reviews',
      city: 'Belo Horizonte',
      userReviews: reviewsData
    });

    assert.ok(lead.id, 'Lead deve possuir ID');
    assert.strictEqual(lead.userReviews, reviewsData, 'userReviews deve ser persistido');

    const fetched = Repository.getLeadById(lead.id);
    assert.strictEqual(fetched?.userReviews, reviewsData, 'userReviews deve ser recuperado por getLeadById');
  });
});
