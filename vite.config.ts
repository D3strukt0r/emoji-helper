import * as path from 'path';
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import vitePugPlugin from 'vite-plugin-pug-transformer';
import manifest from './manifest.config';
import { version } from './package.json';
import emojis from './public/img/emoji.json';

export default defineConfig({
  plugins: [
    vitePugPlugin({
      pugLocals: {
        version,
        emojis,
      },
    }),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Enable for debugging locally
  // build: {
  //   minify: false,
  // },
  server: {
    // Even though it's the default, still needed for CRXJS
    // TODO: Fix Dev Server, still doesn't resolve all files (e.g. CSS)
    port: 5174,
    hmr: {
      port: 5175,
    },
  }
});
