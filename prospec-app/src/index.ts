import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './app/routes.js';
import { Repository } from './persistence/database.js';
import { ScraperKitAdapter } from './integrations/discoveryAdapter.js';
import { DoopProcessManager } from './services/doopProcessManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();
const PORT = parseInt(process.env.PORT || '3333', 10);

app.use(cors());
app.use(compression({ threshold: 1024, level: 6 }));
app.use(express.json({ limit: '10mb' }));

// API Endpoints
app.use('/api', apiRouter);

// Serve Client SPA with optimal HTTP caching
const clientDist = path.resolve(__dirname, '..', 'dist', 'client');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // index.html must revalidate to pick up latest asset hashes
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        // Hashed JS, CSS, fonts and images are immutable
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Prospec</title></head>
      <body style="background:#0f172a;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
        <h1>Prospec — Central de Aquisição & Venda de Sites</h1>
        <p>A API está ativa na porta ${PORT}. Execute "npm run build:client" para compilar o painel frontend.</p>
        <p><a href="/api/status" style="color:#38bdf8;">Ver /api/status</a> | <a href="/api/leads" style="color:#38bdf8;">Ver /api/leads</a></p>
      </body>
      </html>
    `);
  });
}

// Initial Auto-Seed: If database has 0 leads, load from scraper-kit out CSV
export async function autoSeedIfEmpty() {
  try {
    const stats = Repository.getStats();
    if (stats.totalLeads === 0) {
      console.log('[Central] Banco vazio detectado. Importando leads reais do Google Maps Scraper Kit...');
      const scraper = new ScraperKitAdapter();
      const result = await scraper.discover({ limit: 120 });
      for (const lead of result.leads) {
        Repository.upsertLead({
          name: lead.name,
          source: lead.source,
          category: lead.category,
          address: lead.address,
          city: lead.city,
          phoneRaw: lead.phoneRaw,
          phoneNorm: lead.phoneNorm,
          website: lead.website,
          websiteType: lead.websiteType,
          siteStatus: lead.siteStatus,
          pitchType: lead.pitchType,
          siteAuditReason: lead.siteAuditReason,
          rating: lead.rating,
          reviewsCount: lead.reviewsCount,
          priority: lead.pitchType === 'no_site' || lead.pitchType === 'offline_site' ? 'alta' : 'media'
        });
      }
      console.log(`[Central] ${result.leads.length} leads importados com sucesso na inicialização.`);
    }
  } catch (err: any) {
    console.warn('[Central] Não foi possível auto-popular leads:', err.message);
  }
}

// Global safety guards against unhandled network drops
process.on('uncaughtException', (err) => {
  console.error('[Central UncaughtException]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Central UnhandledRejection]:', reason);
});

// Start server if run directly
const isMain = process.argv[1] && (
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js')
);

if (isMain) {
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`=======================================================`);
    console.log(`  Prospec — Central Ativa e Pronta!`);
    console.log(`  Endereço de Acesso: http://localhost:${PORT}`);
    console.log(`  Status API:         http://localhost:${PORT}/api/status`);
    console.log(`  Banco SQLite:       prospec-app/data/operacao.sqlite`);
    console.log(`=======================================================`);

    await autoSeedIfEmpty();

    // Start Doop dev server automatically on Central startup
    console.log(`[Central] Disparando "bun run dev" do Doop automaticamente...`);
    const doopRes = await DoopProcessManager.start();
    console.log(`[Central] Doop: ${doopRes.message}`);
  });

  server.on('error', (err: any) => {
    console.error('[Central Server Error]:', err);
  });

  // Graceful shutdown
  const shutdown = async (sig?: string) => {
    console.log(`\n[Central] Sinal ${sig} recebido. Encerrando central e processos gerenciados...`);
    await DoopProcessManager.stop();
    server.close(() => {
      console.log('[Central] Finalizado.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default app;
