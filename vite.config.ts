/* eslint-disable import/no-extraneous-dependencies */
import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // @ts-expect-error - bad types or incompat with node16 module reso
    react(),
  ],
  build: {
    outDir: 'build',
    target: 'es2022',
    lib: {
      entry: {
        main: join(__dirname, 'src/index.ts'),
        'named-route': join(__dirname, 'src/named-route.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    minify: true,
    sourcemap: true,
  },
});
