import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Anything the app requests at /api/... is forwarded to the backend
    // (FastAPI on port 8000). The "/api" prefix is stripped before forwarding,
    // so the app calling /api/orders actually hits http://127.0.0.1:8000/orders.
    // This keeps the backend address in ONE place and avoids browser CORS issues.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
