import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/fr/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/en/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/nl/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
