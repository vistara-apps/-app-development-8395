import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      events: 'events',
      stream: 'stream',
      crypto: 'crypto-browserify',
      assert: 'assert',
      url: 'url',
      path: 'path-browserify',
      os: 'os-browserify',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'events', 'util'],
  },
})
