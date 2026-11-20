import { test, expect } from '@playwright/test';

test.describe('Navegação e Persistência de Rotas (Browser E2E)', () => {

  test('1. Acesso direto a http://localhost:3333/prospeccao deve abrir aba Prospecção', async ({ page }) => {
    await page.goto('http://localhost:3333/prospeccao');
    await page.waitForLoadState('domcontentloaded');

    // Breadcrumb e título devem indicar Prospecção
    await expect(page.locator('header').locator('text=Prospecção')).toBeVisible();

    // Tabela de comércios ou cabeçalho deve estar visível
    await expect(page.locator('text=Presença Digital').first()).toBeVisible();

    // URL deve permanecer em /prospeccao
    expect(page.url()).toContain('/prospeccao');
  });

  test('2. Atualizar a página (F5/reload) em /prospeccao DEVE permanecer em /prospeccao', async ({ page }) => {
    await page.goto('http://localhost:3333/prospeccao');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('header').locator('text=Prospecção')).toBeVisible();

    // Simula F5 / reload da página
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Deve permanecer na Prospecção e NÃO voltar para a tela inicial
    await expect(page.locator('header').locator('text=Prospecção')).toBeVisible();
    expect(page.url()).toContain('/prospeccao');
  });

  test('3. Acesso direto a http://localhost:3333/conversas deve abrir aba Conversas', async ({ page }) => {
    await page.goto('http://localhost:3333/conversas');
    await page.waitForLoadState('domcontentloaded');

    // Deve exibir painel de conversas
    await expect(page.locator('header').locator('text=Conversas')).toBeVisible();
    await expect(page.locator('text=Conversas Ativas')).toBeVisible();
    expect(page.url()).toContain('/conversas');
  });

  test('4. Atualizar a página em /conversas DEVE permanecer em /conversas', async ({ page }) => {
    await page.goto('http://localhost:3333/conversas');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('header').locator('text=Conversas')).toBeVisible();

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('header').locator('text=Conversas')).toBeVisible();
    expect(page.url()).toContain('/conversas');
  });

  test('5. Clicar no menu lateral altera a URL sem recarregar a página', async ({ page }) => {
    await page.goto('http://localhost:3333/');
    await page.waitForLoadState('domcontentloaded');

    // Clica em Prospecção
    await page.locator('nav a:has-text("Prospecção")').click();
    await expect(page.locator('header').locator('text=Prospecção')).toBeVisible();
    expect(page.url()).toContain('/prospeccao');

    // Clica em Conversas
    await page.locator('nav a:has-text("Conversas")').click();
    await expect(page.locator('header').locator('text=Conversas')).toBeVisible();
    expect(page.url()).toContain('/conversas');

    // Clica em WhatsApp Studio
    await page.locator('nav a:has-text("WhatsApp Studio")').click();
    await expect(page.locator('header').locator('text=WhatsApp Studio')).toBeVisible();
    expect(page.url()).toContain('/whatsapp');

    // Clica em Layouts no Doop
    await page.locator('nav a:has-text("Layouts no Doop")').click();
    await expect(page.locator('header').locator('text=Layouts no Doop')).toBeVisible();
    expect(page.url()).toContain('/layouts');

    // Clica no botão voltar do navegador (popstate)
    await page.goBack();
    await expect(page.locator('header').locator('text=WhatsApp Studio')).toBeVisible();
    expect(page.url()).toContain('/whatsapp');

    await page.goBack();
    await expect(page.locator('header').locator('text=Conversas')).toBeVisible();
    expect(page.url()).toContain('/conversas');
  });

  test('6. Alias /leads é automaticamente normalizado para /prospeccao', async ({ page }) => {
    await page.goto('http://localhost:3333/leads');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('header').locator('text=Prospecção')).toBeVisible();
    expect(page.url()).toContain('/prospeccao');
  });
});

