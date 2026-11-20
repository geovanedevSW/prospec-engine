import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  timeout: 30000,
  use: {
    headless: true,
    channel: 'chrome',
  },
  webServer: {
    command: 'npx tsx src/index.ts',
    url: 'http://localhost:3333/api/status',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
