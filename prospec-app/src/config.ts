import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// prospec-app root directory (where package.json is)
export const PROSPEC_APP_ROOT = path.resolve(__dirname, '..');
export const PROSPEC_ROOT = PROSPEC_APP_ROOT;
export const OPERACAO_ROOT = PROSPEC_APP_ROOT;

// Load .env if present in prospec-app
const envPath = path.resolve(PROSPEC_APP_ROOT, '.env');
if (fs.existsSync(envPath)) {
  try {
    if (typeof (process as any).loadEnvFile === 'function') {
      (process as any).loadEnvFile(envPath);
    } else {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  } catch (e: any) {
    console.warn('[Config] Aviso ao carregar .env:', e.message);
  }
}

// Parent money workspace root directory (where sibling repos are)
export const MONEY_ROOT = path.resolve(OPERACAO_ROOT, '..');

export const DATA_DIR = process.env.OPERACAO_DATA_DIR || path.resolve(OPERACAO_ROOT, 'data');
export const DB_PATH = path.resolve(DATA_DIR, 'operacao.sqlite');

export const SCRAPER_DIR = process.env.SCRAPER_DIR || path.resolve(MONEY_ROOT, 'google-maps-scraper-kit');
export const OPENWA_DIR = process.env.OPENWA_DIR || path.resolve(MONEY_ROOT, 'OpenWA');
export const DOOP_DIR = process.env.DOOP_DIR || path.resolve(MONEY_ROOT, 'doop');

// Vercel Deployment Configurations
export const DEPLOYMENTS_DIR = process.env.DEPLOYMENTS_DIR || path.resolve(OPERACAO_ROOT, 'deployments');
export const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
export const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';

