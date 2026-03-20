import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@csf-live/shared': path.resolve(__dirname, '../shared/types.ts'),
      '@csf-live/shared/constants': path.resolve(__dirname, '../shared/constants.ts'),
    },
  },
})
