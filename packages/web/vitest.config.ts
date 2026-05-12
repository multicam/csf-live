import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: '@csf-live/shared/constants',
        replacement: path.resolve(__dirname, '../shared/constants.ts'),
      },
      {
        find: '@csf-live/shared',
        replacement: path.resolve(__dirname, '../shared/types.ts'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
