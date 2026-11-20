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
  // Start with tiny height so viewport does not artificially inflate scrollHeight
  await page.setViewportSize({ width, height: 100 });
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
  console.log('ðŸ”„ Re-medindo precisamente com viewport height=100 e atualizando frames...');

  // Obter frames existentes no Doop para pegar seus IDs
  const canvasRes = await callMcp('get_canvas', { canvas_id: CANVAS_ID });
  const canvasData = JSON.parse(canvasRes.content[0].text);
  const frameMap = {};
  for (const f of canvasData.frames) {
    frameMap[f.name] = f.id;
  }
  console.log('Frames existentes no canvas:', frameMap);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const updates = [];

  // 1. Coluna 1 â€” SeÃ§Ãµes Modulares Desktop (1280px)
  const dSections = [
    { name: '01 â€” Header & Hero (Desktop)', body: getSection01Desktop() },
    { name: '02 â€” Procedimentos & Especialidades (Desktop)', body: getSection02Desktop() },
    { name: '03 â€” Sobre a ClÃ­nica & Infraestrutura (Desktop)', body: getSection03Desktop() },
    { name: '04 â€” AvaliaÃ§Ãµes Google 4.1â˜… & Antes e Depois (Desktop)', body: getSection04Desktop() },
    { name: '05 â€” LocalizaÃ§Ã£o, Agendamento & Footer (Desktop)', body: getSection05Desktop() }
  ];

  let currentY_col1 = 0;
  for (const sec of dSections) {
    const html = renderFullHtml(sec.body, desktopCss, false);
    const height = await measureHeight(page, html, 1280);
    console.log(`ðŸ“ [${sec.name}] Altura Exata: ${height}px em y=${currentY_col1}`);
    updates.push({
      id: frameMap[sec.name],
      name: sec.name,
      html,
      x: 0,
      y: currentY_col1,
      width: 1280,
      height
    });
    currentY_col1 += height + GAP;
  }

  // 2. Coluna 2 â€” Desktop Completo (1280px)
  const dFullHtml = renderFullHtml(getDesktopFull(), desktopCss, false);
  const dFullHeight = await measureHeight(page, dFullHtml, 1280);
  console.log(`ðŸ“ [Desktop Completo] Altura Exata: ${dFullHeight}px em y=0`);
  updates.push({
    id: frameMap['Desktop Completo â€” PÃ¡gina Integrada'],
    name: 'Desktop Completo â€” PÃ¡gina Integrada',
    html: dFullHtml,
    x: 1360,
    y: 0,
    width: 1280,
    height: dFullHeight
  });

  // 3. Coluna 3 â€” SeÃ§Ãµes Modulares Mobile (390px)
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
    console.log(`ðŸ“ [${sec.name}] Altura Exata: ${height}px em y=${currentY_col3}`);
    updates.push({
      id: frameMap[sec.name],
      name: sec.name,
      html,
      x: 2720,
      y: currentY_col3,
      width: 390,
      height
    });
    currentY_col3 += height + GAP;
  }

  // 4. Coluna 4 â€” Mobile Completo (390px)
  const mFullHtml = renderFullHtml(getMobileFull(), mobileCss, true);
  const mFullHeight = await measureHeight(page, mFullHtml, 390);
  console.log(`ðŸ“ [Mobile Completo] Altura Exata: ${mFullHeight}px em y=0`);
  updates.push({
    id: frameMap['Mobile Completo â€” Com Sticky Bar WhatsApp'],
    name: 'Mobile Completo â€” Com Sticky Bar WhatsApp',
    html: mFullHtml,
    x: 3190,
    y: 0,
    width: 390,
    height: mFullHeight
  });

  await browser.close();

  // Executar atualizaÃ§Ãµes no Doop
  console.log('\nðŸš€ Atualizando dimensÃµes e HTML no Doop...');
  for (const u of updates) {
    if (!u.id) {
      console.error(`Frame ${u.name} nÃ£o tem ID correspondente!`);
      continue;
    }
    console.log(`Atualizando ${u.name} (id: ${u.id}) -> ${u.width}x${u.height} em (${u.x}, ${u.y})`);
    await callMcp('update_frame', {
      frame_id: u.id,
      name: u.name,
      x: u.x,
      y: u.y,
      width: u.width,
      height: u.height,
      agent_name: AGENT_NAME
    });

    await callMcp('set_frame_html', {
      frame_id: u.id,
      html: u.html,
      agent_name: AGENT_NAME
    });
  }

  console.log('\nðŸŽ‰ Todos os 12 frames atualizados com dimensÃµes milimÃ©tricas perfeitas!');
}

main().catch(console.error);


