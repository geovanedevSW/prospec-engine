import { chromium, type Browser, type Page } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const SCREENSHOT_DIR = path.resolve('./screenshots-test');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run(): Promise<void> {
  const browser: Browser = await chromium.launch({ headless: true });

  // 1. Mobile Test (390px)
  console.log('--- 1. Testing Mobile Viewport (390px) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const mobilePage: Page = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3333', { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.waitForTimeout(800);

  // Take screenshot of overview
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-01-overview.png') });
  console.log('Saved mobile-01-overview.png');

  // Open drawer via menu button
  const menuBtn = mobilePage.locator('button[aria-label="Abrir menu"]');
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await mobilePage.waitForTimeout(400);
    // Click "Prospecção & Contatos" in drawer
    await mobilePage.locator('nav button:has-text("Prospecção & Contatos")').click();
    await mobilePage.waitForTimeout(1000);
  }

  // Screenshot mobile leads list
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-02-leads.png') });
  console.log('Saved mobile-02-leads.png');

  // Click Beleza chip
  const belezaChip = mobilePage.locator('button:has-text("Beleza & Estética")').first();
  if (await belezaChip.isVisible()) {
    await belezaChip.click();
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-03-leads-beleza-filter.png') });
    console.log('Saved mobile-03-leads-beleza-filter.png');
  }

  // Check horizontal overflow
  const bodyScrollWidth = await mobilePage.evaluate(() => document.body.scrollWidth);
  const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile width check: clientWidth=${clientWidth}, bodyScrollWidth=${bodyScrollWidth}`);

  // Test WhatsApp tab on mobile
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await mobilePage.waitForTimeout(400);
    await mobilePage.locator('nav button:has-text("WhatsApp")').click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-04-whatsapp.png') });
    console.log('Saved mobile-04-whatsapp.png');
  }

  // 2. Desktop Test (1280px)
  console.log('--- 2. Testing Desktop Viewport (1280px) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1
  });
  const desktopPage: Page = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3333', { waitUntil: 'networkidle', timeout: 15000 });
  await desktopPage.waitForTimeout(800);

  // Navigate to leads
  await desktopPage.locator('nav button:has-text("Prospecção & Contatos")').click();
  await desktopPage.waitForTimeout(1000);

  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-01-leads.png') });
  console.log('Saved desktop-01-leads.png');

  // Click Saúde chip
  const saudeChip = desktopPage.locator('button:has-text("Saúde & Odonto")').first();
  if (await saudeChip.isVisible()) {
    await saudeChip.click();
    await desktopPage.waitForTimeout(800);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-02-leads-saude-filter.png') });
    console.log('Saved desktop-02-leads-saude-filter.png');
  }

  // Go to WhatsApp Tab
  await desktopPage.locator('nav button:has-text("WhatsApp")').click();
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop-03-whatsapp.png') });
  console.log('Saved desktop-03-whatsapp.png');

  await browser.close();
  console.log('--- All UI verification completed successfully! ---');
}

run().catch(console.error);
