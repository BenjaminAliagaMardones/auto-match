import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // react-use-websocket es CJS puro; sin esto Vite entrega el objeto del
    // módulo en lugar del hook (default export) y el chat crashea.
    needsInterop: ['react-use-websocket'],
  },
})
