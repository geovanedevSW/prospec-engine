import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DEPLOYMENTS_DIR, VERCEL_TOKEN, VERCEL_TEAM_ID } from '../config.js';
import { Repository } from '../persistence/database.js';
import { Lead } from '../domain/types.js';

export interface VercelDeployResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  readyState?: string;
  exportDir?: string;
  requiresToken?: boolean;
  error?: string;
}

export interface DeployOptions {
  projectName?: string;
  lead?: Partial<Lead>;
  token?: string;
  teamId?: string;
  customDomain?: string;
}

export class VercelDeployer {
  /**
   * Slugifies a business name to create a valid Vercel project name
   */
  static slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'site-local';
  }

  /**
   * Resolves the active Vercel Token from options, database settings, or environment
   */
  static getActiveToken(overrideToken?: string): string {
    if (overrideToken && overrideToken.trim()) return overrideToken.trim();
    const fromDb = Repository.getSetting('vercel_token', '');
    if (fromDb && fromDb.trim()) return fromDb.trim();
    if (VERCEL_TOKEN && VERCEL_TOKEN.trim()) return VERCEL_TOKEN.trim();
    return '';
  }

  /**
   * Resolves the active Vercel Team ID if configured
   */
  static getActiveTeamId(overrideTeamId?: string): string {
    if (overrideTeamId !== undefined) return overrideTeamId.trim();
    const fromDb = Repository.getSetting('vercel_team_id', '');
    if (fromDb && fromDb.trim()) return fromDb.trim();
    if (VERCEL_TEAM_ID && VERCEL_TEAM_ID.trim()) return VERCEL_TEAM_ID.trim();
    return '';
  }

  /**
   * Verifies if a given Vercel Token is valid
   */
  static async verifyToken(token?: string, teamId?: string): Promise<{ valid: boolean; user?: string; error?: string }> {
    const activeToken = this.getActiveToken(token);
    if (!activeToken) {
      return { valid: false, error: 'Nenhum token fornecido ou configurado' };
    }

    try {
      const url = teamId ? `https://api.vercel.com/v2/user?teamId=${encodeURIComponent(teamId)}` : 'https://api.vercel.com/v2/user';
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });

      if (!res.ok) {
        const body = await res.text();
        return { valid: false, error: `Vercel API retornou ${res.status}: ${body}` };
      }

      const data = (await res.json()) as any;
      return {
        valid: true,
        user: data.user?.username || data.user?.name || data.user?.email || 'Usuário Vercel'
      };
    } catch (err: any) {
      return { valid: false, error: `Falha na conexão com Vercel: ${err.message}` };
    }
  }

  /**
   * Transforms raw prototype or Doop canvas HTML into a production-grade, 100% responsive standalone webpage.
   * - Injects viewport meta tag
   * - Injects mobile sticky action bar for WhatsApp conversion
   * - Enforces zero button text breaks (white-space: nowrap)
   * - Adjusts layout grids smoothly between desktop (1280px), tablet (768px), and mobile (390px)
   */
  static prepareResponsiveHtml(rawHtml: string, lead?: Partial<Lead>): string {
    let html = rawHtml;
    const bname = lead?.name || 'Comércio Local';
    const city = lead?.city || 'Região';
    const phone = lead?.phoneNorm || lead?.phoneRaw || '';
    const phoneClean = phone.replace(/\D/g, '');
    const address = lead?.address || `${bname}, ${city}`;
    const mapsQuery = encodeURIComponent(address);
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
    const waLink = phoneClean
      ? `https://wa.me/${phoneClean.startsWith('55') ? phoneClean : '55' + phoneClean}?text=${encodeURIComponent(`Olá! Conheci a ${bname} pelo site e gostaria de um atendimento/agendamento.`)}`
      : '#contato';

    // 1. Viewport Meta
    if (!html.includes('name="viewport"')) {
      html = html.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }

    // 2. Document Title
    if (!html.includes('<title>')) {
      html = html.replace('<head>', `<head>\n  <title>${bname} | ${city}</title>`);
    }

    // 3. Inject Sticky Action Bar for Mobile if not already present
    if (!html.includes('mobile-sticky-bar')) {
      const stickyBarHtml = `
  <!-- STICKY ACTION BAR FOR MOBILE (1-TAP CONVERSION) -->
  <div class="mobile-sticky-bar" style="position:fixed; bottom:0; left:0; right:0; background:#FFF; border-top:1px solid var(--border, #E8E2D9); padding:12px 16px; display:none; gap:10px; z-index:9999; box-shadow:0 -4px 16px rgba(0,0,0,0.06);">
    <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" style="width:48px; height:48px; border-radius:12px; border:1px solid var(--border, #E8E2D9); display:flex; align-items:center; justify-content:center; color:var(--text-muted, #57534E); text-decoration:none; flex-shrink:0;" title="Ver no Google Maps">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    </a>
    <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="flex:1; justify-content:center; height:48px; padding:0 16px; font-size:14px; font-weight:700; border-radius:12px; text-decoration:none; display:flex; align-items:center; gap:8px; white-space:nowrap; flex-shrink:0;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"></path></svg>
      <span>Agendar no WhatsApp</span>
    </a>
  </div>
`;
      html = html.replace('</body>', `${stickyBarHtml}\n</body>`);
    }

    // 4. Inject Production Responsive CSS
    const responsiveStyles = `
  /* --- PRODUCTION RESPONSIVE & CONVERSION CSS --- */
  @media (max-width: 1024px) {
    .container { padding: 0 24px !important; }
    div[style*="grid-template-columns:repeat(4, 1fr)"],
    div[style*="grid-template-columns: repeat(4, 1fr)"] {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 16px !important;
    }
  }

  @media (max-width: 860px) {
    div[style*="grid-template-columns:1.15fr 0.85fr"],
    div[style*="grid-template-columns: 1.15fr 0.85fr"],
    div[style*="grid-template-columns:0.85fr 1.15fr"],
    div[style*="grid-template-columns: 0.85fr 1.15fr"],
    div[style*="grid-template-columns:1fr 1fr"],
    div[style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
      gap: 36px !important;
    }
    div[style*="grid-template-columns:repeat(3, 1fr)"],
    div[style*="grid-template-columns: repeat(3, 1fr)"] {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
  }

  @media (max-width: 640px) {
    .container { padding: 0 16px !important; }
    h1.font-serif { font-size: 32px !important; line-height: 1.2 !important; }
    h2.font-serif { font-size: 26px !important; }
    
    div[style*="grid-template-columns:repeat(4, 1fr)"],
    div[style*="grid-template-columns: repeat(4, 1fr)"] {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }
    
    /* Horizontal touch scroll for Real Results gallery */
    div[style*="grid-template-columns:repeat(3, 1fr)"],
    div[style*="grid-template-columns: repeat(3, 1fr)"] {
      display: flex !important;
      overflow-x: auto !important;
      scroll-snap-type: x mandatory !important;
      gap: 14px !important;
      margin: 0 -16px !important;
      padding: 0 16px 12px 16px !important;
      -webkit-overflow-scrolling: touch !important;
    }
    div[style*="grid-template-columns:repeat(3, 1fr)"] > div,
    div[style*="grid-template-columns: repeat(3, 1fr)"] > div {
      flex: 0 0 270px !important;
      width: 270px !important;
      scroll-snap-align: start !important;
    }
    div[style*="grid-template-columns:repeat(3, 1fr)"]::-webkit-scrollbar,
    div[style*="grid-template-columns: repeat(3, 1fr)"]::-webkit-scrollbar {
      display: none !important;
    }

    /* Refine header on mobile */
    header a.btn-secondary, header a.btn-primary, header a.btn-whatsapp {
      display: none !important;
    }
    header .container {
      padding: 0 16px !important;
    }
    header strong.font-serif {
      font-size: 16px !important;
    }
    header span {
      font-size: 10px !important;
    }

    body {
      padding-bottom: 78px !important;
    }

    .mobile-sticky-bar {
      display: flex !important;
    }
  }

  @media (min-width: 641px) {
    .mobile-sticky-bar {
      display: none !important;
    }
  }

  /* Strict Anti-break Button Rule */
  .btn-whatsapp, .btn-secondary, .btn-primary, a.btn-whatsapp, a.btn-secondary, a.btn-primary, button {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
`;

    if (html.includes('</style>')) {
      html = html.replace('</style>', `${responsiveStyles}\n</style>`);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `<style>${responsiveStyles}</style>\n</head>`);
    }

    return html;
  }

  /**
   * Deploys a pre-built directory (e.g., compiled React/Vite dist folder) directly to Vercel.
   * Uploads all assets, scripts, images and routing configuration via Vercel Files API v2.
   */
  static async deployDirectory(dirPath: string, options: DeployOptions = {}): Promise<VercelDeployResult> {
    const rawName = options.projectName || options.lead?.name || 'site-comercio';
    const slug = this.slugify(rawName);
    const token = this.getActiveToken(options.token);
    const teamId = this.getActiveTeamId(options.teamId);

    if (!fs.existsSync(dirPath)) {
      return {
        success: false,
        error: `Diretório de build não encontrado: ${dirPath}`
      };
    }

    if (!token) {
      return {
        success: false,
        requiresToken: true,
        exportDir: dirPath,
        error: 'Token da Vercel (VERCEL_TOKEN) não configurado. O build React/Vite está pronto na pasta local.'
      };
    }

    try {
      // 1. Gather all files recursively
      const allFiles: Array<{ relativePath: string; absolutePath: string }> = [];
      function walk(current: string) {
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(current, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
          } else if (entry.isFile()) {
            const rel = path.relative(dirPath, fullPath).replace(/\\/g, '/');
            allFiles.push({ relativePath: rel, absolutePath: fullPath });
          }
        }
      }
      walk(dirPath);

      if (allFiles.length === 0) {
        return {
          success: false,
          error: `O diretório ${dirPath} não contém arquivos para deploy.`
        };
      }

      // 2. Upload each file via Vercel Files API (SHA-1 Digest)
      const uploadedFiles: Array<{ file: string; sha: string; size: number }> = [];

      for (const item of allFiles) {
        const buffer = fs.readFileSync(item.absolutePath);
        const sha = crypto.createHash('sha1').update(buffer).digest('hex');
        const size = buffer.byteLength;

        const uploadUrl = teamId
          ? `https://api.vercel.com/v2/files?teamId=${encodeURIComponent(teamId)}`
          : 'https://api.vercel.com/v2/files';

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
            'Content-Length': size.toString(),
            'x-vercel-digest': sha
          },
          body: buffer
        });

        if (!uploadRes.ok && uploadRes.status !== 409) {
          const errText = await uploadRes.text();
          console.warn(`[VercelDeployer] Upload warning for ${item.relativePath}:`, errText);
        }

        uploadedFiles.push({ file: item.relativePath, sha, size });
      }

      // 3. Trigger deployment via Vercel Deployments API v13
      const deployEndpoint = teamId
        ? `https://api.vercel.com/v13/deployments?teamId=${encodeURIComponent(teamId)}`
        : 'https://api.vercel.com/v13/deployments';

      const deployPayload = {
        name: slug,
        files: uploadedFiles,
        projectSettings: {
          framework: null
        },
        target: 'production'
      };

      const deployRes = await fetch(deployEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deployPayload)
      });

      if (!deployRes.ok) {
        const errBody = await deployRes.text();
        throw new Error(`Vercel deployment failed (${deployRes.status}): ${errBody}`);
      }

      const deployData = (await deployRes.json()) as any;
      const deploymentId = deployData.id;
      let rawUrl = deployData.url || (deployData.alias && deployData.alias[0]);
      let readyState = deployData.readyState || deployData.status || 'INITIALIZING';

      // 4. Poll deployment status until READY (up to 12s)
      if (deploymentId && readyState !== 'READY' && readyState !== 'ERROR') {
        const pollEndpoint = teamId
          ? `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${encodeURIComponent(teamId)}`
          : `https://api.vercel.com/v13/deployments/${deploymentId}`;

        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const pollRes = await fetch(pollEndpoint, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (pollRes.ok) {
              const pollData = (await pollRes.json()) as any;
              readyState = pollData.readyState || readyState;
              if (pollData.url) rawUrl = pollData.url;
              if (readyState === 'READY' || readyState === 'ERROR') break;
            }
          } catch {
            // Ignore polling network hiccup
          }
        }
      }

      const finalUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

      return {
        success: true,
        url: finalUrl,
        deploymentId,
        readyState,
        exportDir: dirPath
      };
    } catch (err: any) {
      console.error('[VercelDeployer] Erro ao subir diretório na Vercel:', err);
      return {
        success: false,
        exportDir: dirPath,
        error: err.message
      };
    }
  }

  /**
   * Deploys a website directly to Vercel via REST API, returning the live deployed URL.
   * If a pre-built React/Vite dist folder exists for this slug, it deploys that directory.
   * Otherwise, it prepares a standalone responsive HTML and deploys it.
   */
  static async deploy(htmlContent: string, options: DeployOptions = {}): Promise<VercelDeployResult> {
    const rawName = options.projectName || options.lead?.name || 'site-comercio';
    const slug = this.slugify(rawName);

    // If an existing compiled dist/ exists in prospec-app/deployments/<slug>/dist, use deployDirectory!
    const compiledDist = path.resolve(DEPLOYMENTS_DIR, slug, 'dist');
    if (fs.existsSync(compiledDist) && fs.existsSync(path.join(compiledDist, 'index.html'))) {
      return this.deployDirectory(compiledDist, options);
    }

    const token = this.getActiveToken(options.token);
    const teamId = this.getActiveTeamId(options.teamId);

    // 1. Prepare production responsive HTML
    const preparedHtml = this.prepareResponsiveHtml(htmlContent, options.lead);

    // 2. Prepare export folder and local build files
    const exportDir = path.resolve(DEPLOYMENTS_DIR, slug);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const htmlPath = path.join(exportDir, 'index.html');
    fs.writeFileSync(htmlPath, preparedHtml, 'utf8');

    const vercelConfig = {
      cleanUrls: true,
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' }
          ]
        }
      ]
    };
    const configPath = path.join(exportDir, 'vercel.json');
    fs.writeFileSync(configPath, JSON.stringify(vercelConfig, null, 2), 'utf8');

    // 3. If no Vercel token, return clean offline export result with guidance
    if (!token) {
      return {
        success: false,
        requiresToken: true,
        exportDir,
        error: 'Token da Vercel (VERCEL_TOKEN) não configurado. O código foi exportado com sucesso na pasta local.'
      };
    }

    try {
      // 4. File uploads via Vercel Files API (SHA-1 Digest)
      const filesToDeploy = [
        { file: 'index.html', buffer: Buffer.from(preparedHtml, 'utf8') },
        { file: 'vercel.json', buffer: Buffer.from(JSON.stringify(vercelConfig), 'utf8') }
      ];

      const uploadedFiles: Array<{ file: string; sha: string; size: number }> = [];

      for (const item of filesToDeploy) {
        const sha = crypto.createHash('sha1').update(item.buffer).digest('hex');
        const size = item.buffer.byteLength;

        const uploadUrl = teamId
          ? `https://api.vercel.com/v2/files?teamId=${encodeURIComponent(teamId)}`
          : 'https://api.vercel.com/v2/files';

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
            'Content-Length': size.toString(),
            'x-vercel-digest': sha
          },
          body: item.buffer
        });

        // 200 OK or 409 (file already uploaded with identical sha) are both valid
        if (!uploadRes.ok && uploadRes.status !== 409) {
          const errText = await uploadRes.text();
          console.warn(`[VercelDeployer] Upload warning for ${item.file}:`, errText);
        }

        uploadedFiles.push({ file: item.file, sha, size });
      }

      // 5. Trigger deployment via Vercel Deployments API v13
      const deployEndpoint = teamId
        ? `https://api.vercel.com/v13/deployments?teamId=${encodeURIComponent(teamId)}`
        : 'https://api.vercel.com/v13/deployments';

      const deployPayload = {
        name: slug,
        files: uploadedFiles,
        projectSettings: {
          framework: null
        },
        target: 'production'
      };

      const deployRes = await fetch(deployEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deployPayload)
      });

      if (!deployRes.ok) {
        const errBody = await deployRes.text();
        throw new Error(`Vercel deployment failed (${deployRes.status}): ${errBody}`);
      }

      const deployData = (await deployRes.json()) as any;
      const deploymentId = deployData.id;
      let rawUrl = deployData.url || (deployData.alias && deployData.alias[0]);
      let readyState = deployData.readyState || deployData.status || 'INITIALIZING';

      // 6. Poll deployment status until READY (up to 12s)
      if (deploymentId && readyState !== 'READY' && readyState !== 'ERROR') {
        const pollEndpoint = teamId
          ? `https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${encodeURIComponent(teamId)}`
          : `https://api.vercel.com/v13/deployments/${deploymentId}`;

        for (let i = 0; i < 6; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const pollRes = await fetch(pollEndpoint, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (pollRes.ok) {
              const pollData = (await pollRes.json()) as any;
              readyState = pollData.readyState || readyState;
              if (pollData.url) rawUrl = pollData.url;
              if (readyState === 'READY' || readyState === 'ERROR') break;
            }
          } catch {
            // Ignore polling network hiccup
          }
        }
      }

      const finalUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

      return {
        success: true,
        url: finalUrl,
        deploymentId,
        readyState,
        exportDir
      };
    } catch (err: any) {
      console.error('[VercelDeployer] Erro ao subir na Vercel:', err);
      return {
        success: false,
        exportDir,
        error: err.message
      };
    }
  }
}

