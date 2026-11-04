import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { open: '/html/index.html' },
  build: { rollupOptions: { input: 'html/index.html' } },
})
