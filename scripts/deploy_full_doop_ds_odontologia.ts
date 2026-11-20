import { chromium, type Page } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { callMcp } from '../doop_client.js';

const CANVAS_ID = 'ILRtzl0v5F';
const AGENT_NAME = 'Antigravity';
const GAP = 60;
const BUFFER = 6;

const DOOP_MAP = {
  'logo-sorriso.png': 'http://localhost:4300/a/SGZYEjO6GZ.png',
  'logo-escrita.png': 'http://localhost:4300/a/gi4zunQ3v3.png',
  'feed-clinica.jpg': 'http://localhost:4300/a/c3dcqNChVS.jpg',
  'sobre-atendimento.webp': 'http://localhost:4300/a/nrnkIwdNvl.webp',
  'caso-antes-depois.jpg': 'http://localhost:4300/a/RlXAaK_RcT.jpg',
  'caso-sorriso.jpg': 'http://localhost:4300/a/666D4FW1Pp.jpg',
  'caso-implante.jpg': 'http://localhost:4300/a/UJYQDQ4W-4.jpg'
};

function replaceImageUrls(html) {
  let res = html;
  for (const [imgName, doopUrl] of Object.entries(DOOP_MAP)) {
    const escaped = imgName.replace('.', '\\.');
    const regex = new RegExp(`(https?:\\/\\/[^\\/"']+)?(\\.\\/|\\/)?images\\/${escaped}`, 'g');
    res = res.replace(regex, doopUrl);
  }
  return res;
}

function buildFrameHtml(bodyHtml, styles, fontLinks, isMobile = false, isFullPage = false) {
  const cleanBody = replaceImageUrls(bodyHtml);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${isMobile ? '390' : '1280'}, initial-scale=1.0">
  <title>DS Odontologia</title>
  ${fontLinks}
  <style>
    ${styles}
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      overflow-x: hidden;
      width: 100%;
    }
    ${!isFullPage ? `
    header {
      position: relative !important;
      top: auto !important;
    }
    .header-spacer {
      display: none !important;
    }
    ` : `
    header {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 1000 !important;
    }
    .header-spacer {
      height: 102px !important;
      display: block !important;
    }
    `}
    .btn-whatsapp, .btn-secondary, button[type="submit"], a[href*="wa.me"] {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
    }
  </style>
</head>
<body class="${isMobile ? 'mobile-viewport' : 'desktop-viewport'}">
  ${cleanBody}
</body>
</html>`;
}

async function measureHeight(page: Page, html: string, width: number): Promise<number> {
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
  console.log('ðŸš€ Iniciando sincronizaÃ§Ã£o completa das alteraÃ§Ãµes para o Doop no Canvas:', CANVAS_ID);

  // 1. Obter frames existentes no Doop
  const canvasRes = await callMcp('get_canvas', { canvas_id: CANVAS_ID });
  const canvasData = JSON.parse(canvasRes.content[0].text);
  const frameMap = {};
  for (const f of canvasData.frames) {
    frameMap[f.name] = f.id;
  }
  console.log('Frames detectados no canvas:', frameMap);

  const browser = await chromium.launch({ headless: true });

  // 2. ExtraÃ§Ã£o Desktop (1280px)
  console.log('\n--- Extraindo DOM Desktop (1280px) de http://localhost:5173 ---');
  const dPage = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await dPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(500);

  await dPage.evaluate(() => {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
  });

  const { fontLinks, styles } = await dPage.evaluate(() => {
    const fontLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"]'))
      .map(l => l.outerHTML).join('\n  ');
    const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n');
    return { fontLinks, styles };
  });

  const dSections = await dPage.evaluate(() => {
    const header = document.querySelector('header')?.outerHTML || '';
    const hero = document.querySelector('section.hero')?.outerHTML || '';
    const sobre = document.querySelector('#sobre')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#sobre')?.outerHTML || '';
    const procedimentos = document.querySelector('#procedimentos')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#procedimentos')?.outerHTML || '';
    const casos = document.querySelector('#casos')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#casos')?.outerHTML || '';
    const avaliacoes = document.querySelector('#avaliacoes')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#avaliacoes')?.outerHTML || '';
    const faq = document.querySelector('#faq')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#faq')?.outerHTML || '';
    const localizacao = document.querySelector('#localizacao')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#localizacao')?.outerHTML || '';
    const footer = document.querySelector('footer')?.outerHTML || '';
    const fullBody = document.querySelector('.site-wrapper')?.outerHTML || document.body.innerHTML;

    return {
      sec01: header + hero,
      sec02: procedimentos,
      sec03: sobre,
      sec04: casos + avaliacoes,
      sec05: faq + localizacao + footer,
      full: fullBody
    };
  });
  await dPage.close();

  // 3. ExtraÃ§Ã£o Mobile (390px)
  console.log('--- Extraindo DOM Mobile (390px) de http://localhost:5173 ---');
  const mPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(500);

  await mPage.evaluate(() => {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
  });

  const mSections = await mPage.evaluate(() => {
    const header = document.querySelector('header')?.outerHTML || '';
    const hero = document.querySelector('section.hero')?.outerHTML || '';
    const sobre = document.querySelector('#sobre')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#sobre')?.outerHTML || '';
    const procedimentos = document.querySelector('#procedimentos')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#procedimentos')?.outerHTML || '';
    const casos = document.querySelector('#casos')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#casos')?.outerHTML || '';
    const avaliacoes = document.querySelector('#avaliacoes')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#avaliacoes')?.outerHTML || '';
    const faq = document.querySelector('#faq')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#faq')?.outerHTML || '';
    const localizacao = document.querySelector('#localizacao')?.closest('.reveal-on-scroll')?.outerHTML || document.querySelector('#localizacao')?.outerHTML || '';
    const footer = document.querySelector('footer')?.outerHTML || '';
    const fullBody = document.querySelector('.site-wrapper')?.outerHTML || document.body.innerHTML;

    return {
      sec01: header + hero,
      sec02: procedimentos,
      sec03: sobre,
      sec04: casos + avaliacoes,
      sec05: faq + localizacao + footer,
      full: fullBody
    };
  });
  await mPage.close();

  // 4. MediÃ§Ã£o DinÃ¢mica com Playwright de todas as pranchetas
  console.log('\n--- Medindo Dinamicamente Alturas (Regra Anti-Corte Playwright) ---');
  const measurePage = await browser.newPage();
  const updates = [];

  // ==========================================
  // COLUNA 1: SEÃ‡Ã•ES MODULARES DESKTOP (1280px)
  // ==========================================
  const col1Defs = [
    { name: '01 â€” Header & Hero (Desktop)', body: dSections.sec01 },
    { name: '02 â€” Procedimentos & Especialidades (Desktop)', body: dSections.sec02 },
    { name: '03 â€” Sobre a ClÃ­nica & Infraestrutura (Desktop)', body: dSections.sec03 },
    { name: '04 â€” AvaliaÃ§Ãµes Google 4.1â˜… & Antes e Depois (Desktop)', body: dSections.sec04 },
    { name: '05 â€” LocalizaÃ§Ã£o, Agendamento & Footer (Desktop)', body: dSections.sec05 }
  ];

  let currentY_col1 = 0;
  for (const def of col1Defs) {
    const html = buildFrameHtml(def.body, styles, fontLinks, false, false);
    const height = await measureHeight(measurePage, html, 1280);
    console.log(`ðŸ“ [${def.name}] Medido: ${height}px em y=${currentY_col1}`);
    updates.push({
      id: frameMap[def.name],
      name: def.name,
      html,
      x: 0,
      y: currentY_col1,
      width: 1280,
      height
    });
    currentY_col1 += height + GAP;
  }

  // ==========================================
  // COLUNA 2: DESKTOP COMPLETO (1280px)
  // ==========================================
  const dFullHtml = buildFrameHtml(dSections.full, styles, fontLinks, false, true);
  const dFullHeight = await measureHeight(measurePage, dFullHtml, 1280);
  console.log(`ðŸ“ [Desktop Completo â€” PÃ¡gina Integrada] Medido: ${dFullHeight}px em y=0`);
  updates.push({
    id: frameMap['Desktop Completo â€” PÃ¡gina Integrada'],
    name: 'Desktop Completo â€” PÃ¡gina Integrada',
    html: dFullHtml,
    x: 1360,
    y: 0,
    width: 1280,
    height: dFullHeight
  });

  // ==========================================
  // COLUNA 3: SEÃ‡Ã•ES MODULARES MOBILE (390px)
  // ==========================================
  const col3Defs = [
    { name: 'M01 â€” Header & Hero (Mobile)', body: mSections.sec01 },
    { name: 'M02 â€” ServiÃ§os & Especialidades (Mobile)', body: mSections.sec02 },
    { name: 'M03 â€” Sobre a ClÃ­nica (Mobile)', body: mSections.sec03 },
    { name: 'M04 â€” AvaliaÃ§Ãµes & Casos Reais (Mobile)', body: mSections.sec04 },
    { name: 'M05 â€” LocalizaÃ§Ã£o & Footer (Mobile)', body: mSections.sec05 }
  ];

  let currentY_col3 = 0;
  for (const def of col3Defs) {
    const html = buildFrameHtml(def.body, styles, fontLinks, true, false);
    const height = await measureHeight(measurePage, html, 390);
    console.log(`ðŸ“ [${def.name}] Medido: ${height}px em y=${currentY_col3}`);
    updates.push({
      id: frameMap[def.name],
      name: def.name,
      html,
      x: 2720,
      y: currentY_col3,
      width: 390,
      height
    });
    currentY_col3 += height + GAP;
  }

  // ==========================================
  // COLUNA 4: MOBILE COMPLETO (390px)
  // ==========================================
  const mFullHtml = buildFrameHtml(mSections.full, styles, fontLinks, true, true);
  const mFullHeight = await measureHeight(measurePage, mFullHtml, 390);
  console.log(`ðŸ“ [Mobile Completo â€” Com Sticky Bar WhatsApp] Medido: ${mFullHeight}px em y=0`);
  updates.push({
    id: frameMap['Mobile Completo â€” Com Sticky Bar WhatsApp'],
    name: 'Mobile Completo â€” Com Sticky Bar WhatsApp',
    html: mFullHtml,
    x: 3190,
    y: 0,
    width: 390,
    height: mFullHeight
  });

  await measurePage.close();
  await browser.close();

  // 5. Aplicar atualizaÃ§Ãµes no Doop via MCP
  console.log('\nðŸŽ¨ Aplicando todas as alteraÃ§Ãµes no Doop...');
  for (const u of updates) {
    if (!u.id) {
      console.error(`âš ï¸ Prancheta ${u.name} nÃ£o possui ID no canvas!`);
      continue;
    }
    console.log(`Atualizando ${u.name} (id: ${u.id}) -> ${u.width}x${u.height} em (${u.x}, ${u.y})...`);
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

  console.log('\nâœ… Todas as 12 pranchetas foram atualizadas com sucesso no Doop!');
}

main().catch(err => {
  console.error('Erro na execuÃ§Ã£o:', err);
  process.exit(1);
});


