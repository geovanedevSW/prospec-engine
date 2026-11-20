import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function safeGoto(page: any, url: string = 'http://localhost:3333/') {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await page.waitForTimeout(1000);
    }
  }
}

test.describe('Validação Visual Fase 0: Central Local', () => {

  test('1. Visão Geral (Desktop) - Status dos 3 módulos e métricas', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await safeGoto(page);

    // Wait for services to appear
    await expect(page.locator('aside').getByRole('heading', { name: 'Central' })).toBeVisible();
    await expect(page.locator('text=Operação Localhost').first()).toBeVisible();
    await expect(page.locator('text=Scraper Kit').first()).toBeVisible();
    await expect(page.locator('text=OpenWA').first()).toBeVisible();
    await expect(page.locator('text=Doop').first()).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-visao-geral-desktop.png') });
  });

  test('2. Prospecção & Contatos - Tabela de Leads com Presença Digital', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await safeGoto(page);

    // Click on "Prospecção" tab
    await page.click('aside a[href*="/prospeccao"], aside a:has-text("Prospecção")');
    await page.waitForTimeout(500);

    await expect(page.locator('th:has-text("Comércio")')).toBeVisible();
    await expect(page.locator('th:has-text("Presença Digital")')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-prospeccao-contatos.png') });
  });

  test('3. Fluxo Integrado WhatsApp - Preenchimento automático e aprovação', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await safeGoto(page);

    // On Overview, click WhatsApp action on first recent lead
    const waBtn = page.locator('button:has-text("WhatsApp")').first();
    await waBtn.click();
    await page.waitForTimeout(500);

    // Verify WhatsApp tab opened and phone/message pre-filled
    await expect(page.locator('text=Preparação de Abordagem Comercial')).toBeVisible();
    const phoneInput = page.locator('input[placeholder*="Ex: 55"]');
    await expect(phoneInput).not.toHaveValue('');

    // Approve message
    const approveBtn = page.locator('button:has-text("Aprovar Conteúdo")');
    await approveBtn.click();
    await expect(page.locator('text=Mensagem Aprovada')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-whatsapp-aprovado.png') });
  });

  test('4. Protótipos Doop - Geração e Visualizador Responsivo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await safeGoto(page);

    // Go to Prototypes tab
    await page.click('aside a[href*="/doop"], aside a:has-text("Layouts no Doop"), aside a[href*="/layouts"]');
    await page.waitForTimeout(500);

    // Verify interactive previewer iframe rendered
    await expect(page.locator('iframe').first()).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-prototipo-gerado-desktop.png') });

    // Switch to Mobile Viewport in previewer
    await page.click('button[aria-label="Viewport Mobile"], button[title*="Mobile"]');
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-prototipo-gerado-mobile-preview.png') });

    // Switch to Custom Canvas Doop Studio subtab to verify briefing
    await page.click('button:has-text("Canvas Doop Studio")');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Briefing do Layout Único')).toBeVisible();
  });

  test('5. Visão Geral (Mobile 375px) - Responsividade da Central', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page);

    await expect(page.locator('text=Operação Localhost').first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-central-mobile.png') });
  });
});

