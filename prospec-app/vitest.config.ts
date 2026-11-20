import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    deps: {
      interopDefault: true,
      moduleDirectories: ['node_modules'],
    },
    server: {
      deps: {
        external: [/node:sqlite/],
      },
    },
  },
});
