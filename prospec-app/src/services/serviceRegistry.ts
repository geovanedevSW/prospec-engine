import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ServiceStatusReport } from '../domain/types.js';
import { DoopProcessManager } from './doopProcessManager.js';
import { SCRAPER_DIR, OPENWA_DIR, DOOP_DIR } from '../config.js';
import { OpenWAAdapter } from '../integrations/messagingAdapter.js';

export class ServiceRegistry {
  private static checkPort(port: number, host = '127.0.0.1', timeoutMs = 800): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.request(
        {
          hostname: host,
          port,
          path: '/',
          method: 'GET',
          timeout: timeoutMs
        },
        () => resolve(true)
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  static async getServicesStatus(): Promise<ServiceStatusReport[]> {
    const now = new Date().toISOString();

    // 1. Scraper Kit status
    const scraperPortActive = await this.checkPort(8080) || await this.checkPort(3000);
    const scraperOutDir = path.join(SCRAPER_DIR, 'out');
    let csvCount = 0;
    try {
      if (fs.existsSync(scraperOutDir)) {
        csvCount = fs.readdirSync(scraperOutDir).filter(f => f.endsWith('.csv')).length;
      }
    } catch {
      // Ignored
    }

    const scraperReport: ServiceStatusReport = {
      id: 'scraper',
      name: 'Google Maps Scraper Kit',
      port: 8080,
      endpoint: 'http://localhost:8080',
      lastCheckedAt: now,
      mode: scraperPortActive ? 'real' : 'mock',
      status: scraperPortActive
        ? 'available'
        : (csvCount > 0 ? 'available' : 'stopped'),
      summary: scraperPortActive
        ? 'Motor Docker ou App Next.js ativo na porta.'
        : (csvCount > 0
            ? `Motor offline, mas ${csvCount} arquivos CSV disponíveis em out/ para importação imediata.`
            : 'Motor parado e sem arquivos CSV detectados.'),
      actionRequired: scraperPortActive
        ? undefined
        : 'Inicie o container com "docker compose up -d" no scraper ou importe os CSVs existentes.',
      details: {
        hasCachedCSVs: csvCount > 0,
        csvCount,
        nextAppPort: 3000
      }
    };

    // 2. OpenWA status
    const openwaPortActive = await this.checkPort(2785);
    const apiKeyFile = path.join(OPENWA_DIR, 'data', '.api-key');
    const sessionDir = path.join(OPENWA_DIR, 'data', 'sessions');
    let hasSavedSession = false;
    let sessionName = '';
    let apiKey = '';
    try {
      if (fs.existsSync(apiKeyFile)) {
        apiKey = fs.readFileSync(apiKeyFile, 'utf-8').trim();
      }
    } catch {
      // Ignored
    }

    if (fs.existsSync(sessionDir)) {
      try {
        const list = fs.readdirSync(sessionDir).filter(s => s.startsWith('session-'));
        if (list.length > 0) {
          hasSavedSession = true;
          sessionName = list[0];
        }
      } catch {
        // Ignored
      }
    }
    const hasApiKey = Boolean(apiKey);

    let sessionDetailText = 'Gateway HTTP ativo.';
    let sessionStatusStr = 'connected';
    let activePhone = '';
    let activePushName = '';

    if (openwaPortActive) {
      try {
        const adapter = new OpenWAAdapter();
        const sessionInfo = await adapter.getActiveSession();

        if (sessionInfo) {
          hasSavedSession = true;
          sessionName = sessionInfo.name || sessionName;
          activePhone = sessionInfo.phone || '';
          activePushName = sessionInfo.pushName || '';
          if (sessionInfo.status === 'ready' || sessionInfo.status === 'connected') {
            sessionDetailText = `WhatsApp Conectado (${activePushName || 'Operador'} - ${activePhone || 'Ativo'}). Pronto para disparos.`;
            sessionStatusStr = 'connected';
          } else if (sessionInfo.status === 'initializing') {
            sessionDetailText = `WhatsApp iniciando engine (${sessionInfo.name}). Aguarde sincronização.`;
            sessionStatusStr = 'connected';
          } else {
            sessionDetailText = `Sessão WhatsApp: ${sessionInfo.status} (${sessionInfo.name}).`;
            sessionStatusStr = 'disconnected';
          }
        }
      } catch {
        // Ignored
      }
    }

    const openwaReport: ServiceStatusReport = {
      id: 'openwa',
      name: 'OpenWA WhatsApp Gateway',
      port: 2785,
      endpoint: 'http://localhost:2785',
      lastCheckedAt: now,
      mode: openwaPortActive ? 'real' : 'mock',
      status: openwaPortActive
        ? (sessionStatusStr as any)
        : 'disconnected',
      summary: openwaPortActive
        ? sessionDetailText
        : (hasSavedSession
            ? `Gateway offline na porta 2785. Sessão pré-existente detectada em disco (${sessionName}).`
            : 'Gateway offline. Operando em modo seguro simulado.'),
      actionRequired: openwaPortActive
        ? undefined
        : 'Para conexões reais, inicie o container com "docker compose up -d" dentro de OpenWA/. Na Fase 0, o simulador local está pronto e seguro.',
      details: {
        hasApiKey,
        hasSavedSession,
        sessionName: sessionName || null,
        phone: activePhone || null,
        pushName: activePushName || null
      }
    };

    // 3. Doop status
    const doopPortActive = await this.checkPort(4400);
    const doopClientActive = await this.checkPort(4300);
    const doopProc = DoopProcessManager.getStatus();

    // Auto-heal: If either Doop port is offline, not currently starting, and past the boot grace period (18s)
    const uptime = doopProc.uptimeSeconds || 0;
    const isBooting = doopProc.status === 'starting' || (doopProc.running && uptime < 18);
    if ((!doopPortActive || !doopClientActive) && !isBooting) {
      DoopProcessManager.start().catch((err) => {
        console.warn('[ServiceRegistry] Erro ao recuperar Doop automaticamente:', err?.message);
      });
    }

    const isRunning = (doopPortActive && doopClientActive) || doopProc.running;

    const doopReport: ServiceStatusReport = {
      id: 'doop',
      name: 'Doop Design & Prototipação',
      port: 4400,
      endpoint: 'http://localhost:4400',
      lastCheckedAt: now,
      mode: (doopPortActive || doopClientActive) ? 'real' : 'mock',
      status: isRunning ? 'available' : 'mock',
      summary: doopProc.running
        ? `Serviço Doop em execução (PID ${doopProc.pid || 'gerenciado'}, Web: 4300, Server: 4400).`
        : (doopPortActive || doopClientActive
            ? 'Serviço Doop ativo na porta local.'
            : 'Servidor Doop pausado. O gerador local integrado de alta fidelidade está ativo.'),
      actionRequired: isRunning
        ? undefined
        : 'Clique em "Iniciar Doop" ou execute "bun run dev" em doop/ para abrir o canvas colaborativo.',
      details: {
        clientPort: 4300,
        clientActive: doopClientActive,
        serverActive: doopPortActive,
        managedProcess: doopProc,
        hasBuiltinEngine: true
      }
    };

    return [scraperReport, openwaReport, doopReport];
  }
}
