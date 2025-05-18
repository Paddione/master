// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Explicitly set the TypeScript configuration file
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // Specify exactly which config to use
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})