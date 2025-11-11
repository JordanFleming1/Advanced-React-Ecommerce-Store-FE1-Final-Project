/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Fix for React is not defined errors in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  // @ts-expect-error - Vitest configuration
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // React 19 compatibility fixes
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
})
