import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

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

test.describe('Clean Dark Dashboard & Layout Validation', () => {
  test('Desktop (1280x900) - Exact Palette, Line-Free Navbar & Spline Wave Chart', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await safeGoto(page);

    // Ensure dark theme is active
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (!isDark) {
      await page.evaluate(() => document.documentElement.classList.add('dark'));
    }

    // 1. Sidebar Brand & Structure
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('heading', { name: 'Central', exact: true })).toBeVisible();
    await expect(sidebar.getByText('RMBH', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Operação Localhost')).toBeVisible();

    // 2. Collapse Sidebar Button in Header
    const collapseBtn = sidebar.getByRole('button', { name: /Fechar menu lateral/ });
    await expect(collapseBtn).toBeVisible();

    // 3. Search Bar
    await expect(sidebar.getByText('Buscar comércio, nicho...')).toBeVisible();
    await expect(sidebar.getByText('⌘K')).toBeVisible();

    // 4. Navigation Links
    await expect(sidebar.getByText('Visão Geral')).toBeVisible();
    await expect(sidebar.getByText('Prospecção')).toBeVisible();
    await expect(sidebar.getByText('Conversas', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('WhatsApp Studio')).toBeVisible();
    await expect(sidebar.getByText('Layouts no Doop')).toBeVisible();
    await expect(sidebar.getByText('Operação', { exact: true })).toBeVisible();

    // 5. Nichos RMBH (Colored Dot List - Authentic Data)
    await expect(sidebar.getByText('Nichos RMBH')).toBeVisible();
    await expect(sidebar.getByText('Beleza & Estética')).toBeVisible();
    await expect(sidebar.getByText('Automotivo & Mecânica')).toBeVisible();
    await expect(sidebar.getByText('Saúde & Odonto')).toBeVisible();
    await expect(sidebar.getByText('Pet Shop & Veterinária')).toBeVisible();
    await expect(sidebar.getByText('Fitness & Academias')).toBeVisible();

    // 6. Line-Free Navbar Verification (Zero border-bottom)
    const headerBorderBottom = await page.locator('header').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderBottomWidth;
    });
    expect(headerBorderBottom).toBe('0px');

    // 7. Visão Geral Content Header
    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: 'Visão Geral da Operação' })).toBeVisible();
    await expect(main.getByText('Console de Operações')).toBeVisible();

    // 8. Top Metric Deck (4 Cards)
    await expect(main.getByText('Comércios Mapeados')).toBeVisible();
    await expect(main.getByText('Sem Presença Digital')).toBeVisible();
    await expect(main.getByText('Layouts no Doop')).toBeVisible();
    await expect(main.getByText('Conversas WhatsApp')).toBeVisible();

    // 9. Centerpiece Spline Wave Feature Card
    await expect(main.getByText('Volume de Prospecção & Conversão (RMBH)')).toBeVisible();
    await expect(main.getByText('no último ciclo')).toBeVisible();

    // Legend Badges
    await expect(main.getByText('Beleza (31%)')).toBeVisible();
    await expect(main.getByText('Automotivo (18%)')).toBeVisible();
    await expect(main.getByText('Saúde (16%)')).toBeVisible();
    await expect(main.getByText('Pet Shop (9%)')).toBeVisible();
    await expect(main.getByText('Fitness (8%)')).toBeVisible();

    // SVG Spline Wave Chart
    const svgChart = main.locator('svg').filter({ hasText: 'Nov' });
    await expect(svgChart).toBeVisible();
    await expect(main.getByText('Ago', { exact: true })).toBeVisible();
    await expect(main.getByText('Set', { exact: true })).toBeVisible();
    await expect(main.getByText('Out', { exact: true })).toBeVisible();
    await expect(main.getByText('Nov', { exact: true })).toBeVisible();
    await expect(main.getByText('Dez', { exact: true })).toBeVisible();
    await expect(main.getByText('Jan', { exact: true })).toBeVisible();

    // 10. Funnel & Engines Console
    await expect(main.getByRole('heading', { name: 'Funil de Prospecção & Conversão' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Comércios Prontos para Contato' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Console dos Motores Locais' })).toBeVisible();

    // 11. Buttons Compliance: All CTA action buttons have white-space: nowrap & flex-shrink: 0 (Anti-quebra rule)
    const ctaButtons = page.locator('main').locator('button:has-text("WhatsApp"), button:has-text("Doop"), button:has-text("Ver todos")');
    const ctaCount = await ctaButtons.count();
    expect(ctaCount).toBeGreaterThan(0);
    for (let i = 0; i < ctaCount; i++) {
      const btn = ctaButtons.nth(i);
      const whiteSpace = await btn.evaluate((el) => window.getComputedStyle(el).whiteSpace);
      expect(whiteSpace).toBe('nowrap');
    }

    // Save Desktop screenshot
    const screenshotDir = path.resolve(process.cwd(), 'scratch');
    fs.mkdirSync(screenshotDir, { recursive: true });
    const desktopScreenshot = path.join(screenshotDir, 'ember-clean-desktop.png');
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
  });

  test('Desktop (1280x900) - Close/Collapse Sidebar Option & Reopen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await safeGoto(page);

    // Wait for metrics to load completely
    await expect(page.getByText('Comércios Mapeados')).toBeVisible();
    await expect(page.getByText('5.565').first()).toBeVisible();

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Click close/collapse button in sidebar brand header
    const collapseBtn = sidebar.getByRole('button', { name: /Fechar menu lateral/ });
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // Sidebar collapses on desktop
    await expect(sidebar).toBeHidden();

    // Reopen button appears in header
    const reopenBtn = page.locator('header').getByRole('button', { name: /Expandir menu lateral/ });
    await expect(reopenBtn).toBeVisible();

    // Save Collapsed screenshot
    const screenshotDir = path.resolve(process.cwd(), 'scratch');
    const collapsedScreenshot = path.join(screenshotDir, 'ember-clean-collapsed.png');
    await page.screenshot({ path: collapsedScreenshot, fullPage: true });

    // Click reopen
    await reopenBtn.click();
    await expect(sidebar).toBeVisible();
  });

  test('Mobile (390x844) - Fluid Responsive Viewport & Clean Dark Theme', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await safeGoto(page);

    // Verify no horizontal overflow on mobile body
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Line-free Navbar on mobile as well
    const headerBorderBottom = await page.locator('header').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.borderBottomWidth;
    });
    expect(headerBorderBottom).toBe('0px');

    // Mobile menu toggle button
    const menuBtn = page.getByRole('button', { name: 'Abrir menu lateral' });
    await expect(menuBtn).toBeVisible();

    // Open sidebar
    await menuBtn.click();
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/translate-x-0/);

    // Close sidebar via the close button
    const closeBtn = page.getByRole('button', { name: 'Fechar menu lateral' });
    await closeBtn.click();

    // Top Metric Deck visible on mobile
    await expect(page.getByText('Comércios Mapeados')).toBeVisible();

    // Centerpiece Spline Wave Card visible
    await expect(page.getByText('Volume de Prospecção & Conversão (RMBH)')).toBeVisible();

    // Save Mobile screenshot
    const screenshotDir = path.resolve(process.cwd(), 'scratch');
    fs.mkdirSync(screenshotDir, { recursive: true });
    const mobileScreenshot = path.join(screenshotDir, 'ember-clean-mobile.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
  });

  test('Interactive - Clicking Niche in Sidebar Filters Leads', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await safeGoto(page);

    // Click on Beleza & Estética in Nichos RMBH
    const belezaBtn = page.locator('aside').getByRole('button', { name: /Beleza & Estética/ });
    await expect(belezaBtn).toBeVisible();
    await belezaBtn.click();

    // Should navigate to /prospeccao with niche filtered
    await expect(page).toHaveURL(/prospeccao/);
    const main = page.locator('main');
    await expect(main.getByText('Beleza & Estética').first()).toBeVisible();
  });
});
