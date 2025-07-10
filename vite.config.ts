import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import { fileURLToPath } from 'url';

// Establish __dirname for ESM context.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load environment variables (consider filtering sensitive keys if needed)
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/locales/*.json',
            dest: 'locales',
          },
          {
            src: 'src/assets/fonts/*',
            dest: 'assets/fonts',
          },
        ],
      }),
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const paths = id.split('node_modules/')[1].split('/');
              return `vendor-${paths[0]}`;
            }
          },
        },
      },
    },
    base: '/portal/',
    define: {
      // Caution: Exposing entire env may leak sensitive info.
      'process.env': env,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
