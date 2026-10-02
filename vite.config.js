import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/recharts/')) return 'recharts';
          if (id.includes('/node_modules/lucide-react/')) return 'icons';
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
          if (id.includes('/node_modules/crypto-js/')) return 'crypto';
          if (/\/node_modules\/(react|react-dom|react-router-dom|scheduler)\//.test(id)) return 'vendor';
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    testTimeout: 60000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/assets/**',
        '**/*.svg',
        '**/*.png',
        '**/*.{jpg,jpeg,gif,webp,ico}',
        'src/main.jsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      }
    }
  }
})
