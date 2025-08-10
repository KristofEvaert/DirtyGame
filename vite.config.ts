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
      }
    },
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    open: true
  }
})
