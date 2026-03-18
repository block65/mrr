import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    target: 'es2022',
    lib: {
      entry: {
        main: join(__dirname, 'src/index.ts'),
        'named-route': join(__dirname, 'src/named-route.ts'),
        animate: join(__dirname, 'src/animate.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
    },
    minify: true,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    include: ['./__tests__/**/*.test.tsx'],
  },
});
