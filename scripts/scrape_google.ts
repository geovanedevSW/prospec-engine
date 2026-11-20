import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

async function checkGoogle(): Promise<void> {
  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-BR'
  });
  const page: Page = await context.newPage();
  const url = 'https://www.google.com/search?sca_esv=66da6a07b5b0afbb&biw=1745&bih=835&sxsrf=AKL5yDhToktXEkgu614aXLbwAhrNlN3dnQ:1793892176813&q=ds+odontologia+endere%C3%A7o&ludocid=5076174533163314977&sa=X&ved=2ahUKEwjo8dqPkfGXAxVPr5UCHfzHAm0Q6BN6BAg7EAI';
  
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const bodyText: string = await page.evaluate(() => document.body.innerText);
  console.log('--- BUSCANDO AVALIAÇÕES NO GOOGLE MAPS / KNOWLEDGE PANEL ---');
  const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);
  const relevant = lines.filter(l => /avalia|nota|estrela|4\.|3\.|comentário|opinião/i.test(l));
  console.log('Linhas relevantes:', relevant.slice(0, 30));

  await browser.close();
}

checkGoogle().catch(console.error);
