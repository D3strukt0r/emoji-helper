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
  build: {
    minify: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Place asset in each corresponding folder "build/{img,font,etc.}/*".
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|avif|webp/i.test(extType)) {
            extType = 'img';
          } else if (/woff2?|otf|ttf|eot/.test(extType)) {
            extType = 'font';
          }

          console.log('assetFileNames', {name: assetInfo.name, type: assetInfo.type}, extType);
          if (assetInfo.name.startsWith('src/')) {
            return `${extType}/[name]2.[hash][extname]`;
          }

          return `${extType}/[name].[hash][extname]`;
        },
        chunkFileNames: (chunkInfo) => {
          console.log('chunkFileNames', {name: chunkInfo.name});
          // if name ends with .html, remove it
          if (chunkInfo.name.endsWith('.html')) {
            return `js/${chunkInfo.name.substring(0, chunkInfo.name.length - '.html'.length)}.[hash].js`;
          }
          return `js/[name].[hash].js`;
        },
        entryFileNames: (chunkInfo) => {
          console.log('entryFileNames', {name: chunkInfo.name});
          return `js/[name].[hash].js`;
        },
      },
    },
  },
  server: {
    // Even though it's the default, still needed for CRXJS
    // TODO: Fix Dev Server, still doesn't resolve all files (e.g. CSS)
    port: 5174,
    hmr: {
      port: 5175,
    },
  }
});
