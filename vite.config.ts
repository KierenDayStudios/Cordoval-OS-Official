import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const isElectronBuild = process.env.ELECTRON_BUILD === 'true';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: isElectronBuild ? './' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-helmet-async'],
              ai: ['@google/genai'],
              ui: ['lucide-react', 'motion', 'recharts'],
              pdf: ['pdf-lib', 'pdfjs-dist', 'jspdf'],
              editor: ['fabric', 'pixi.js']
            }
          }
        }
      },
      optimizeDeps: {
        include: [
          'firebase/app',
          'firebase/auth',
          'firebase/firestore',
          'firebase/storage',
          'firebase/functions'
        ],
        esbuildOptions: {
          target: 'es2020'
        }
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: (isElectronBuild ? 'none' : 'autoUpdate') as 'autoUpdate',
          injectRegister: false,
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'Cordoval OS',
            short_name: 'Cordoval OS',
            description: 'Cordoval OS - The Local First OS for Business Builders and Work',
            theme_color: '#ffffff',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.ELECTRON_APP': JSON.stringify(isElectronBuild)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});