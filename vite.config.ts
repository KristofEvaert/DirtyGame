import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/DirtyGame/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000,
    target: 'es2015'
  },
  server: {
    port: 3000,
    open: true
  }
})
