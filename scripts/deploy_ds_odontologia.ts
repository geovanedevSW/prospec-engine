import { chromium, type Page } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { callMcp } from '../doop_client.js';
import { renderFullHtml, getSection01Desktop, getSection02Desktop, getSection03Desktop, getSection04Desktop, getSection05Desktop } from '../src/ds-odontologia/components.js';
import { getDesktopFull } from '../src/ds-odontologia/desktop-full.js';
import { desktopCss } from '../src/ds-odontologia/desktop-css.js';
import { mobileCss } from '../src/ds-odontologia/mobile-css.js';
import { getSection01Mobile, getSection02Mobile, getSection03Mobile, getSection04Mobile, getSection05Mobile, getMobileFull } from '../src/ds-odontologia/mobile-sections.js';

const CANVAS_ID = 'ILRtzl0v5F';
const AGENT_NAME = 'Antigravity';
const GAP = 60;
const BUFFER = 6;

async function measureHeight(page: Page, html: string, width: number): Promise<number> {
  await page.setViewportSize({ width, height: 1000 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = img.onerror = resolve;
        });
      })
    );
  });
  
  // Wait short tick for layout stabilization
  await page.waitForTimeout(300);

  const measured = await page.evaluate(() => {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
  });

  return measured + BUFFER;
}

async function main() {
  console.log('ðŸš€ Iniciando dimensionamento e deploy para o Doop no Canvas:', CANVAS_ID);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const framesToDeploy = [];

  // ==========================================
  // COLUNA 1: SEÃ‡Ã•ES MODULARES DESKTOP (1280px)
  // ==========================================
  console.log('\n--- Medindo Coluna 1: SeÃ§Ãµes Modulares Desktop (1280px) ---');
  const dSections = [
    { name: '01 â€” Header & Hero (Desktop)', body: getSection01Desktop() },
    { name: '02 â€” Procedimentos & Especialidades (Desktop)', body: getSection02Desktop() },
    { name: '03 â€” Sobre a ClÃ­nica & Infraestrutura (Desktop)', body: getSection03Desktop() },
    { name: '04 â€” AvaliaÃ§Ãµes Google 4.9â˜… & Antes e Depois (Desktop)', body: getSection04Desktop() },
    { name: '05 â€” LocalizaÃ§Ã£o, Agendamento & Footer (Desktop)', body: getSection05Desktop() }
  ];

  let currentY_col1 = 0;
  for (const sec of dSections) {
    const html = renderFullHtml(sec.body, desktopCss, false);
    const height = await measureHeight(page, html, 1280);
    console.log(`ðŸ“ [${sec.name}] Medido: ${height}px em y=${currentY_col1}`);
    framesToDeploy.push({
      name: sec.name,
      html,
      x: 0,
      y: currentY_col1,
      width: 1280,
      height,
      column: 1
    });
    currentY_col1 += height + GAP;
  }

  // ==========================================
  // COLUNA 2: DESKTOP COMPLETO (1280px)
  // ==========================================
  console.log('\n--- Medindo Coluna 2: Desktop Completo (1280px) ---');
  const dFullHtml = renderFullHtml(getDesktopFull(), desktopCss, false);
  const dFullHeight = await measureHeight(page, dFullHtml, 1280);
  console.log(`ðŸ“ [Desktop Completo] Medido: ${dFullHeight}px`);
  framesToDeploy.push({
    name: 'Desktop Completo â€” PÃ¡gina Integrada',
    html: dFullHtml,
    x: 1360,
    y: 0,
    width: 1280,
    height: dFullHeight,
    column: 2
  });

  // ==========================================
  // COLUNA 3: SEÃ‡Ã•ES MODULARES MOBILE (390px)
  // ==========================================
  console.log('\n--- Medindo Coluna 3: SeÃ§Ãµes Modulares Mobile (390px) ---');
  const mSections = [
    { name: 'M01 â€” Header & Hero (Mobile)', body: getSection01Mobile() },
    { name: 'M02 â€” ServiÃ§os & Especialidades (Mobile)', body: getSection02Mobile() },
    { name: 'M03 â€” Sobre a ClÃ­nica (Mobile)', body: getSection03Mobile() },
    { name: 'M04 â€” AvaliaÃ§Ãµes & Casos Reais (Mobile)', body: getSection04Mobile() },
    { name: 'M05 â€” LocalizaÃ§Ã£o & Footer (Mobile)', body: getSection05Mobile() }
  ];

  let currentY_col3 = 0;
  for (const sec of mSections) {
    const html = renderFullHtml(sec.body, mobileCss, true);
    const height = await measureHeight(page, html, 390);
    console.log(`ðŸ“ [${sec.name}] Medido: ${height}px em y=${currentY_col3}`);
    framesToDeploy.push({
      name: sec.name,
      html,
      x: 2720,
      y: currentY_col3,
      width: 390,
      height,
      column: 3
    });
    currentY_col3 += height + GAP;
  }

  // ==========================================
  // COLUNA 4: MOBILE COMPLETO (390px)
  // ==========================================
  console.log('\n--- Medindo Coluna 4: Mobile Completo com Sticky Bar (390px) ---');
  const mFullHtml = renderFullHtml(getMobileFull(), mobileCss, true);
  const mFullHeight = await measureHeight(page, mFullHtml, 390);
  console.log(`ðŸ“ [Mobile Completo] Medido: ${mFullHeight}px`);
  framesToDeploy.push({
    name: 'Mobile Completo â€” Com Sticky Bar WhatsApp',
    html: mFullHtml,
    x: 3190,
    y: 0,
    width: 390,
    height: mFullHeight,
    column: 4
  });

  await browser.close();

  // ==========================================
  // CRIANDO AS PRANCHETAS NO DOOP
  // ==========================================
  console.log('\nðŸŽ¨ Registrando pranchetas no Doop...');
  const deployedFrames = [];

  for (const f of framesToDeploy) {
    console.log(`Criando: ${f.name} (${f.width}x${f.height}) em (${f.x}, ${f.y})...`);
    const res = await callMcp('create_frame', {
      canvas_id: CANVAS_ID,
      name: f.name,
      html: f.html,
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      agent_name: AGENT_NAME
    });

    const parsed = JSON.parse(res.content[0].text);
    console.log(`  -> ID: ${parsed.id}`);
    deployedFrames.push({
      ...f,
      id: parsed.id,
      url: parsed.url,
      imageUrl: parsed.image_url
    });
  }

  fs.writeFileSync('ds_deployed_frames.json', JSON.stringify(deployedFrames, null, 2));
  console.log('\nâœ… Todas as 12 pranchetas foram criadas com sucesso no canvas:', CANVAS_ID);
}

main().catch(err => {
  console.error('Erro na execuÃ§Ã£o:', err);
  process.exit(1);
});

