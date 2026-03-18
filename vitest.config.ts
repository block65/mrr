import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['./__tests__/**/*.test.tsx'],
    typecheck: {
      include: ['./__tests__/**/*.test-d.ts'],
    },
  },
});
