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
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    testTimeout: 15000,
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
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
