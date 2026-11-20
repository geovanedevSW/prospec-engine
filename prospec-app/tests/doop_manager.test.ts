import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DoopProcessManager } from '../src/services/doopProcessManager.js';

describe('DoopProcessManager: Gerenciamento do Doop', () => {

  it('1. Deve localizar o diretório do binário Bun no ambiente Windows', () => {
    const bunDir = DoopProcessManager.findBunDir();
    assert.ok(bunDir.length > 0, 'Deveria localizar o diretório do bun');
    assert.ok(bunDir.includes('.bun'), 'Caminho deve apontar para ~/.bun/bin');
  });

  it('2. getStatus deve retornar estrutura válida de status', () => {
    const status = DoopProcessManager.getStatus();
    assert.ok(typeof status.running === 'boolean');
    assert.strictEqual(status.port, 4400);
    assert.strictEqual(status.clientPort, 4300);
  });

  it('3. getLogs deve retornar array de logs', () => {
    const logs = DoopProcessManager.getLogs();
    assert.ok(Array.isArray(logs));
  });
});

